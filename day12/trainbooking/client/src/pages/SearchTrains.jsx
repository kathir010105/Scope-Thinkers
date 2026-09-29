import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  CalendarDays,
  Loader2,
  Search,
  TrainFront,
} from "lucide-react";

import StationAutocomplete from "../components/StationAutocomplete";
import useBookingStore from "../store/bookingStore";

function SearchTrains() {
  const navigate = useNavigate();

  const { from, to, journeyDate, quota, setJourney, setTrains } =
    useBookingStore();

  const [fromText, setFromText] = useState(
    from ? `${from.name} (${from.code})` : "",
  );

  const [toText, setToText] = useState(to ? `${to.name} (${to.code})` : "");

  const [date, setDate] = useState(journeyDate || "");

  const [searchQuota, setSearchQuota] = useState(quota || "GN");

  const [searching, setSearching] = useState(false);

  const [searchError, setSearchError] = useState("");

  const handleSwap = () => {
    const oldFrom = from;
    const oldFromText = fromText;

    setJourney({
      from: to,
      to: oldFrom,
      journeyDate: date,
      quota: searchQuota,
    });

    setFromText(toText);
    setToText(oldFromText);
  };

  const handleSearch = async () => {
    console.error("===== SEARCH BUTTON CLICKED =====");

    setSearchError("");

    let selectedFrom = from;
    let selectedTo = to;

    if (!selectedFrom || !selectedTo) {
      setSearchError("Please select both origin and destination stations.");
      return;
    }

    if (selectedFrom.code === selectedTo.code) {
      setSearchError("Origin and destination cannot be the same.");
      return;
    }

    if (!date) {
      setSearchError("Please select a journey date.");
      return;
    }

    try {
      setSearching(true);

      const response = await fetch(
        `http://localhost:5000/api/trains/between/${selectedFrom.code}/${selectedTo.code}?date=${date}`,
      );

      const result = await response.json();
      console.log("RAILRADAR TRAIN SEARCH", {
        from: selectedFrom.code,
        to: selectedTo.code,
        date,
        response: result,
      });

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to search trains.");
      }

      // Store everything in Zustand
      setJourney({
        from: selectedFrom,
        to: selectedTo,
        journeyDate: date,
        quota: searchQuota,
      });

      setTrains(result.data?.trains || []);

      navigate("/train-results");
    } catch (error) {
      console.error("Train search error:", error);

      setSearchError(error.message || "Failed to search trains.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-red-600"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <TrainFront size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Search Trains
              </h1>

              <p className="text-sm text-slate-500">
                Search trains between two railway stations.
              </p>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          {/* Stations */}
          <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            {/* From */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                From
              </label>

              <StationAutocomplete
                value={fromText}
                selectedStation={from}
                onTextChange={(text) => {
                  setFromText(text);

                  // Clear stored station if user edits
                  if (from) {
                    setJourney({
                      from: null,
                      to,
                      journeyDate: date,
                      quota: searchQuota,
                    });
                  }
                }}
                onSelect={(station) => {
                  setJourney({
                    from: station,
                    to,
                    journeyDate: date,
                    quota: searchQuota,
                  });

                  setFromText(`${station.name} (${station.code})`);
                }}
                placeholder="Departure station"
              />
            </div>

            {/* Swap */}
            <button
              type="button"
              onClick={handleSwap}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 lg:flex"
              title="Swap stations"
            >
              <ArrowLeftRight size={18} />
            </button>

            {/* To */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                To
              </label>

              <StationAutocomplete
                value={toText}
                selectedStation={to}
                onTextChange={(text) => {
                  setToText(text);

                  if (to) {
                    setJourney({
                      from,
                      to: null,
                      journeyDate: date,
                      quota: searchQuota,
                    });
                  }
                }}
                onSelect={(station) => {
                  setJourney({
                    from,
                    to: station,
                    journeyDate: date,
                    quota: searchQuota,
                  });

                  setToText(`${station.name} (${station.code})`);
                }}
                placeholder="Destination station"
              />
            </div>
          </div>

          {/* Date / Quota */}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Journey Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500"
                />

                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setDate(e.target.value);

                    setJourney({
                      from,
                      to,
                      journeyDate: e.target.value,
                      quota: searchQuota,
                    });
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            {/* Quota */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Quota
              </label>

              <select
                value={searchQuota}
                onChange={(e) => {
                  const value = e.target.value;

                  setSearchQuota(value);

                  setJourney({
                    from,
                    to,
                    journeyDate: date,
                    quota: value,
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                <option value="GN">General</option>

                <option value="TQ">Tatkal</option>

                <option value="PT">Premium Tatkal</option>

                <option value="LD">Ladies</option>

                <option value="SS">Senior Citizen</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {searchError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {searchError}
            </div>
          )}

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {searching ? (
              <>
                <Loader2 size={19} className="animate-spin" />
                Searching Trains...
              </>
            ) : (
              <>
                <Search size={19} />
                Search Trains
              </>
            )}
          </button>
        </div>

        {/* Selected Journey */}
        {from && to && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Selected Journey
            </p>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="font-bold text-slate-900">{from.name}</span>

              <ArrowLeftRight
                size={17}
                className="hidden text-red-500 sm:block"
              />

              <span className="font-bold text-slate-900">{to.name}</span>

              <span className="text-sm text-slate-500">
                ({from.code} → {to.code})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchTrains;
