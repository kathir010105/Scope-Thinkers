const express = require("express");
const { getTrainCoaches } = require("../services/railRadarService");

const router = express.Router();

router.get("/:trainNumber", async (req, res) => {
  try {
    const trainNumber = req.params.trainNumber?.trim();

    if (!trainNumber) {
      return res.status(400).json({
        success: false,
        message: "Train number is required.",
      });
    }

    console.log("REQUESTING COACHES FOR TRAIN:", trainNumber);

    const result = await getTrainCoaches(trainNumber);

    console.log("COACH API RESULT:", JSON.stringify(result, null, 2));

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Train coach error:", error.response?.data || error.message);

    const statusCode = error.response?.status || 500;

    res.status(statusCode).json({
      success: false,
      message:
        error.response?.data?.error?.message ||
        "Failed to fetch train coach details.",
    });
  }
});

module.exports = router;
