import type { Holding } from "../types/finance";

export async function fetchHoldings(): Promise<Holding[]> {
  const response = await fetch("http://localhost:5000/api/holdings");

  if (!response.ok) {
    throw new Error("Failed to fetch holdings");
  }

  return response.json();
}
