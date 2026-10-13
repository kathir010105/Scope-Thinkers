const express = require("express");
const cors = require("cors");

const { holdings, transactions } = require("./data/portfolio");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/holdings", (req, res) => {
  res.json(holdings);
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FinTerminal API is running",
  });
});


app.post("/api/trades", (req, res) => {
    const { symbol, side, quantity, price } = req.body;
    
    console.log("TRADE REQUEST BODY:", req.body);
    console.log("symbol:", symbol);
    console.log("side:", side);
    console.log("quantity:", quantity);
    console.log("price:", price);

  if (!symbol || !side || !quantity || !price) {
    return res.status(400).json({
      message: "Missing trade information",
    });
  }

  const normalizedSymbol = symbol.toUpperCase();

  const holding = holdings.find((item) => item.symbol === normalizedSymbol);

  if (!holding) {
    return res.status(404).json({
      message: `Holding ${normalizedSymbol} not found`,
    });
  }

  if (side === "buy") {
    const oldQuantity = holding.quantity;

    const newQuantity = oldQuantity + quantity;

    const totalCost = oldQuantity * holding.averagePrice + quantity * price;

    holding.quantity = newQuantity;

    holding.averagePrice = totalCost / newQuantity;
  }

  if (side === "sell") {
    if (quantity > holding.quantity) {
      return res.status(400).json({
        message: "Not enough shares to sell",
      });
    }

    holding.quantity -= quantity;
  }

  holding.marketValue = holding.quantity * holding.currentPrice;

  holding.profitLoss =
    holding.quantity * (holding.currentPrice - holding.averagePrice);

  holding.profitLossPercent =
    holding.averagePrice > 0
      ? (holding.profitLoss / (holding.quantity * holding.averagePrice)) * 100
      : 0;

  const trade = {
    id: `TRD-${Date.now()}`,
    symbol: normalizedSymbol,
    side,
    quantity,
    price,
    total: quantity * price,
    date: new Date().toISOString(),
  };

  transactions.push(trade);

  res.status(201).json({
    trade,
    holding,
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
