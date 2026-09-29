import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3, TrainFront } from "lucide-react";

import useBookingStore from "../store/bookingStore";

function TrainResults() {
  const navigate = useNavigate();

  const { from, to, journeyDate, quota, trains, setSelectedTrain } =
    useBookingStore();

  if (!from || !to || !journeyDate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <TrainFront className="mx-auto mb-4 text-red-600" size={48} />

          <h1 className="text-2xl font-bold text-slate-900">
            Search details not found
          </h1>

          <p className="mt-2 text-slate-500">Please search for trains first.</p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            Search Trains
          </button>
        </div>
      </div>
    );
  }

  const handleSelectTrain = (item) => {
    setSelectedTrain(item);
    navigate("/train");
  };

  const formatDate = (dateString) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <button
          onClick={() => navigate("/search")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Modify Search
        </button>

        {/* Journey Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Journey</p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">
                  {from.name}
                </h1>

                <ArrowRight size={18} className="text-red-500" />

                <h1 className="text-xl font-bold text-slate-900">{to.name}</h1>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {from.code} → {to.code}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 px-5 py-3">
              <p className="text-sm font-semibold text-red-700">
                {formatDate(journeyDate)}
              </p>

              <p className="mt-1 text-sm text-red-600">
                {quota === "GN" ? "General Quota" : quota}
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Available Trains
            </h2>

            <span className="text-sm font-medium text-slate-500">
              {trains.length} {trains.length === 1 ? "train" : "trains"} found
            </span>
          </div>

          {trains.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <TrainFront size={42} className="mx-auto mb-4 text-slate-400" />

              <h3 className="text-lg font-bold text-slate-900">
                No trains found for this date
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                There are no direct trains available for this route on the
                selected journey date.
              </p>

              <button
                onClick={() => navigate("/search")}
                className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
              >
                Try Another Date
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {trains.map((item) => (
                <div
                  key={item.train.number}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md"
                >
                  {/* Train Header */}
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <TrainFront size={21} />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {item.train.number}
                        </h3>

                        <p className="text-sm font-semibold text-slate-700">
                          {item.train.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.train.type}
                        </p>
                      </div>
                    </div>

                    <span className="w-fit rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.train.type}
                    </span>
                  </div>

                  {/* Journey */}
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Departure */}
                    <div>
                      <p className="text-sm text-slate-500">Departure</p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {item.from.departure}
                      </p>

                      <p className="font-semibold text-slate-700">
                        {from.code}
                      </p>

                      <p className="text-sm text-slate-500">{from.name}</p>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col items-center justify-center">
                      <Clock3 size={19} className="mb-2 text-red-600" />

                      <p className="text-sm font-semibold text-slate-700">
                        {item.duration
                          ? `${Math.floor(item.duration / 60)}h ${
                              item.duration % 60
                            }m`
                          : "Duration unavailable"}
                      </p>

                      <div className="mt-2 h-px w-full bg-slate-200" />

                      <p className="mt-2 text-xs text-slate-500">
                        {item.distance ? `${item.distance} km` : ""}
                      </p>
                    </div>

                    {/* Arrival */}
                    <div className="md:text-right">
                      <p className="text-sm text-slate-500">Arrival</p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {item.to.arrival}
                      </p>

                      <p className="font-semibold text-slate-700">{to.code}</p>

                      <p className="text-sm text-slate-500">{to.name}</p>
                    </div>
                  </div>

                  {/* Days + Select */}
                  <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => {
                          const active = item.train.runDays?.some((runDay) =>
                            runDay.toLowerCase().startsWith(day.toLowerCase()),
                          );

                          return (
                            <span
                              key={day}
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                active
                                  ? "border-red-200 bg-red-50 text-red-600"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                              }`}
                            >
                              {day}
                            </span>
                          );
                        },
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectTrain(item)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
                    >
                      Select Train
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainResults;
