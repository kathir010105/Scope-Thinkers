const BASE_URL = "https://countries.dev";

export async function getAllCountries() {
  const response = await fetch(`${BASE_URL}/countries`);

  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }

  return response.json();
}

export async function getCountryByCode(code) { 
    const response = await fetch(`${BASE_URL}/alpha/${code}`);

    if (!response.ok) { 
        throw new error("Country Not Found");
    }

    return response.json();
}