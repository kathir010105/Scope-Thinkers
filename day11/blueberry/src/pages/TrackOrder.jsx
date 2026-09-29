import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  MapPin,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import DeliverySimulator from "../components/track/DeliverySimulator";

import BlueberryNav from "../components/layout/BlueberryNav";
import LiveMap from "../components/track/LiveMap";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [partner, setPartner] = useState(null);
  const [tracking, setTracking] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !orderId) return;

    loadTrackingData();
  }, [user, orderId]);

  async function loadTrackingData() {
    try {
      setLoading(true);
      setError("");

      // -----------------------------
      // 1. Get order
      // -----------------------------
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (orderError) throw orderError;

      setOrder(orderData);

      // -----------------------------
      // 2. Get delivery
      // -----------------------------
      const { data: deliveryData, error: deliveryError } = await supabase
        .from("deliveries")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (deliveryError) throw deliveryError;

      setDelivery(deliveryData);

      // -----------------------------
      // 3. Get delivery partner
      // -----------------------------
      if (deliveryData.delivery_partner_id) {
        const { data: partnerData, error: partnerError } = await supabase
          .from("delivery_partners")
          .select("*")
          .eq("id", deliveryData.delivery_partner_id)
          .single();

        if (partnerError) throw partnerError;

        setPartner(partnerData);
      }

      // -----------------------------
      // 4. Get latest tracking point
      // -----------------------------
      const { data: trackingData, error: trackingError } = await supabase
        .from("delivery_tracking")
        .select("*")
        .eq("delivery_id", deliveryData.id)
        .order("recorded_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (trackingError) throw trackingError;

      setTracking(trackingData);
    } catch (err) {
      console.error("Track order error:", err);
      setError("Unable to load tracking information.");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------
  // REALTIME DELIVERY TRACKING
  // -----------------------------------
  useEffect(() => {
    if (!delivery?.id) return;

    const channel = supabase
      .channel(`delivery-tracking-${delivery.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_tracking",
          filter: `delivery_id=eq.${delivery.id}`,
        },
        (payload) => {
          console.log("New tracking location:", payload.new);

          setTracking(payload.new);

          // Update partner position too
          setPartner((current) => {
            if (!current) return current;

            return {
              ...current,
              current_latitude: payload.new.latitude,
              current_longitude: payload.new.longitude,
            };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [delivery?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <BlueberryNav />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="text-sm font-medium text-slate-600">
              Loading live tracking...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <BlueberryNav />

        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-12 w-12 text-slate-400" />

            <h2 className="text-xl font-bold text-slate-900">
              Order not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              We couldn't load tracking information for this order.
            </p>

            <button
              onClick={() => navigate("/orders")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentLatitude = tracking?.latitude ?? partner?.current_latitude;

  const currentLongitude = tracking?.longitude ?? partner?.current_longitude;

  return (
    <div className="min-h-screen bg-slate-50">
      <BlueberryNav />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate("/orders")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Live Order Tracking
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                Order #{order.order_number}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Follow your delivery in real time
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
              Live
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* MAP */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="relative h-[500px] w-full">
              {currentLatitude && currentLongitude ? (
                <LiveMap
                  partnerLatitude={Number(currentLatitude)}
                  partnerLongitude={Number(currentLongitude)}
                  deliveryAddress={order.delivery_address}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <Navigation className="mx-auto mb-3 h-10 w-10 text-slate-400" />

                    <p className="font-semibold text-slate-700">
                      Waiting for delivery location
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Your delivery partner's location will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-5">
            {/* Delivery Partner */}
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Bike className="h-5 w-5 text-blue-600" />

                <h2 className="font-bold text-slate-900">Delivery Partner</h2>
              </div>

              {partner ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Bike size={26} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">
                        {partner.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {partner.vehicle_type}
                      </p>

                      <p className="text-xs text-slate-400">
                        {partner.vehicle_number}
                      </p>
                    </div>

                    {partner.phone && (
                      <a
                        href={`tel:${partner.phone}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 transition hover:bg-green-100"
                      >
                        <Phone size={18} />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Delivery partner hasn't been assigned yet.
                </p>
              )}
            </div>

            {/* Delivery Status */}
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="mb-5 font-bold text-slate-900">Delivery Status</h2>

              <div className="space-y-5">
                <StatusItem
                  icon={<CheckCircle2 size={18} />}
                  title="Order Placed"
                  active
                />

                <StatusItem
                  icon={<Package size={18} />}
                  title="Preparing"
                  active={
                    order.status === "preparing" ||
                    order.status === "ready" ||
                    order.status === "picked_up" ||
                    order.status === "out_for_delivery" ||
                    order.status === "delivered"
                  }
                />

                <StatusItem
                  icon={<Bike size={18} />}
                  title="Out for Delivery"
                  active={
                    order.status === "picked_up" ||
                    order.status === "out_for_delivery" ||
                    order.status === "delivered"
                  }
                />

                <StatusItem
                  icon={<MapPin size={18} />}
                  title="Delivered"
                  active={order.status === "delivered"}
                  last
                />
              </div>
            </div>
            {/* Delivery Simulation */}
            {delivery && partner && (
              <DeliverySimulator
                delivery={delivery}
                order={order}
                partner={partner}
                deliveryAddress={order.delivery_address}
                onLocationUpdate={(location) => {
                  setTracking((current) => ({
                    ...current,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    recorded_at: new Date().toISOString(),
                  }));
                }}
              />
            )}

            {/* Delivery Address */}
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />

                <h2 className="font-bold text-slate-900">Delivery Address</h2>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                {order.delivery_address}
              </p>
            </div>

            {/* Order Total */}
            <div className="rounded-3xl bg-blue-600 p-5 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100">Order Total</span>

                <span className="text-xl font-bold">
                  ₹{Number(order.total_amount).toFixed(0)}
                </span>
              </div>

              {tracking?.recorded_at && (
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-100">
                  <Clock size={14} />
                  Last updated{" "}
                  {new Date(tracking.recorded_at).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusItem({ icon, title, active, last }) {
  return (
    <div className="relative flex items-center gap-3">
      {!last && (
        <div className="absolute left-[9px] top-7 h-8 w-px bg-slate-200" />
      )}

      <div
        className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full ${
          active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"
        }`}
      >
        {active && icon}
      </div>

      <span
        className={`text-sm font-medium ${
          active ? "text-slate-900" : "text-slate-400"
        }`}
      >
        {title}
      </span>
    </div>
  );
}

export default TrackOrder;
