const express = require("express");
const { getFare } = require("../services/railRadarService");

const router = express.Router();

router.get("/:trainNumber", async (req, res) => {
  try {
    const trainNumber = req.params.trainNumber;

    const {
      source,
      destination,
      journeyDate,
      classCode,
      quotaCode = "GN",
    } = req.query;

    if (!trainNumber || !source || !destination || !journeyDate || !classCode) {
      return res.status(400).json({
        success: false,
        message:
          "Train number, source, destination, journey date and class are required.",
      });
    }

    const result = await getFare(
      trainNumber,
      source,
      destination,
      journeyDate,
      classCode,
      quotaCode,
    );

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Fare error:", error.response?.data || error.message);

    const statusCode = error.response?.status || 500;

    res.status(statusCode).json({
      success: false,
      message: error.response?.data?.error?.message || "Failed to fetch fare.",
    });
  }
});

module.exports = router;
    