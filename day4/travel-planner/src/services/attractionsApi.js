const API_KEY = import.meta.env.VITE_OPENTRIPMAP_API_KEY;

console.log("API KEY:", API_KEY);

const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

export async function getAttractions(lat, lon) {
  const url =
    `${BASE_URL}/radius` +
    `?radius=5000` +
    `&lon=${lon}` +
    `&lat=${lat}` +
    `&kinds=historic,cultural,natural,architecture,religion` +
    `&rate=2` +
    `&apikey=${API_KEY}` +
    `&format=json` +
    `&limit=20`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch attractions");
  }

  return response.json();
}

export async function getCityCoordinates(city) {
  const url =
    `${BASE_URL}/geoname` +
    `?name=${encodeURIComponent(city)}` +
    `&apikey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to find city coordinates");
  }

  return response.json();
}

export async function getAttractionDetails(xid) {
  const response = await fetch(`${BASE_URL}/xid/${xid}?apikey=${API_KEY}`);

  if (!response.ok) {
    throw new Error("Failed to fetch attraction details");
  }

  return response.json();
}
