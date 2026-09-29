import { useEffect, useRef, useState } from "react";
import { Play, Square, Navigation, Clock, Route } from "lucide-react";

import mapboxgl from "mapbox-gl";
import { supabase } from "../../lib/supabase";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function DeliverySimulator({
  delivery,
  order,
  partner,
  deliveryAddress,
  onLocationUpdate,
}) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  const intervalRef = useRef(null);
  const routeRef = useRef([]);
  const indexRef = useRef(0);

  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, []);

  async function getDestination() {
    const encodedAddress = encodeURIComponent(deliveryAddress);

    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${encodedAddress}&limit=1&country=IN&access_token=${mapboxgl.accessToken}`,
    );

    const data = await response.json();

    if (!data.features?.length) {
      throw new Error("Destination could not be found.");
    }

    const [longitude, latitude] = data.features[0].geometry.coordinates;

    return {
      longitude,
      latitude,
    };
  }

  async function getRoute() {
    const destination = await getDestination();

    const start = `${partner.current_longitude},${partner.current_latitude}`;

    const end = `${destination.longitude},${destination.latitude}`;

    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
    );

    const data = await response.json();

    if (!data.routes?.length) {
      throw new Error("Could not find a delivery route.");
    }

    const route = data.routes[0];

    return {
      coordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration,
    };
  }

  async function startSimulation() {
    if (!delivery || !partner || !order) return;

    try {
      setRunning(true);
      setProgress(0);

      const route = await getRoute();

      routeRef.current = route.coordinates;
      indexRef.current = 0;

      setDistance(route.distance);

      /*
       * We intentionally use a faster demo speed.
       * Real delivery would obviously take much longer.
       */
      const demoInterval = 2500;

      intervalRef.current = setInterval(async () => {
        const coordinates = routeRef.current;

        if (indexRef.current >= coordinates.length) {
          await finishDelivery();
          return;
        }

        const [longitude, latitude] = coordinates[indexRef.current];

        const percentage =
          indexRef.current / Math.max(coordinates.length - 1, 1);

        setProgress(Math.round(percentage * 100));

        /*
         * Update order status
         */
        if (percentage < 0.15) {
          await updateOrderStatus("picked_up");
        } else if (percentage < 0.9) {
          await updateOrderStatus("out_for_delivery");
        }

        /*
         * Calculate approximate remaining distance
         */
        const remaining = calculateRemainingDistance(
          coordinates,
          indexRef.current,
        );

        setDistance(remaining);

        /*
         * Approximate ETA using 25 km/h
         */
        const etaMinutes = (remaining / 1000 / 25) * 60;

        setEta(Math.max(1, Math.ceil(etaMinutes)));

        /*
         * Insert new GPS point into Supabase
         */
        const { error } = await supabase.from("delivery_tracking").insert({
          delivery_id: delivery.id,
          latitude,
          longitude,
          status: percentage < 0.15 ? "picked_up" : "out_for_delivery",
        });

        if (error) {
          console.error("Tracking insert error:", error);
        }

        /*
         * Update delivery partner location
         */
        await supabase
          .from("delivery_partners")
          .update({
            current_latitude: latitude,
            current_longitude: longitude,
          })
          .eq("id", partner.id);

        /*
         * Tell TrackOrder immediately as well
         */
        if (onLocationUpdate) {
          onLocationUpdate({
            latitude,
            longitude,
          });
        }

        indexRef.current += 1;
      }, demoInterval);
    } catch (error) {
      console.error("Simulation error:", error);

      setRunning(false);

      alert(error.message || "Unable to start delivery simulation.");
    }
  }

  async function updateOrderStatus(status) {
    const { error } = await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", order.id);

    if (error) {
      console.error("Order status update error:", error);
    }
  }

  async function finishDelivery() {
    clearInterval(intervalRef.current);

    setRunning(false);
    setProgress(100);
    setDistance(0);
    setEta(0);

    /*
     * Final order status
     */
    await updateOrderStatus("delivered");

    /*
     * Mark delivery as completed
     */
    await supabase
      .from("deliveries")
      .update({
        delivered_at: new Date().toISOString(),
      })
      .eq("id", delivery.id);

    /*
     * Make partner available again
     */
    await supabase
      .from("delivery_partners")
      .update({
        is_available: true,
      })
      .eq("id", partner.id);

    if (onLocationUpdate) {
      const last = routeRef.current[routeRef.current.length - 1];

      if (last) {
        onLocationUpdate({
          latitude: last[1],
          longitude: last[0],
        });
      }
    }
  }

  function stopSimulation() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setRunning(false);
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />

            <h2 className="font-bold text-slate-900">Delivery Simulation</h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Demo mode for testing live tracking
          </p>
        </div>

        {!running ? (
          <button
            onClick={startSimulation}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Play size={16} />
            Start
          </button>
        ) : (
          <button
            onClick={stopSimulation}
            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <Square size={15} />
            Stop
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="font-medium text-slate-600">Delivery Progress</span>

          <span className="font-bold text-blue-600">{progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-slate-500">
            <Route size={15} />

            <span className="text-xs">Distance</span>
          </div>

          <p className="mt-1 font-bold text-slate-900">
            {distance !== null ? `${(distance / 1000).toFixed(1)} km` : "--"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={15} />

            <span className="text-xs">ETA</span>
          </div>

          <p className="mt-1 font-bold text-slate-900">
            {eta !== null ? (eta === 0 ? "Arrived" : `${eta} min`) : "--"}
          </p>
        </div>
      </div>

      {running && (
        <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Delivery partner is moving...
        </div>
      )}
    </div>
  );
}

function calculateRemainingDistance(coordinates, currentIndex) {
  let distance = 0;

  for (let i = currentIndex; i < coordinates.length - 1; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[i + 1];

    distance += calculateDistance(lat1, lon1, lat2, lon2);
  }

  return distance;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;

  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default DeliverySimulator;
