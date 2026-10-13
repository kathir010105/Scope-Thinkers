import type { TradeFormData } from "../schemas/tradeSchema";

export interface Trade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  date: string;
}

export async function executeTrade(trade: TradeFormData): Promise<Trade> {
  const response = await fetch("http://localhost:5000/api/trades", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trade),
  });

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData.message || "Failed to execute trade");
  }

  const data = await response.json();

  return data.trade;
}
