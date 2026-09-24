import { useEffect, useMemo, useState } from "react";

import { Search, MapPin, SlidersHorizontal, ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";

import BlueberryNav from "../components/layout/BlueberryNav";

import { getRestaurants } from "../services/restaurantService";

function Explore() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");

  // ============================================
  // LOAD RESTAURANTS
  // ============================================

  useEffect(() => {
    async function loadRestaurants() {
      try {
        setLoading(true);
        setError("");

        const data = await getRestaurants();

        setRestaurants(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load restaurants.");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  // ============================================
  // GET UNIQUE CUISINES
  // ============================================

  const cuisines = useMemo(() => {
    const unique = [
      ...new Set(
        restaurants.map((restaurant) => restaurant.cuisine).filter(Boolean),
      ),
    ];

    return ["All", ...unique];
  }, [restaurants]);

  // ============================================
  // FILTER RESTAURANTS
  // ============================================

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        !searchTerm ||
        restaurant.name?.toLowerCase().includes(searchTerm) ||
        restaurant.cuisine?.toLowerCase().includes(searchTerm);

      const matchesCuisine =
        selectedCuisine === "All" || restaurant.cuisine === selectedCuisine;

      return matchesSearch && matchesCuisine;
    });
  }, [restaurants, search, selectedCuisine]);

  // ============================================
  // BACK TO HOME
  // ============================================

  const BackToHome = () => {
    return (
      <div
        className="
          absolute
          left-6
          top-8
          z-[90]
          lg:left-24
        "
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            group
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-gray-700
            shadow-md
            transition
            duration-200
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
            hover:shadow-lg
          "
        >
          <ArrowLeft
            className="
              h-4
              w-4
              transition-transform
              duration-200
              group-hover:-translate-x-1
            "
          />
          Back to Home
        </button>
      </div>
    );
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div
        className="
          relative
          min-h-screen
          bg-gradient-to-b
          from-blue-50/70
          via-white
          to-white
        "
      >
        <BlueberryNav />

        <BackToHome />

        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            pt-40
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-4
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-blue-100
              border-t-blue-600
            "
          />

          <p className="text-gray-500">Finding delicious places...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return (
      <div
        className="
          relative
          min-h-screen
          bg-gradient-to-b
          from-blue-50/70
          via-white
          to-white
        "
      >
        <BlueberryNav />

        <BackToHome />

        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            pt-40
            text-center
          "
        >
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Something went wrong
          </h2>

          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <div
      className="
        relative
        min-h-screen
        bg-gradient-to-b
        from-blue-50/70
        via-white
        to-white
      "
    >
      {/* ====================================== */}
      {/* NAVBAR */}
      {/* ====================================== */}

      <BlueberryNav />

      {/* ====================================== */}
      {/* BACK TO HOME */}
      {/* ====================================== */}

      <BackToHome />

      {/* ====================================== */}
      {/* HEADER / SEARCH */}
      {/* ====================================== */}

      <section
        className="
          border-b
          border-blue-50
          bg-transparent
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-6
            pb-10
            pt-40
          "
        >
          {/* Location */}

          <div
            className="
              mb-2
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-blue-600
            "
          >
            <MapPin size={16} />

            <span>Chennai</span>
          </div>

          {/* Heading */}

          <h1
            className="
              text-4xl
              font-bold
              tracking-tight
              text-gray-900
            "
          >
            Find something delicious.
          </h1>

          {/* Description */}

          <p className="mt-3 max-w-2xl text-gray-500">
            Discover restaurants and dishes curated for your next craving.
          </p>

          {/* ================================== */}
          {/* SEARCH */}
          {/* ================================== */}

          <div
            className="
              mt-8
              flex
              max-w-3xl
              items-center
              gap-3
            "
          >
            {/* Search */}

            <div
              className="
                flex
                flex-1
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-white
                px-5
                py-4
                shadow-sm
                transition
                focus-within:border-blue-400
                focus-within:ring-4
                focus-within:ring-blue-100
              "
            >
              <Search size={20} className="text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search restaurants or cuisines..."
                className="
                  w-full
                  bg-transparent
                  text-sm
                  text-gray-900
                  outline-none
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Filters */}

            <button
              type="button"
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                border
                border-gray-200
                bg-white
                px-5
                py-4
                text-sm
                font-medium
                text-gray-700
                shadow-sm
                transition
                hover:border-blue-300
                hover:text-blue-600
              "
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* CUISINE FILTERS */}
      {/* ====================================== */}

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div
          className="
            flex
            gap-3
            overflow-x-auto
            pb-2
          "
        >
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              onClick={() => setSelectedCuisine(cuisine)}
              className={`
                whitespace-nowrap
                rounded-full
                px-5
                py-2.5
                text-sm
                font-medium
                transition

                ${
                  selectedCuisine === cuisine
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
                }
              `}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {/* ====================================== */}
      {/* RESTAURANTS */}
      {/* ====================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Restaurants</h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredRestaurants.length} places to explore
          </p>
        </div>

        {/* ================================== */}
        {/* NO RESULTS */}
        {/* ================================== */}

        {filteredRestaurants.length === 0 ? (
          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-gray-200
              py-20
              text-center
            "
          >
            <h3 className="text-lg font-semibold text-gray-900">
              No restaurants found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try another restaurant or cuisine.
            </p>
          </div>
        ) : (
          /* ================================== */
          /* RESTAURANT GRID */
          /* ================================== */

          <div
            className="
              grid
              gap-6
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {filteredRestaurants.map((restaurant) => (
              <article
                key={restaurant.id}
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                className="
                    group
                    cursor-pointer
                    overflow-hidden
                    rounded-3xl
                    border
                    border-gray-100
                    bg-white
                    shadow-sm
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                  "
              >
                {/* Image */}

                <div
                  className="
                      relative
                      h-52
                      overflow-hidden
                      bg-blue-50
                    "
                >
                  {restaurant.cover_image_url ? (
                    <img
                      src={restaurant.cover_image_url}
                      alt={restaurant.name}
                      className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-500
                          group-hover:scale-105
                        "
                    />
                  ) : (
                    <div
                      className="
                          flex
                          h-full
                          items-center
                          justify-center
                          bg-gradient-to-br
                          from-blue-100
                          to-blue-50
                        "
                    >
                      <span
                        className="
                            text-4xl
                            font-bold
                            text-blue-200
                          "
                      >
                        B
                      </span>
                    </div>
                  )}

                  {/* Cuisine */}

                  <div
                    className="
                        absolute
                        left-4
                        top-4
                        rounded-full
                        bg-white/95
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-blue-600
                        shadow-sm
                      "
                  >
                    {restaurant.cuisine || "Restaurant"}
                  </div>
                </div>

                {/* Content */}

                <div className="p-5">
                  <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      "
                  >
                    <div>
                      <h3
                        className="
                            text-lg
                            font-bold
                            text-gray-900
                          "
                      >
                        {restaurant.name}
                      </h3>

                      <p
                        className="
                            mt-1
                            line-clamp-1
                            text-sm
                            text-gray-500
                          "
                      >
                        {restaurant.address}
                      </p>
                    </div>

                    {/* Rating */}

                    {restaurant.rating && (
                      <div
                        className="
                            rounded-lg
                            bg-green-50
                            px-2.5
                            py-1
                            text-sm
                            font-semibold
                            text-green-700
                          "
                      >
                        ★ {restaurant.rating}
                      </div>
                    )}
                  </div>

                  {/* Delivery */}

                  <div
                    className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        text-sm
                        text-gray-500
                      "
                  >
                    <span>
                      {restaurant.delivery_time_min &&
                      restaurant.delivery_time_max
                        ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max} min`
                        : "Delivery available"}
                    </span>

                    {restaurant.delivery_fee !== null &&
                      restaurant.delivery_fee !== undefined && (
                        <span>₹{restaurant.delivery_fee} delivery</span>
                      )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Explore;
