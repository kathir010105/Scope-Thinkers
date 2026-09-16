import { useEffect, useState } from "react";
import { getAllCountries } from "../services/countriesApi";
import CountryCard from "../components/CountryCard";

function Explore() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");

  useEffect(() => {
    async function fetchCountries() {
      try {
        const data = await getAllCountries();
        setCountries(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

  const filteredCountries = countries.filter((country) => {
    const matchesSearch = country.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRegion = region === "All" || country.region === region;

    return matchesSearch && matchesRegion;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold">Explore the World</h1>

        <p className="mt-3 text-gray-600">
          Discover countries, cultures and destinations.
        </p>

        <div className="mt-8">
          <input
            type="text"
            placeholder="Search for a country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-gray-500"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["All", "Africa", "Americas", "Asia", "Europe", "Oceania"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setRegion(item)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  region === item
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        {loading && <p className="mt-8 text-gray-500">Loading countries...</p>}

        {!loading && (
          <>
            <p className="mt-8 text-sm text-gray-500">
              Showing {filteredCountries.length} destinations
            </p>

            {filteredCountries.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredCountries.map((country) => (
                  <CountryCard key={country.alpha3Code} country={country} />
                ))}
              </div>
            ) : (
              <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h2 className="text-lg font-semibold">No destinations found</h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try another country or region.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default Explore;
