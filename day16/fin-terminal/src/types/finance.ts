export type AssetType = "stock" | "crypto" | "etf" | "index";

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change: number;
  changePercent: number;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdrawal";
  symbol?: string;
  name: string;
  quantity?: number;
  price?: number;
  amount: number;
  date: string;
}
