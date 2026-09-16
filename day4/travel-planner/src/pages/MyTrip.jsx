import { Trash2 } from "lucide-react";
import useTripStore from "../store/tripStore";

function MyTrip() {
  const { trip, removeFromTrip } = useTripStore();

  // Group places by country
  const groupedTrips = trip.reduce((groups, attraction) => {
    const country = attraction.country || "Unknown Country";

    if (!groups[country]) {
      groups[country] = [];
    }

    groups[country].push(attraction);

    return groups;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold">My Trip</h1>

        <p className="mt-2 text-gray-500">
          Your planned destinations and places to visit.
        </p>

        {trip.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold">Your trip is empty</h2>

            <p className="mt-2 text-sm text-gray-500">
              Explore a destination and add places to your trip.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {Object.entries(groupedTrips).map(([country, places]) => (
              <section key={country}>
                {/* Country */}
                <h2 className="text-2xl font-bold">{country}</h2>

                <p className="mt-1 text-sm text-gray-500">
                  {places.length} place
                  {places.length !== 1 && "s"} added
                </p>

                {/* Places */}
                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {places.map((attraction) => (
                    <div
                      key={attraction.xid}
                      className="rounded-xl bg-white p-5 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold">
                        {attraction.name}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        {attraction.kinds
                          ? attraction.kinds.split(",")[0].replaceAll("_", " ")
                          : "Tourist attraction"}
                      </p>

                      <button
                        onClick={() => removeFromTrip(attraction.xid)}
                        className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyTrip;
