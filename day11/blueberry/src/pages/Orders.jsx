import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Utensils,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import BlueberryNav from "../components/layout/BlueberryNav";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function Orders() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [refreshing, setRefreshing] = useState(false);

  // ==================================================
  // FETCH ORDERS
  // ==================================================

  const fetchOrders = async (showRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // ------------------------------------------------
      // GET USER ORDERS
      // ------------------------------------------------

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (orderError) {
        throw orderError;
      }

      if (!orderData?.length) {
        setOrders([]);
        return;
      }

      // ------------------------------------------------
      // GET RESTAURANTS
      // ------------------------------------------------

      const restaurantIds = [
        ...new Set(
          orderData.map((order) => order.restaurant_id).filter(Boolean),
        ),
      ];

      let restaurantMap = {};

      if (restaurantIds.length > 0) {
        const { data: restaurants, error: restaurantError } = await supabase
          .from("restaurants")
          .select("id, name")
          .in("id", restaurantIds);

        if (restaurantError) {
          console.warn("Restaurant lookup failed:", restaurantError);
        } else {
          restaurantMap = Object.fromEntries(
            (restaurants || []).map((restaurant) => [
              restaurant.id,
              restaurant,
            ]),
          );
        }
      }

      // ------------------------------------------------
      // GET ORDER ITEMS
      // ------------------------------------------------

      const orderIds = orderData.map((order) => order.id);

      const { data: orderItems, error: orderItemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (orderItemsError) {
        throw orderItemsError;
      }

      // ------------------------------------------------
      // GET PAYMENTS
      // ------------------------------------------------

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("id, order_id, method, status, gateway, amount, paid_at")
        .in("order_id", orderIds);

      if (paymentsError) {
        console.warn("Payment lookup failed:", paymentsError);
      }

      // ------------------------------------------------
      // GET DELIVERIES
      // ------------------------------------------------

      const { data: deliveries, error: deliveriesError } = await supabase
        .from("deliveries")
        .select("*")
        .in("order_id", orderIds);

      if (deliveriesError) {
        console.warn("Delivery lookup failed:", deliveriesError);
      }

      // ------------------------------------------------
      // GET DELIVERY PARTNERS
      // ------------------------------------------------

      const partnerIds = [
        ...new Set(
          (deliveries || [])
            .map((delivery) => delivery.delivery_partner_id)
            .filter(Boolean),
        ),
      ];

      let partnerMap = {};

      if (partnerIds.length > 0) {
        const { data: partners, error: partnersError } = await supabase
          .from("delivery_partners")
          .select(
            "id, name, phone, profile_image_url, vehicle_type, vehicle_number",
          )
          .in("id", partnerIds);

        if (partnersError) {
          console.warn("Delivery partner lookup failed:", partnersError);
        } else {
          partnerMap = Object.fromEntries(
            (partners || []).map((partner) => [partner.id, partner]),
          );
        }
      }

      // ------------------------------------------------
      // COMBINE EVERYTHING
      // ------------------------------------------------

      const combinedOrders = orderData.map((order) => {
        const items = (orderItems || []).filter(
          (item) => item.order_id === order.id,
        );

        const payment = (payments || []).find(
          (payment) => payment.order_id === order.id,
        );

        const delivery = (deliveries || []).find(
          (delivery) => delivery.order_id === order.id,
        );

        const partner = delivery
          ? partnerMap[delivery.delivery_partner_id]
          : null;

        return {
          ...order,

          restaurant: restaurantMap[order.restaurant_id] || null,

          items,

          payment: payment || null,

          delivery: delivery || null,

          partner: partner || null,
        };
      });

      setOrders(combinedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);

      setError(err.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  // ==================================================
  // STATUS HELPERS
  // ==================================================

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "placed":
        return {
          label: "Order Placed",
          icon: Package,
          color: "text-blue-600",
          bg: "bg-blue-50",
        };

      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          color: "text-blue-600",
          bg: "bg-blue-50",
        };

      case "preparing":
        return {
          label: "Preparing",
          icon: Utensils,
          color: "text-orange-600",
          bg: "bg-orange-50",
        };

      case "picked_up":
        return {
          label: "Picked Up",
          icon: Package,
          color: "text-purple-600",
          bg: "bg-purple-50",
        };

      case "on_the_way":
        return {
          label: "On the Way",
          icon: Truck,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        };

      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: AlertCircle,
          color: "text-red-600",
          bg: "bg-red-50",
        };

      default:
        return {
          label: status || "Placed",
          icon: Clock3,
          color: "text-gray-600",
          bg: "bg-gray-100",
        };
    }
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================================================
  // CALCULATE ITEM COUNT
  // ==================================================

  const getItemCount = (items) => {
    return items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlueberryNav />

        <main className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Loading your orders
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Fetching your Blueberry orders...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // NOT LOGGED IN
  // ==================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlueberryNav />

        <main className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <UserIcon />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Login to view your orders
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Your order history will appear here.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlueberryNav />

        <main className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Couldn't load orders
            </h1>

            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              onClick={() => fetchOrders()}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // NO ORDERS
  // ==================================================

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlueberryNav />

        <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </button>
          </div>

          <div className="mt-10 rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
              <ShoppingBag className="h-9 w-9 text-blue-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              No orders yet
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Once you place your first order, it will appear here.
            </p>

            <button
              onClick={() => navigate("/explore")}
              className="mt-7 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Explore Restaurants
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // ORDERS PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <BlueberryNav />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        {/* HEADER */}

        <div className="flex items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="mb-4 flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-gray-500 hover:bg-white hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </button>

            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

            <p className="mt-2 text-sm text-gray-500">
              View your order history and track current deliveries.
            </p>
          </div>

          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm ring-1 ring-gray-100 transition hover:text-blue-600 disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* ORDER COUNT */}

        <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
          <ShoppingBag className="h-4 w-4" />

          <span>
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {/* ORDER LIST */}

        <div className="mt-5 space-y-5">
          {orders.map((order) => {
            const status = getStatusInfo(order.status);

            const StatusIcon = status.icon;

            const itemCount = getItemCount(order.items);

            const hasDelivery = Boolean(order.delivery);

            const canTrack = Boolean(order.delivery);

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100"
              >
                {/* ORDER HEADER */}

                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">
                          {order.restaurant?.name || "Restaurant"}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />

                          {status.label}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>Order #{order.order_number}</span>

                        <span>{formatDate(order.created_at)}</span>

                        <span>{formatTime(order.created_at)}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ₹{Number(order.total_amount).toFixed(0)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ORDER BODY */}

                <div className="px-5 py-5 sm:px-6">
                  {/* ITEMS */}

                  <div className="space-y-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                            <Utensils className="h-4 w-4 text-gray-400" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {item.item_name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item.quantity} × ₹
                              {Number(item.unit_price).toFixed(0)}
                            </p>
                          </div>
                        </div>

                        <p className="flex-shrink-0 text-sm font-semibold text-gray-900">
                          ₹
                          {(
                            Number(item.unit_price) * Number(item.quantity)
                          ).toFixed(0)}
                        </p>
                      </div>
                    ))}

                    {order.items.length > 3 && (
                      <p className="pt-1 text-xs text-gray-400">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* DELIVERY PARTNER */}

                  {hasDelivery && order.partner && (
                    <div className="mt-5 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                          <Truck className="h-5 w-5 text-blue-600" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-blue-600">
                            Delivery partner
                          </p>

                          <p className="mt-0.5 font-bold text-gray-900">
                            {order.partner.name}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {order.partner.vehicle_type}

                            {order.partner.vehicle_number &&
                              ` • ${order.partner.vehicle_number}`}
                          </p>
                        </div>

                        {order.partner.phone && (
                          <a
                            href={`tel:${order.partner.phone}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white"
                            title="Call delivery partner"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ADDRESS */}

                  <div className="mt-5 flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Delivery address
                      </p>

                      <p className="mt-1 text-sm leading-5 text-gray-700">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-500"
                          : order.status === "cancelled"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                    />

                    <span className="text-xs font-medium text-gray-500">
                      {order.status === "delivered"
                        ? "Delivered"
                        : order.status === "cancelled"
                          ? "Order cancelled"
                          : "Your order is being prepared"}
                    </span>
                  </div>

                  {canTrack ? (
                    <button
                      onClick={() => navigate(`/track-order/${order.id}`)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      <MapPin className="h-4 w-4" />
                      Track Order
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-200 px-5 py-3 text-sm font-bold text-gray-500"
                    >
                      <Clock3 className="h-4 w-4" />
                      Awaiting Delivery Assignment
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// Small local icon component
function UserIcon() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-8 w-8 text-blue-600"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.2 3.2-5 7-5s6.2 1.8 7 5" />
      </svg>
    </div>
  );
}

export default Orders;
