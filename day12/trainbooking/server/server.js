const express = require("express");
const cors = require("cors");
require("dotenv").config();

const trainRoutes = require("./routes/trainRoutes");
const testRoutes = require("./routes/testRoutes");
const seatRoutes = require("./routes/seatRoutes");
const fareRoutes = require("./routes/fareRoutes");
const authRoutes = require("./routes/authRoutes");
const trainDetailsRoutes = require("./routes/trainDetailsRoutes");

const app = express();

const stationRoutes = require("./routes/stationRoutes");
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/trains", trainRoutes);
// Routes
app.use("/api/test", testRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/fares", fareRoutes);
app.use("/api/train-details", trainDetailsRoutes);

app.use("/api/auth", authRoutes);


// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Train Booking API is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
