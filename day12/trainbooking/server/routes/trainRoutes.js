const express = require("express");

const { getTrainsBetweenStations } = require("../services/railRadarService");

const router = express.Router();

/*
  GET /api/trains/between/:from/:to?date=YYYY-MM-DD
*/

router.get("/between/:from/:to", async (req, res) => {
  try {
    const from = req.params.from?.trim().toUpperCase();
    const to = req.params.to?.trim().toUpperCase();
    const date = req.query.date?.trim();

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "From and to station codes are required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Journey date is required.",
      });
    }

    if (from === to) {
      return res.status(400).json({
        success: false,
        message: "From and to stations cannot be the same.",
      });
    }

    const result = await getTrainsBetweenStations(from, to, date);

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Train search error:", error.response?.data || error.message);

    const statusCode = error.response?.status || 500;

    res.status(statusCode).json({
      success: false,
      message:
        error.response?.data?.error?.message || "Failed to search trains.",
    });
  }
});

module.exports = router;
