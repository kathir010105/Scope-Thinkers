import { Heart, Plus, Check } from "lucide-react";
import useTripStore from "../store/tripStore";

function AttractionCard({ attraction, country }) {
  const { toggleFavorite, addToTrip, isFavorite, isInTrip } = useTripStore();

  const favorite = isFavorite(attraction.xid);
  const inTrip = isInTrip(attraction.xid);

  const imageUrl = attraction.image || attraction.preview?.source;

  const categories = attraction.kinds
    ? attraction.kinds
        .split(",")
        .filter(
          (kind) =>
            !["interesting_places", "urban_environment", "other"].includes(
              kind,
            ),
        )
        .slice(0, 2)
        .map((kind) =>
          kind
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        )
        .join(" · ")
    : "Tourist attraction";

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* Image */}
      <div className="h-48 w-full bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={attraction.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name + Favorite */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{attraction.name}</h3>

          <button
            onClick={() => toggleFavorite(attraction)}
            className={`rounded-full p-2 transition ${
              favorite
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <Heart
              className="h-5 w-5"
              fill={favorite ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Category */}
        <p className="mt-2 text-sm text-gray-500">
          {categories || "Tourist attraction"}
        </p>

        {/* Distance */}
        {attraction.dist && (
          <p className="mt-4 text-sm text-gray-500">
            {(attraction.dist / 1000).toFixed(1)} km away
          </p>
        )}

        {/* Add to Trip */}
        <button
          onClick={() =>
            addToTrip({
              ...attraction,
              country,
            })
          }
          disabled={inTrip}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            inTrip
              ? "bg-green-100 text-green-700"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {inTrip ? (
            <>
              <Check className="h-4 w-4" />
              Added to Trip
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to Trip
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AttractionCard;
