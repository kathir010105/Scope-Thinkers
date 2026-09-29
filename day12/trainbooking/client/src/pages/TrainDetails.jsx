import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  TrainFront,
  Clock3,
  CalendarDays,
  IndianRupee,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";

import useBookingStore from "../store/bookingStore";

function TrainDetails() {
  const navigate = useNavigate();

  const {
    from,
    to,
    journeyDate,
    quota,
    selectedTrain,
    selectedClass,
    availability,
    fare,
    totalFare,
    setClassDetails,
  } = useBookingStore();

  // ================================
  // LOCAL STATE
  // ================================

  const [availableClasses, setAvailableClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // QUOTA
  // ================================

  const quotaCodeMap = {
    General: "GN",
    Tatkal: "TQ",
    "Premium Tatkal": "PT",
    Ladies: "LD",
    "Defence Quota": "DF",
    Foreign: "FT",
    "Senior Citizen": "SS",
  };

  const quotaCode = quotaCodeMap[quota] || quota || "GN";

  // ================================
  // FETCH TRAIN CLASSES
  // ================================

 useEffect(() => {
   if (!selectedTrain?.train?.number) return;

   const fetchTrainClasses = async () => {
     try {
       setClassesLoading(true);
       setError("");

       const trainNumber = selectedTrain.train.number;

       console.log("FETCHING COACHES FOR TRAIN:", trainNumber);

       const response = await fetch(
         `http://localhost:5000/api/train-details/${trainNumber}`,
       );

       const result = await response.json();

       console.log("TRAIN COACH API RESPONSE:", result);

       if (!response.ok || !result.success) {
         throw new Error(result.message || "Failed to fetch train classes.");
       }

       const coaches = result.data?.coaches || [];

       console.log("COACHES:", coaches);

       const uniqueClasses = [];

       coaches.forEach((coach) => {
         if (!coach.classType || !coach.hasSeats) {
           return;
         }

         const exists = uniqueClasses.some(
           (item) => item.code === coach.classType,
         );

         if (!exists) {
           uniqueClasses.push({
             code: coach.classType,
             name: coach.className || coach.classType,
             description:
               coach.classType === "CC"
                 ? "AC Chair Car"
                 : coach.classType === "EC"
                   ? "Executive Chair Car"
                   : "Available travel class",
             totalBerths: coach.totalBerths,
             hasSeats: coach.hasSeats,
           });
         }
       });

       console.log("AVAILABLE CLASSES:", uniqueClasses);

       setAvailableClasses(uniqueClasses);
     } catch (error) {
       console.error("Class fetch error:", error);
       setError(error.message);
       setAvailableClasses([]);
     } finally {
       setClassesLoading(false);
     }
   };

   fetchTrainClasses();
 }, [selectedTrain]);

  // ================================
  // FALLBACK IF BOOKING STATE MISSING
  // ================================

  if (!selectedTrain || !from || !to || !journeyDate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <TrainFront className="mx-auto mb-4 text-red-600" size={48} />

          <h1 className="text-2xl font-bold text-slate-900">
            Train details not found
          </h1>

          <p className="mt-2 text-slate-500">
            Please select a train from the search results.
          </p>

          <button
            onClick={() => navigate("/search")}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Search Trains
          </button>
        </div>
      </div>
    );
  }

  // ================================
  // AVAILABILITY STYLING
  // ================================

  const getAvailabilityStyle = (status) => {
    if (!status) {
      return {
        container: "bg-slate-50 border-slate-200",
        text: "text-slate-700",
        icon: null,
      };
    }

    const upperStatus = String(status).toUpperCase();

    if (upperStatus.startsWith("AVAILABLE")) {
      return {
        container: "bg-green-50 border-green-200",
        text: "text-green-700",
        icon: <CheckCircle2 size={18} />,
      };
    }

    if (upperStatus.startsWith("RAC")) {
      return {
        container: "bg-amber-50 border-amber-200",
        text: "text-amber-700",
        icon: <Users size={18} />,
      };
    }

    if (
      upperStatus.includes("WL") ||
      upperStatus.includes("GNWL") ||
      upperStatus.includes("RLWL") ||
      upperStatus.includes("PQWL")
    ) {
      return {
        container: "bg-orange-50 border-orange-200",
        text: "text-orange-700",
        icon: <Users size={18} />,
      };
    }

    if (upperStatus.startsWith("REGRET")) {
      return {
        container: "bg-red-50 border-red-200",
        text: "text-red-700",
        icon: <AlertCircle size={18} />,
      };
    }

    if (upperStatus.includes("NOT AVAILABLE")) {
      return {
        container: "bg-slate-50 border-slate-200",
        text: "text-slate-500",
        icon: <AlertCircle size={18} />,
      };
    }

    return {
      container: "bg-slate-50 border-slate-200",
      text: "text-slate-700",
      icon: null,
    };
  };

  // ================================
  // FORMAT DATE
  // ================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return {
        day: "-",
        date: "-",
      };
    }

    const currentDate = new Date(`${dateString}T00:00:00`);

    return {
      day: currentDate.toLocaleDateString("en-IN", {
        weekday: "short",
      }),

      date: currentDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    };
  };

  // ================================
  // SELECT CLASS
  // ================================

  const handleClassSelect = async (classCode) => {
    setError("");
    setLoading(true);

    // Clear previous class data
    setClassDetails({
      selectedClass: classCode,
      availability: [],
      fare: null,
      totalFare: 0,
    });

    try {
      const params = new URLSearchParams({
        source: from.code,
        destination: to.code,
        journeyDate,
        classCode,
        quotaCode,
      });

      console.log("CLASS REQUEST", {
        trainNumber: selectedTrain.train.number,
        source: from.code,
        destination: to.code,
        journeyDate,
        classCode,
        quotaCode,
      });

      // ==================================
      // SEAT + FARE API REQUESTS
      // ==================================

      const [seatResponse, fareResponse] = await Promise.all([
        fetch(
          `http://localhost:5000/api/seats/${selectedTrain.train.number}?${params.toString()}`,
        ),

        fetch(
          `http://localhost:5000/api/fares/${selectedTrain.train.number}?${params.toString()}`,
        ),
      ]);

      const seatResult = await seatResponse.json();
      const fareResult = await fareResponse.json();

      console.log("SEAT API RESPONSE", seatResult);
      console.log("FARE API RESPONSE", fareResult);

      // ==================================
      // SEAT API ERROR
      // ==================================

      if (!seatResponse.ok || !seatResult.success) {
        throw new Error(
          seatResult.message || "Failed to fetch seat availability.",
        );
      }

      // ==================================
      // FARE API ERROR
      // ==================================

      if (!fareResponse.ok || !fareResult.success) {
        throw new Error(fareResult.message || "Failed to fetch fare.");
      }

      // ==================================
      // AVAILABILITY
      // ==================================

      const availabilityData =
        seatResult.data?.avlDayList ||
        seatResult.data?.calendar ||
        seatResult.data?.availability ||
        [];

      // ==================================
      // FARE
      // ==================================

      const fareData = fareResult.data || null;

      const calculatedTotal = Number(
        fareData?.totalFare || fareData?.total || fareData?.fare || 0,
      );

      console.log("PARSED AVAILABILITY:", availabilityData);
      console.log("PARSED FARE:", fareData);
      console.log("TOTAL FARE:", calculatedTotal);

      // ==================================
      // STORE IN ZUSTAND
      // ==================================

      setClassDetails({
        selectedClass: classCode,
        availability: Array.isArray(availabilityData) ? availabilityData : [],
        fare: fareData,
        totalFare: calculatedTotal,
      });
    } catch (error) {
      console.error("Class selection error:", error);

      setError(error.message || "Failed to fetch availability and fare.");

      setClassDetails({
        selectedClass: classCode,
        availability: [],
        fare: null,
        totalFare: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // RENDER
  // ================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28">
      <div className="mx-auto max-w-6xl">
        {/* ============================
            BACK
        ============================ */}

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Back to train results
        </button>

        {/* ============================
            TRAIN HEADER
        ============================ */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Train name */}

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <TrainFront size={24} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {selectedTrain.train.name}
                </h1>

                <p className="text-sm text-slate-500">
                  Train No. {selectedTrain.train.number}
                </p>
              </div>
            </div>

            {/* Quota */}

            <div className="rounded-xl bg-red-50 px-5 py-3">
              <p className="text-sm font-semibold text-red-700">
                {quota === "GN" ? "General Quota" : quota}
              </p>

              <p className="mt-1 text-sm text-red-600">
                Journey: {journeyDate}
              </p>
            </div>
          </div>

          {/* ============================
              JOURNEY
          ============================ */}

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Departure */}

            <div>
              <p className="text-sm text-slate-500">Departure</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {selectedTrain.from?.departure || "--"}
              </p>

              <p className="font-semibold text-slate-700">{from.code}</p>

              <p className="text-sm text-slate-500">{from.name}</p>
            </div>

            {/* Duration */}

            <div className="flex flex-col items-center justify-center">
              <Clock3 className="mb-2 text-red-600" size={20} />

              <p className="text-sm font-semibold text-slate-700">
                {selectedTrain.duration
                  ? `${Math.floor(selectedTrain.duration / 60)}h ${
                      selectedTrain.duration % 60
                    }m`
                  : "Duration unavailable"}
              </p>

              <div className="mt-2 h-px w-full bg-slate-200" />
            </div>

            {/* Arrival */}

            <div className="md:text-right">
              <p className="text-sm text-slate-500">Arrival</p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {selectedTrain.to?.arrival || "--"}
              </p>

              <p className="font-semibold text-slate-700">{to.code}</p>

              <p className="text-sm text-slate-500">{to.name}</p>
            </div>
          </div>
        </div>

        {/* ============================
            SELECT CLASS
        ============================ */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">Select Class</h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a class to check availability and fare.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Loading classes */}

            {classesLoading ? (
              <div className="col-span-full flex items-center justify-center py-10 text-slate-500">
                <Loader2 size={22} className="mr-3 animate-spin text-red-600" />
                Loading available classes...
              </div>
            ) : availableClasses.length === 0 ? (
              /* No classes */

              <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                No reserved classes were found for this train.
              </div>
            ) : (
              /* Available classes */

              availableClasses.map((item) => {
                const isSelected = selectedClass === item.code;

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleClassSelect(item.code)}
                    disabled={loading}
                    className={`rounded-xl border p-5 text-left transition ${
                      isSelected
                        ? "border-red-600 bg-red-50 ring-2 ring-red-100"
                        : "border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {/* Class Code */}

                        <p
                          className={`text-lg font-bold ${
                            isSelected ? "text-red-700" : "text-slate-900"
                          }`}
                        >
                          {item.code}
                        </p>

                        {/* Class Name */}

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {item.name}
                        </p>

                        {/* Description */}

                        {item.description && (
                          <p className="mt-1 text-xs text-slate-500">
                            {item.description}
                          </p>
                        )}

                        {/* Seats per coach */}

                        {item.totalBerths > 0 && (
                          <p className="mt-3 text-xs text-slate-500">
                            {item.totalBerths} seats/coach
                          </p>
                        )}
                      </div>

                      {/* Loading */}

                      {isSelected && loading && (
                        <Loader2
                          size={18}
                          className="shrink-0 animate-spin text-red-600"
                        />
                      )}
                    </div>

                    {/* Seat indicator */}

                    {item.hasSeats && (
                      <div className="mt-4">
                        <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          Seat selection available
                        </span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============================
            ERROR
        ============================ */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ============================
            LOADING
        ============================ */}

        {loading && (
          <div className="mt-6 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 size={22} className="animate-spin text-red-600" />

              <span className="font-medium">
                Fetching availability and fare...
              </span>
            </div>
          </div>
        )}

        {/* ============================
            AVAILABILITY
        ============================ */}

        {!loading && selectedClass && availability.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <CalendarDays size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Availability
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedClass} · {quotaCode}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {availability.map((item, index) => {
                const dateValue =
                  item.availablityDate || item.availabilityDate || item.date;

                const statusValue =
                  item.availablityStatus ||
                  item.availabilityStatus ||
                  item.status;

                const dateInfo = formatDate(dateValue);

                const style = getAvailabilityStyle(statusValue);

                return (
                  <div
                    key={dateValue || `${statusValue}-${index}`}
                    className={`rounded-xl border p-4 ${style.container}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {dateInfo.day}
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {dateInfo.date}
                        </p>
                      </div>

                      <div className={style.text}>{style.icon}</div>
                    </div>

                    <div className={`mt-4 text-sm font-bold ${style.text}`}>
                      {statusValue || "Unknown"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================
            FARE
        ============================ */}

        {!loading && fare && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <IndianRupee size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Fare Details
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedClass} · {quotaCode}
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-xl space-y-4">
              {/* Base Fare */}

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Base Fare</span>

                <span className="font-semibold text-slate-900">
                  ₹{fare.breakdown?.baseFare ?? 0}
                </span>
              </div>

              {/* Reservation */}

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Reservation Charge</span>

                <span className="font-semibold text-slate-900">
                  ₹{fare.breakdown?.reservationCharge ?? 0}
                </span>
              </div>

              {/* Superfast */}

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Superfast Charge</span>

                <span className="font-semibold text-slate-900">
                  ₹{fare.breakdown?.superfastCharge ?? 0}
                </span>
              </div>

              {/* GST */}

              {fare.breakdown?.goodsServiceTax !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">GST</span>

                  <span className="font-semibold text-slate-900">
                    ₹{fare.breakdown.goodsServiceTax}
                  </span>
                </div>
              )}

              {/* Catering */}

              {fare.breakdown?.cateringCharge !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Catering Charge</span>

                  <span className="font-semibold text-slate-900">
                    ₹{fare.breakdown.cateringCharge}
                  </span>
                </div>
              )}

              {/* Dynamic Fare */}

              {fare.breakdown?.dynamicFare !== undefined &&
                Number(fare.breakdown.dynamicFare) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dynamic Fare</span>

                    <span className="font-semibold text-slate-900">
                      ₹{fare.breakdown.dynamicFare}
                    </span>
                  </div>
                )}

              {/* Total */}

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    Total Fare
                  </span>

                  <span className="text-2xl font-bold text-red-600">
                    ₹{totalFare}
                  </span>
                </div>
              </div>

              {/* Continue */}

              <button
                onClick={() => navigate("/passengers")}
                disabled={!fare || !selectedClass}
                className="mt-6 w-full rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Passenger Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainDetails;
