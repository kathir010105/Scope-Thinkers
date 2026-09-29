import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Search,
  ShieldCheck,
  TrainFront,
} from "lucide-react";

import StationAutocomplete from "../components/StationAutocomplete";
import useBookingStore from "../store/bookingStore";

function Home() {
  const navigate = useNavigate();

  const setJourney = useBookingStore((state) => state.setJourney);

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");

  const [date, setDate] = useState("");
  const [quota, setQuota] = useState("GN");

  const handleSearch = () => {
    if (!from || !to) {
      alert("Please select both origin and destination stations.");
      return;
    }

    if (from.code === to.code) {
      alert("Origin and destination cannot be the same.");
      return;
    }

    if (!date) {
      alert("Please select a journey date.");
      return;
    }

    // Store journey in Zustand
    setJourney({
      from,
      to,
      journeyDate: date,
      quota,
    });

    navigate("/train-results");
  };

  const handleSwap = () => {
    const oldFrom = from;
    const oldFromText = fromText;

    setFrom(to);
    setFromText(toText);

    setTo(oldFrom);
    setToText(oldFromText);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-36">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-100 blur-3xl opacity-60" />

        <div className="absolute -left-32 top-48 h-80 w-80 rounded-full bg-red-50 blur-3xl opacity-70" />

        <div className="relative mx-auto max-w-6xl">
          {/* Heading */}
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              <TrainFront size={16} />
              Simple railway booking
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Plan your journey.
              <br />
              <span className="text-red-600">Book your train.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Search trains, check availability, compare fares, and manage your
              railway bookings from one place.
            </p>
          </div>

          {/* Search Card */}
          <div className="relative mt-12 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Search size={21} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Search Trains
                </h2>

                <p className="text-sm text-slate-500">
                  Find trains between any two stations
                </p>
              </div>
            </div>

            {/* From / To */}
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  From
                </label>

                <StationAutocomplete
                  value={fromText}
                  selectedStation={from}
                  onTextChange={(text) => {
                    setFromText(text);
                    setFrom(null);
                  }}
                  onSelect={(station) => {
                    setFrom(station);

                    setFromText(`${station.name} (${station.code})`);
                  }}
                  placeholder="Enter departure station"
                />
              </div>

              {/* Swap */}
              <button
                type="button"
                onClick={handleSwap}
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 lg:flex"
                title="Swap stations"
              >
                ↕
              </button>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  To
                </label>

                <StationAutocomplete
                  value={toText}
                  selectedStation={to}
                  onTextChange={(text) => {
                    setToText(text);
                    setTo(null);
                  }}
                  onSelect={(station) => {
                    setTo(station);

                    setToText(`${station.name} (${station.code})`);
                  }}
                  placeholder="Enter destination station"
                />
              </div>
            </div>

            {/* Date / Quota / Search */}
            <div className="mt-5 grid gap-4 md:grid-cols-3">
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
                    onChange={(e) => setDate(e.target.value)}
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
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                >
                  <option value="GN">General</option>

                  <option value="TQ">Tatkal</option>

                  <option value="PT">Premium Tatkal</option>

                  <option value="LD">Ladies</option>

                  <option value="SS">Senior Citizen</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white transition hover:bg-red-700"
                >
                  Search Trains
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Search size={19} />
              </div>

              <h3 className="font-bold text-slate-900">Search Trains</h3>

              <p className="mt-1 text-sm text-slate-500">
                Find trains and check their schedules.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <CalendarDays size={19} />
              </div>

              <h3 className="font-bold text-slate-900">Check Availability</h3>

              <p className="mt-1 text-sm text-slate-500">
                View class-wise seat availability.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ShieldCheck size={19} />
              </div>

              <h3 className="font-bold text-slate-900">Secure Booking</h3>

              <p className="mt-1 text-sm text-slate-500">
                Keep your bookings organized in one place.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-3xl bg-red-600 p-8 text-white shadow-xl sm:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Ready for your next journey?
                </h2>

                <p className="mt-2 max-w-xl text-red-100">
                  Search your route and find the right train, class and fare.
                </p>
              </div>

              <button
                onClick={() => navigate("/search")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
              >
                Explore Trains
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
