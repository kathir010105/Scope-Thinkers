import { Link } from "react-router-dom";

function CountryCard({ country }) {
  return (
    <Link to={`/destination/${country.alpha3Code}`} className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <img
        src={country.flags.png}
        alt={`${country.name} flag`}
        className="h-48 w-full object-cover"
      />

      <div className="p-5">
        <h2 className="text-lg font-bold">{country.name}</h2>

        <p className="mt-2 text-sm text-gray-500">{country.region}</p>

        <div className="mt-4 space-y-2 text-sm">
            <p>
                <span className="font-medium">Capital:</span> {country.capital||"N/A"}
            </p>

            <p>
                <span className="font-medium">Population:</span> {country.population.toLocaleString()}  
            </p>
        </div>
      </div>



        </Link>
  );
}

export default CountryCard;
