import express from "express";
import weaviate from "weaviate-client";

const router = express.Router();

router.get("/status", async (req, res) => {
  let client;

  try {
    const { WEAVIATE_URL, WEAVIATE_API_KEY } = process.env;

    if (!WEAVIATE_URL || !WEAVIATE_API_KEY) {
      return res.status(500).json({
        success: false,
        connected: false,
        message: "Weaviate credentials are missing from server/.env",
      });
    }

    client = await weaviate.connectToWeaviateCloud(WEAVIATE_URL, {
      authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
    });

    const ready = await client.isReady();

    if (!ready) {
      return res.status(503).json({
        success: false,
        connected: false,
        message: "The Weaviate cluster is not ready.",
      });
    }

    return res.status(200).json({
      success: true,
      connected: true,
      message: "Weaviate Cloud is connected and ready.",
    });
  } catch (error) {
    console.error("Weaviate status check failed:", error.message);

    return res.status(503).json({
      success: false,
      connected: false,
      message:
        "Weaviate connection failed. Check the endpoint, API key, and cluster status.",
    });
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (error) {
        console.error("Weaviate cleanup failed:", error.message);
      }
    }
  }
});

export default router;
