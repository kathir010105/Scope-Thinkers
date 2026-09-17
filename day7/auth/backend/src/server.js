const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");

const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "JWT Auth API is running",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    res.json({
      message: "Database connected successfully",
      result: rows,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

