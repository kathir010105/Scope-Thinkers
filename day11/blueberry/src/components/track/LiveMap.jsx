import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function LiveMap({ partnerLatitude, partnerLongitude, deliveryAddress }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const partnerMarker = useRef(null);
  const destinationMarker = useRef(null);

  const [destination, setDestination] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // ------------------------------------
  // GEOCODE DELIVERY ADDRESS
  // ------------------------------------
  useEffect(() => {
    if (!deliveryAddress) return;

    async function geocodeAddress() {
      try {
        const encodedAddress = encodeURIComponent(deliveryAddress);

        const response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/forward?q=${encodedAddress}&limit=1&country=IN&access_token=${mapboxgl.accessToken}`,
        );

        const data = await response.json();

        if (!data.features?.length) {
          console.error("Destination not found");
          return;
        }

        const [longitude, latitude] = data.features[0].geometry.coordinates;

        setDestination({
          latitude,
          longitude,
        });
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    }

    geocodeAddress();
  }, [deliveryAddress]);

  // ------------------------------------
  // INITIALIZE MAP
  // ------------------------------------
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [partnerLongitude, partnerLatitude],
      zoom: 13,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapReady(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ------------------------------------
  // PARTNER MARKER
  // ------------------------------------
  useEffect(() => {
    if (!mapReady || !map.current) return;

    const lng = Number(partnerLongitude);
    const lat = Number(partnerLatitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    if (!partnerMarker.current) {
      const element = document.createElement("div");

      element.className = "blueberry-partner-marker";

      element.innerHTML = `
        <div style="
          width:42px;
          height:42px;
          border-radius:50%;
          background:#2563eb;
          border:4px solid white;
          box-shadow:0 4px 15px rgba(0,0,0,0.25);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:20px;
        ">
          🛵
        </div>
      `;

      partnerMarker.current = new mapboxgl.Marker({
        element,
      })
        .setLngLat([lng, lat])
        .addTo(map.current);
    } else {
      partnerMarker.current.setLngLat([lng, lat]);
    }

    map.current.easeTo({
      center: [lng, lat],
      duration: 800,
    });
  }, [partnerLatitude, partnerLongitude, mapReady]);

  // ------------------------------------
  // DESTINATION MARKER
  // ------------------------------------
  useEffect(() => {
    if (!mapReady || !map.current || !destination) {
      return;
    }

    const lng = Number(destination.longitude);
    const lat = Number(destination.latitude);

    if (!destinationMarker.current) {
      const element = document.createElement("div");

      element.innerHTML = `
        <div style="
          width:38px;
          height:38px;
          border-radius:50%;
          background:#16a34a;
          border:4px solid white;
          box-shadow:0 4px 15px rgba(0,0,0,0.25);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:18px;
        ">
          📍
        </div>
      `;

      destinationMarker.current = new mapboxgl.Marker({
        element,
      })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }

    drawRoute();
  }, [destination, mapReady, partnerLatitude, partnerLongitude]);

  // ------------------------------------
  // DRAW ROUTE
  // ------------------------------------
  async function drawRoute() {
    if (!map.current || !destination) return;

    const start = `${partnerLongitude},${partnerLatitude}`;

    const end = `${destination.longitude},${destination.latitude}`;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
      );

      const data = await response.json();

      if (!data.routes?.length) {
        console.error("No route found");
        return;
      }

      const route = data.routes[0].geometry;

      const routeData = {
        type: "Feature",
        geometry: route,
        properties: {},
      };

      // Remove previous route
      if (map.current.getLayer("delivery-route")) {
        map.current.removeLayer("delivery-route");
      }

      if (map.current.getSource("delivery-route")) {
        map.current.removeSource("delivery-route");
      }

      map.current.addSource("delivery-route", {
        type: "geojson",
        data: routeData,
      });

      map.current.addLayer({
        id: "delivery-route",
        type: "line",
        source: "delivery-route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-width": 5,
          "line-opacity": 0.8,
          "line-color": "#2563eb",
        },
      });

      // Fit both locations
      const bounds = new mapboxgl.LngLatBounds();

      bounds.extend([Number(partnerLongitude), Number(partnerLatitude)]);

      bounds.extend([
        Number(destination.longitude),
        Number(destination.latitude),
      ]);

      map.current.fitBounds(bounds, {
        padding: 80,
        duration: 1000,
      });
    } catch (error) {
      console.error("Route error:", error);
    }
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* LIVE BADGE */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
        Live Tracking
      </div>
    </div>
  );
}

export default LiveMap;
