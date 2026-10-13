import type { Asset, Holding, Transaction } from "../types/finance";

export const marketAssets: Asset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "stock",
    price: 256.32,
    change: 2.14,
    changePercent: 0.84,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    type: "stock",
    price: 183.24,
    change: 4.82,
    changePercent: 2.7,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    type: "stock",
    price: 522.18,
    change: -1.24,
    changePercent: -0.24,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    type: "stock",
    price: 438.17,
    change: 8.43,
    changePercent: 1.96,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    type: "crypto",
    price: 118420.52,
    change: 1420.21,
    changePercent: 1.21,
  },
];

export const holdings: Holding[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 20,
    averagePrice: 228.42,
    currentPrice: 256.32,
    marketValue: 5126.4,
    profitLoss: 558,
    profitLossPercent: 12.21,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    quantity: 15,
    averagePrice: 154.82,
    currentPrice: 183.24,
    marketValue: 2748.6,
    profitLoss: 426.3,
    profitLossPercent: 18.36,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    quantity: 10,
    averagePrice: 498.32,
    currentPrice: 522.18,
    marketValue: 5221.8,
    profitLoss: 238.6,
    profitLossPercent: 4.79,
  },
];

export const transactions: Transaction[] = [
  {
    id: "TXN-001",
    type: "buy",
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 10,
    price: 248.21,
    amount: 2482.1,
    date: "2026-10-06",
  },
  {
    id: "TXN-002",
    type: "sell",
    symbol: "TSLA",
    name: "Tesla Inc.",
    quantity: 5,
    price: 429.82,
    amount: 2149.1,
    date: "2026-10-05",
  },
  {
    id: "TXN-003",
    type: "deposit",
    name: "Cash Deposit",
    amount: 5000,
    date: "2026-10-04",
  },
];
