import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  CreditCard,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import BlueberryNav from "../components/layout/BlueberryNav";
import useCartStore from "../store/cartStore";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useAuth();

  const { items, restaurantId, restaurantName, emptyCart, getSubtotal } =
    useCartStore();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Chennai",
    pincode: "",
  });

  // ==================================================
  // CALCULATIONS
  // ==================================================

  const subtotal = getSubtotal();

  const deliveryFee = items.length > 0 ? 40 : 0;

  const tax = subtotal * 0.05;

  const total = subtotal + deliveryFee + tax;

  // ==================================================
  // LOAD USER DETAILS
  // ==================================================

  useEffect(() => {
    if (!user) return;

    setFormData((previous) => ({
      ...previous,
      email: user.email || previous.email,
      name: user.user_metadata?.full_name || previous.name,
    }));
  }, [user]);

  // ==================================================
  // LOAD LAST ORDER SUMMARY
  // ==================================================

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("blueberry_last_order");

    if (!savedOrder) return;

    try {
      setOrderSummary(JSON.parse(savedOrder));
    } catch (error) {
      console.error("Could not load saved order:", error);
    }
  }, []);

  // ==================================================
  // CHECK CASHFREE RETURN
  // ==================================================

  useEffect(() => {
    const orderId = searchParams.get("order_id");

    if (!orderId) return;

    verifyPayment(orderId);
  }, [searchParams]);

  // ==================================================
  // INPUT HANDLER
  // ==================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==================================================
  // CREATE BLUEBERRY ORDER
  // ==================================================

  const createBlueberryOrder = async (cashfreeOrderId) => {
    try {
      if (!user?.id) {
        throw new Error("You must be logged in to place an order.");
      }

      // ------------------------------------------------
      // CHECK WHETHER THIS CASHFREE ORDER WAS ALREADY
      // PROCESSED
      // ------------------------------------------------

      const { data: existingPayment, error: existingPaymentError } =
        await supabase
          .from("payments")
          .select("order_id")
          .eq("gateway", "cashfree")
          .eq("gateway_payment_id", cashfreeOrderId)
          .maybeSingle();

      if (existingPaymentError) {
        throw existingPaymentError;
      }

      // Already processed
      if (existingPayment?.order_id) {
        const { data: existingOrder, error: existingOrderError } =
          await supabase
            .from("orders")
            .select("*")
            .eq("id", existingPayment.order_id)
            .single();

        if (existingOrderError) {
          throw existingOrderError;
        }

        return existingOrder;
      }

      // ------------------------------------------------
      // GET SAVED CHECKOUT DATA
      // ------------------------------------------------

      const savedOrder = sessionStorage.getItem("blueberry_pending_order");

      if (!savedOrder) {
        throw new Error("Order information was lost. Please contact support.");
      }

      const pendingOrder = JSON.parse(savedOrder);

      if (!pendingOrder.items?.length) {
        throw new Error("No items were found for this order.");
      }

      if (!pendingOrder.restaurantId) {
        throw new Error("Restaurant information is missing.");
      }

      // ------------------------------------------------
      // CREATE ORDER
      // ------------------------------------------------

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
        
          user_id: user.id,

          restaurant_id: pendingOrder.restaurantId,

          delivery_name: pendingOrder.name,

          delivery_phone: pendingOrder.phone,

          delivery_address: `${pendingOrder.address}, ${pendingOrder.city} - ${pendingOrder.pincode}`,

          delivery_instructions: null,

          subtotal: Number(pendingOrder.subtotal),

          delivery_fee: Number(pendingOrder.deliveryFee),

          discount: 0,

          tax: Number(pendingOrder.tax),

          total_amount: Number(pendingOrder.total),

          status: "placed",
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      console.log("Blueberry order created:", order);

      // ------------------------------------------------
      // CREATE ORDER ITEMS
      // ------------------------------------------------

      const orderItems = pendingOrder.items.map((item) => ({
        order_id: order.id,

        menu_item_id: item.menu_item_id,

        item_name: item.menu_items?.name || item.name || "Food item",

        quantity: Number(item.quantity),

        unit_price: Number(item.unit_price),

        special_instructions: item.special_instructions || null,
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (orderItemsError) {
        throw orderItemsError;
      }

      console.log("Order items created:", orderItems);

      // ------------------------------------------------
      // CREATE PAYMENT RECORD
      // ------------------------------------------------

      const { error: paymentError } = await supabase.from("payments").insert({
        order_id: order.id,

        method: "upi",

        status: "success",

        gateway: "cashfree",

        gateway_payment_id: cashfreeOrderId,

        amount: Number(pendingOrder.total),

        paid_at: new Date().toISOString(),
      });

      if (paymentError) {
        throw paymentError;
      }

      console.log("Payment record created.");

      // ------------------------------------------------
      // FIND AVAILABLE DELIVERY PARTNER
      // ------------------------------------------------

      const { data: partner, error: partnerError } = await supabase
        .from("delivery_partners")
        .select("*")
        .eq("is_available", true)
        .eq("is_active", true)
        .not("current_latitude", "is", null)
        .not("current_longitude", "is", null)
        .limit(1)
        .maybeSingle();

      if (partnerError) {
        console.error("Delivery partner lookup failed:", partnerError);
      }

      // ------------------------------------------------
      // DELIVERY
      // ------------------------------------------------

      let delivery = null;

      if (partner) {
        console.log("Assigning delivery partner:", partner.name);

        // ----------------------------------------------
        // CREATE DELIVERY
        // ----------------------------------------------

        const { data: createdDelivery, error: deliveryError } = await supabase
          .from("deliveries")
          .insert({
            order_id: order.id,

            delivery_partner_id: partner.id,

            assigned_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (deliveryError) {
          throw deliveryError;
        }

        delivery = createdDelivery;

        console.log("Delivery created:", delivery);

        // ----------------------------------------------
        // CREATE INITIAL TRACKING LOCATION
        // ----------------------------------------------

        const { error: trackingError } = await supabase
          .from("delivery_tracking")
          .insert({
            delivery_id: delivery.id,

            latitude: partner.current_latitude,

            longitude: partner.current_longitude,

            status: "assigned",
          });

        if (trackingError) {
          throw trackingError;
        }

        console.log("Initial delivery tracking created.");

        // ----------------------------------------------
        // MARK PARTNER AS BUSY
        // ----------------------------------------------

        const { error: partnerUpdateError } = await supabase
          .from("delivery_partners")
          .update({
            is_available: false,

            updated_at: new Date().toISOString(),
          })
          .eq("id", partner.id);

        if (partnerUpdateError) {
          console.warn(
            "Could not update partner availability:",
            partnerUpdateError,
          );
        }

        console.log(`${partner.name} assigned successfully.`);
      } else {
        console.warn(
          "No delivery partner available. Order will remain unassigned.",
        );
      }

      // ------------------------------------------------
      // SAVE LAST ORDER
      // ------------------------------------------------

      const lastOrder = {
        orderId: order.id,

        orderNumber: order.order_number,

        restaurantName: pendingOrder.restaurantName || "Restaurant",

        total: Number(pendingOrder.total),

        deliveryId: delivery?.id || null,

        deliveryPartnerId: partner?.id || null,

        deliveryPartnerName: partner?.name || null,

        deliveryPartnerPhone: partner?.phone || null,

        vehicleType: partner?.vehicle_type || null,

        vehicleNumber: partner?.vehicle_number || null,
      };

      sessionStorage.setItem("blueberry_last_order", JSON.stringify(lastOrder));

      setOrderSummary(lastOrder);

      // ------------------------------------------------
      // EMPTY CART
      // ------------------------------------------------

      await emptyCart();

      // ------------------------------------------------
      // REMOVE PENDING ORDER
      // ------------------------------------------------

      sessionStorage.removeItem("blueberry_pending_order");

      console.log("================================");

      console.log("BLUEBERRY ORDER COMPLETED");

      console.log("Order:", order.id);

      console.log("Order number:", order.order_number);

      console.log("Delivery partner:", partner?.name || "Not assigned");

      console.log("================================");

      return order;
    } catch (error) {
      console.error("Blueberry order creation failed:", error);

      throw error;
    }
  };

  // ==================================================
  // VERIFY CASHFREE PAYMENT
  // ==================================================

  const verifyPayment = async (orderId) => {
    const verificationKey = `blueberry_payment_${orderId}`;

    // ------------------------------------------------
    // PREVENT DUPLICATE PROCESSING
    // ------------------------------------------------

    const existingVerification = sessionStorage.getItem(verificationKey);

    if (existingVerification === "processing") {
      return;
    }

    // ------------------------------------------------
    // ALREADY COMPLETED
    // ------------------------------------------------

    if (existingVerification === "completed") {
      setPaymentStatus("PAID");

      const savedOrder = sessionStorage.getItem("blueberry_last_order");

      if (savedOrder) {
        try {
          setOrderSummary(JSON.parse(savedOrder));
        } catch (error) {
          console.error("Could not load saved order:", error);
        }
      }

      return;
    }

    sessionStorage.setItem(verificationKey, "processing");

    try {
      setVerifying(true);

      setPaymentStatus(null);

      // ------------------------------------------------
      // VERIFY PAYMENT WITH BACKEND
      // ------------------------------------------------

      const response = await fetch(
        `http://localhost:5000/api/payment/verify/${orderId}`,
      );

      const data = await response.json();

      console.log("Payment verification:", data);

      if (!response.ok || !data.success) {
        sessionStorage.removeItem(verificationKey);

        setPaymentStatus("FAILED");

        return;
      }

      // ------------------------------------------------
      // PAYMENT SUCCESS
      // ------------------------------------------------

      if (data.order.status === "PAID") {
        try {
          const order = await createBlueberryOrder(orderId);

          const savedOrder = sessionStorage.getItem("blueberry_last_order");

          if (savedOrder) {
            try {
              setOrderSummary(JSON.parse(savedOrder));
            } catch (error) {
              console.error("Could not parse saved order:", error);
            }
          } else if (order) {
            setOrderSummary({
              orderId: order.id,

              orderNumber: order.order_number,

              restaurantName: restaurantName || "Restaurant",

              total: Number(order.total_amount || total),
            });
          }

          sessionStorage.setItem(verificationKey, "completed");

          setPaymentStatus("PAID");
        } catch (orderError) {
          console.error("Order creation failed:", orderError);

          sessionStorage.removeItem(verificationKey);

          setPaymentStatus("FAILED");

          alert(
            orderError.message ||
              "Payment succeeded, but we could not create your Blueberry order.",
          );
        }
      } else {
        sessionStorage.removeItem(verificationKey);

        setPaymentStatus(data.order.status);
      }
    } catch (error) {
      console.error("Payment verification error:", error);

      sessionStorage.removeItem(verificationKey);

      setPaymentStatus("FAILED");
    } finally {
      setVerifying(false);
    }
  };

  // ==================================================
  // START CASHFREE PAYMENT
  // ==================================================

  const handlePayment = async () => {
    // ------------------------------------------------
    // LOGIN CHECK
    // ------------------------------------------------

    if (!user?.id) {
      alert("Please login before placing your order.");

      navigate("/login");

      return;
    }

    // ------------------------------------------------
    // RESTAURANT CHECK
    // ------------------------------------------------

    if (!restaurantId) {
      alert("Restaurant information is missing from your cart.");

      navigate("/cart");

      return;
    }

    // ------------------------------------------------
    // VALIDATION
    // ------------------------------------------------

    if (!formData.name.trim()) {
      alert("Please enter your name.");

      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email.");

      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter your phone number.");

      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      alert("Please enter a valid 10-digit Indian phone number.");

      return;
    }

    if (!formData.address.trim()) {
      alert("Please enter your delivery address.");

      return;
    }

    if (!formData.pincode.trim()) {
      alert("Please enter your pincode.");

      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      alert("Please enter a valid 6-digit pincode.");

      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty.");

      navigate("/cart");

      return;
    }

    try {
      setLoading(true);

      // ------------------------------------------------
      // SAVE PENDING ORDER
      // ------------------------------------------------

      const pendingOrder = {
        restaurantId,

        restaurantName,

        name: formData.name,

        email: formData.email,

        phone: formData.phone,

        address: formData.address,

        city: formData.city,

        pincode: formData.pincode,

        subtotal,

        deliveryFee,

        tax,

        total,

        items,
      };

      sessionStorage.setItem(
        "blueberry_pending_order",
        JSON.stringify(pendingOrder),
      );

      console.log("Pending Blueberry order saved.");

      // ------------------------------------------------
      // CREATE CASHFREE ORDER
      // ------------------------------------------------

      const response = await fetch(
        "http://localhost:5000/api/payment/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            amount: total,

            customerName: formData.name,

            customerEmail: formData.email,

            customerPhone: formData.phone,
          }),
        },
      );

      const data = await response.json();

      console.log("Create Cashfree order response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create payment order");
      }

      const paymentSessionId = data.order.paymentSessionId;

      if (!paymentSessionId) {
        throw new Error("Cashfree payment session was not created.");
      }

      // ------------------------------------------------
      // CASHFREE SDK
      // ------------------------------------------------

      if (!window.Cashfree) {
        throw new Error(
          "Cashfree SDK is not loaded. Please restart the Vite server.",
        );
      }

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      // ------------------------------------------------
      // OPEN CASHFREE
      // ------------------------------------------------

      cashfree.checkout({
        paymentSessionId,
      });
    } catch (error) {
      console.error("Payment error:", error);

      alert(error.message || "Something went wrong while starting payment.");

      sessionStorage.removeItem("blueberry_pending_order");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // EMPTY CART
  // ==================================================

  if (items.length === 0 && !searchParams.get("order_id")) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlueberryNav />

        <main className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <ShoppingBag className="h-9 w-9 text-blue-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Your cart is empty
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Add some delicious food before checking out.
            </p>

            <button
              onClick={() => navigate("/explore")}
              className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Explore Restaurants
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // VERIFYING PAYMENT
  // ==================================================

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlueberryNav />

        <main className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Verifying your payment
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Please wait while we confirm your payment with Cashfree.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // PAYMENT SUCCESS
  // ==================================================

  if (paymentStatus === "PAID") {
    const displayRestaurant =
      orderSummary?.restaurantName || restaurantName || "Restaurant";

    const displayTotal = orderSummary?.total ?? total;

    return (
      <div className="min-h-screen bg-gray-50">
        <BlueberryNav />

        <main className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              Payment successful
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Your payment has been successfully verified. Your Blueberry order
              has been placed.
            </p>

            <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-left">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-gray-500">Restaurant</span>

                <span className="text-right text-sm font-semibold text-gray-900">
                  {displayRestaurant}
                </span>
              </div>

              {orderSummary?.orderNumber && (
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-gray-500">Order number</span>

                  <span className="text-sm font-semibold text-gray-900">
                    #{orderSummary.orderNumber}
                  </span>
                </div>
              )}

              <div className="mt-3 flex justify-between">
                <span className="text-sm text-gray-500">Amount paid</span>

                <span className="text-sm font-bold text-blue-600">
                  ₹{Number(displayTotal).toFixed(0)}
                </span>
              </div>

              {orderSummary?.deliveryPartnerName && (
                <div className="mt-3 flex justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Delivery partner
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-900">
                    {orderSummary.deliveryPartnerName}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-left ring-1 ring-blue-100">
              <p className="text-sm font-semibold text-blue-900">
                Your order is being prepared.
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                You can track your delivery and view your delivery partner from
                My Orders.
              </p>
            </div>

            <button
              onClick={() => navigate("/orders")}
              className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              View My Orders
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // PAYMENT FAILED
  // ==================================================

  if (paymentStatus === "FAILED" || paymentStatus === "EXPIRED") {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlueberryNav />

        <main className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Payment not completed
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              We couldn't confirm a successful payment for this order.
            </p>

            <button
              onClick={() => {
                window.history.replaceState({}, "", "/checkout");

                window.location.reload();
              }}
              className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // CHECKOUT PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <BlueberryNav />

      {/* HEADER */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Cart
          </button>
        </div>
      </header>

      {/* PAGE TITLE */}

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

        <p className="mt-2 text-sm text-gray-500">
          Complete your delivery details and pay securely.
        </p>
      </div>

      {/* CONTENT */}

      <main className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}

          <section className="space-y-6">
            {/* CONTACT DETAILS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <User className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">Contact details</h2>

                  <p className="text-sm text-gray-500">
                    We'll use these details for your order.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full name
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* PHONE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone number
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DELIVERY ADDRESS */}

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">Delivery address</h2>

                  <p className="text-sm text-gray-500">
                    Where should we deliver your food?
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* ADDRESS */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="House no, street, area..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* CITY + PINCODE */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      placeholder="600001"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENT INFO */}

            <div className="rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Secure payment
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    You'll be redirected to Cashfree's secure checkout to
                    complete your payment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT */}

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Ordering from
                  </p>

                  <h2 className="font-bold text-gray-900">
                    {restaurantName || "Restaurant"}
                  </h2>
                </div>
              </div>

              {/* ITEMS */}

              <div className="mt-6 space-y-4">
                {items.map((item) => {
                  const food = item.menu_items;

                  const itemTotal =
                    Number(item.unit_price) * Number(item.quantity);

                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {food?.image_url ? (
                          <img
                            src={food.image_url}
                            alt={food.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {food?.name || "Food item"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.quantity} × ₹
                          {Number(item.unit_price).toFixed(0)}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        ₹{itemTotal.toFixed(0)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* BILL */}

              <div className="my-6 border-t border-dashed border-gray-200" />

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Item total</span>

                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery fee</span>

                  <span className="font-medium text-gray-900">
                    ₹{deliveryFee.toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes</span>

                  <span className="font-medium text-gray-900">
                    ₹{tax.toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-gray-100" />

              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">Total</span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹{total.toFixed(0)}
                </span>
              </div>

              {/* PAY BUTTON */}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Preparing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay ₹{total.toFixed(0)}
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                Payments are securely processed through Cashfree Sandbox.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
