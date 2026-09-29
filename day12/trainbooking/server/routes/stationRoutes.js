const express = require("express");
const { searchStations } = require("../services/railRadarService");

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.json({
        success: true,
        data: [],
      });
    }

    if (query.length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const result = await searchStations(query);

    res.json({
      success: true,
      data: result.data || [],
    });
  } catch (error) {
    console.error(
      "Station search error:",
      error.response?.data || error.message,
    );

    const statusCode = error.response?.status || 500;

    res.status(statusCode).json({
      success: false,
      message:
        error.response?.data?.error?.message || "Failed to search stations",
    });
  }
});

module.exports = router;
