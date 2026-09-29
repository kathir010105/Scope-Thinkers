const express = require("express");
const { db } = require("../config/firebase");

const router = express.Router();

router.get("/firebase", async (req, res) => {
  try {
    await db.collection("_connection_test").limit(1).get();

    res.json({
      success: true,
      message: "Firebase connection successful",
    });
  } catch (error) {
    console.error("Firebase error:", error);

    res.status(500).json({
      success: false,
      message: "Firebase connection failed",
    });
  }
});

module.exports = router;
