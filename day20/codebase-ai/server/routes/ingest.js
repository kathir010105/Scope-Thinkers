import express from "express";
import weaviate, { dataType, vectors } from "weaviate-client";

const router = express.Router();

const COLLECTION_NAME = "ExpressDocs";

const DOCUMENTATION_PAGES = [
  {
    title: "Express middleware",
    url: "https://expressjs.com/en/guide/using-middleware.html",
    category: "middleware",
  },
  {
    title: "Express routing",
    url: "https://expressjs.com/en/guide/routing.html",
    category: "routing",
  },
  {
    title: "Express error handling",
    url: "https://expressjs.com/en/guide/error-handling.html",
    category: "error-handling",
  },
  {
    title: "Express request and response",
    url: "https://expressjs.com/en/4x/api.html",
    category: "api",
  },
  {
    title: "Express application configuration",
    url: "https://expressjs.com/en/guide/using-middleware.html",
    category: "configuration",
  },
];

function htmlToText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, "\n$1\n")
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, " $1 ")
    .replace(/<\/(p|h[1-6]|li|pre|section|article|div|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

function chunkText(text, maxLength = 1200, overlap = 150) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxLength, text.length);

    if (end < text.length) {
      const boundary = text.lastIndexOf(" ", end);

      if (boundary > start + maxLength * 0.65) {
        end = boundary;
      }
    }

    const chunk = text.slice(start, end).trim();

    if (chunk.length > 80) {
      chunks.push(chunk);
    }

    if (end >= text.length) break;

    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}

async function fetchDocumentation(page) {
  const response = await fetch(page.url, {
    headers: {
      "User-Agent": "CodeBaseAI-DocumentationIndexer/1.0",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${page.url}: HTTP ${response.status}`);
  }

  const html = await response.text();
  const text = htmlToText(html);

  if (text.length < 100) {
    throw new Error(`Not enough readable text extracted from ${page.url}`);
  }

  return chunkText(text).map((content, index) => ({
    title: page.title,
    url: page.url,
    category: page.category,
    content,
    chunkIndex: index,
  }));
}


router.get("/stats", async (req, res) => {
  let client;

  try {
    client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL, {
      authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
    });

    const exists = await client.collections.exists(COLLECTION_NAME);

    if (!exists) {
      return res.json({
        success: true,
        collection: COLLECTION_NAME,
        totalChunks: 0,
      });
    }

    const collection = client.collections.get(COLLECTION_NAME);
    const result = await collection.aggregate.overAll();

    return res.json({
      success: true,
      collection: COLLECTION_NAME,
      totalChunks: result.totalCount,
    });
  } catch (error) {
    console.error("Documentation stats failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not retrieve documentation statistics.",
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

router.post("/express", async (req, res) => {
  let client;

  try {
    const { WEAVIATE_URL, WEAVIATE_API_KEY } = process.env;

    if (!WEAVIATE_URL || !WEAVIATE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Weaviate credentials are missing.",
      });
    }

    client = await weaviate.connectToWeaviateCloud(WEAVIATE_URL, {
      authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY),
    });

    const exists = await client.collections.exists(COLLECTION_NAME);

    if (!exists) {
      await client.collections.create({
        name: COLLECTION_NAME,
        description: "Official Express.js documentation chunks for CodeBase AI",
        vectorizers: [vectors.text2VecWeaviate()],
        properties: [
          { name: "title", dataType: dataType.TEXT },
          { name: "url", dataType: dataType.TEXT },
          { name: "category", dataType: dataType.TEXT },
          { name: "content", dataType: dataType.TEXT },
          { name: "chunkIndex", dataType: dataType.INT },
        ],
      });
    }

    const collection = client.collections.get(COLLECTION_NAME);
    const documents = [];
    const errors = [];

    for (const page of DOCUMENTATION_PAGES) {
      try {
        const chunks = await fetchDocumentation(page);
        documents.push(...chunks);
      } catch (error) {
        errors.push({
          url: page.url,
          message: error.message,
        });
      }
    }

    if (documents.length === 0) {
      return res.status(502).json({
        success: false,
        message: "No documentation could be downloaded.",
        errors,
      });
    }

    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      const result = await collection.data.insertMany(
        batch.map((document) => ({
          properties: document,
        })),
      );

      const failed = result?.errors?.length ?? 0;
      inserted += batch.length - failed;

      if (failed > 0) {
        console.error("Some Weaviate objects failed to insert:", result.errors);
      }
    }

    return res.status(200).json({
      success: true,
      collection: COLLECTION_NAME,
      pagesAttempted: DOCUMENTATION_PAGES.length,
      chunksPrepared: documents.length,
      chunksInserted: inserted,
      errors,
      message:
        "Documentation ingestion finished. Review the errors list for any pages that could not be fetched.",
    });
  } catch (error) {
    console.error("Documentation ingestion failed:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Documentation ingestion failed.",
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
