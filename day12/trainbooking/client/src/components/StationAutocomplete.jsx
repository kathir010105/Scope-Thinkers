import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

function StationAutocomplete({
  value,
  selectedStation,
  onTextChange,
  onSelect,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Cache previous searches
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const query = value.trim().toLowerCase();

    // Station already selected
    if (selectedStation) {
      setSuggestions([]);
      return;
    }

    // Too short
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // If we already searched this query
    if (cacheRef.current.has(query)) {
      setSuggestions(cacheRef.current.get(query));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Wait before sending request
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/stations/search?q=${encodeURIComponent(
            query,
          )}`,
          {
            signal: controller.signal,
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to search stations.");
        }

        const stations = result.data || [];

        // Save result in cache
        cacheRef.current.set(query, stations);

        setSuggestions(stations);
      } catch (error) {
        // Ignore cancelled requests
        if (error.name === "AbortError") {
          return;
        }

        console.error("Station search error:", error);
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 700);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, selectedStation]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}

      <div className="relative">
        <MapPin
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onTextChange(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />

        {loading && (
          <Loader2
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-red-500"
          />
        )}
      </div>

      {/* Suggestions */}

      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {suggestions.map((station) => (
            <button
              key={station.code}
              type="button"
              onClick={() => {
                onSelect(station);
                setSuggestions([]);
                setFocused(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-red-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <MapPin size={17} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {station.name}
                </p>

                <p className="text-xs text-slate-500">
                  {station.code}
                  {station.city ? ` · ${station.city}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default StationAutocomplete;
