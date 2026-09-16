import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCountryByCode } from "../services/countriesApi";
import {
  getCityCoordinates,
  getAttractions,
  getAttractionDetails,
} from "../services/attractionsApi";

import AttractionCard from "../components/AttractionCard";


function DestinationDetails() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    async function fetchCountry() {
      try {
        const data = await getCountryByCode(code);

        console.log("COUNTRY:", data);

        const cityData = await getCityCoordinates(data.capital);

        console.log("CITY:", cityData);

        const attractionsData = await getAttractions(
          cityData.lat,
          cityData.lon,
        );

        console.log("ATTRACTIONS:", attractionsData);

        // Remove places that don't have a name
        const namedAttractions = attractionsData.filter((place) =>
          place.name?.trim(),
        );

        // Get detailed information for each attraction
        const detailedAttractions = await Promise.all(
          namedAttractions.map(async (place) => {
            try {
              return await getAttractionDetails(place.xid);
            } catch (error) {
              console.error(`Failed to load details for ${place.name}`, error);

              return place;
            }
          }),
        );

        console.log("DETAILED ATTRACTIONS:", detailedAttractions);

        setAttractions(detailedAttractions);
        setCountry(data);

        console.log("ATTRACTIONS:", attractionsData);

        setAttractions(attractionsData);
        setCountry(data);
      } catch (error) {
        console.error("API ERROR:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCountry();
  }, [code]);

  // LOADING
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-gray-500">Loading destination...</p>
        </section>
      </main>
    );
  }

  // ERROR / NO COUNTRY
  if (!country) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-2xl font-bold">Destination not found</h1>
        </section>
      </main>
    );
  }

  // 👇 PUT THE CODE YOU ASKED ABOUT HERE
  return (
    <main className="min-h-screen bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
      >
        ← Back to Explore
      </button>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <img
            src={country.flags.png}
            alt={`${country.name} flag`}
            className="h-72 w-full bg-gray-100 object-contain p-8"
          />

          <div className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold">{country.name}</h1>

                <p className="mt-2 text-gray-500">
                  {country.region} · {country.subregion}
                </p>
              </div>

              <span className="text-5xl">{country.flag}</span>
            </div>
          </div>
        </div>

        {/* Country Information */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Capital</p>

            <p className="mt-2 font-semibold">{country.capital || "N/A"}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Population</p>

            <p className="mt-2 font-semibold">
              {country.population.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Area</p>

            <p className="mt-2 font-semibold">
              {country.area.toLocaleString()} km²
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Timezone</p>

            <p className="mt-2 font-semibold">
              {country.timezones?.[0] || "N/A"}
            </p>
          </div>
        </div>

        {/* Languages and Currency */}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Languages */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Languages</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {country.languages?.map((language) => (
                <span
                  key={language.iso639_2}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                >
                  {language.name}
                </span>
              ))}
            </div>
          </div>

          {/* Currency */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Currency</h2>

            {country.currencies?.map((currency) => (
              <div key={currency.code} className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
                  {currency.symbol}
                </span>

                <div>
                  <p className="font-medium">{currency.name}</p>

                  <p className="text-sm text-gray-500">{currency.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tourist Attractions */}

        <div className="mt-10">
          <h2 className="text-2xl font-bold">Tourist Attractions</h2>

          <p className="mt-2 text-gray-500">
            Places to visit in and around {country.capital}.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {attractions.map((attraction) => (
              <AttractionCard
                key={attraction.xid}
                attraction={attraction}
                country={country.name}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default DestinationDetails;
