import express from "express";
import multer from "multer";
import crypto from "node:crypto";
import weaviate, { dataType, vectors, Filters } from "weaviate-client";
import { PDFParse } from "pdf-parse";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../db.js";
import { verifyAuthToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyAuthToken);

// Ensure user_documents table exists
async function ensureUserDocumentsTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS user_documents (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100),
      file_size BIGINT,
      source_type ENUM('file', 'url') NOT NULL DEFAULT 'file',
      source_id VARCHAR(255),
      pdf_file_id VARCHAR(64),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id)
    )
  `);
}

// Call on startup
ensureUserDocumentsTable().catch(console.error);

const PDF_STORAGE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../uploads/pdfs",
);

const COLLECTION_NAME = "ExpressDocs";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_URL_TEXT_SIZE = 5 * 1024 * 1024;
const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;



const TECHNOLOGY_RULES = [
  {
    name: "TypeScript",
    domains: ["typescriptlang.org"],
    pattern: /\btypescript\b/i,
  },
  {
    name: "Express.js",
    domains: ["expressjs.com"],
    pattern: /\bexpress(?:\.js)?\b/i,
  },
  {
    name: "React",
    domains: ["react.dev", "reactjs.org"],
    pattern: /\breact(?:\.js)?\b/i,
  },
  {
    name: "Node.js",
    domains: ["nodejs.org"],
    pattern: /\bnode\.?js\b/i,
  },
  {
    name: "Vite",
    domains: ["vite.dev", "vitejs.dev"],
    pattern: /\bvite\b/i,
  },
  {
    name: "Weaviate",
    domains: ["weaviate.io"],
    pattern: /\bweaviate\b/i,
  },
  {
    name: "Gemini API",
    domains: ["ai.google.dev"],
    pattern: /\bgemini(?:\s+api)?\b/i,
  },
  {
    name: "JavaScript",
    domains: ["developer.mozilla.org"],
    pattern: /\bjavascript\b/i,
  },
];

function inferTechnology({ title = "", url = "", text = "" }) {
  let hostname = "";

  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      hostname = new URL(url).hostname.toLowerCase();
    }
  } catch {
    // Continue with title and content matching.
  }

  // Domain and title are stronger evidence than content alone.
  const byDomain = TECHNOLOGY_RULES.find((rule) =>
    rule.domains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    ),
  );

  if (byDomain) return byDomain.name;

  const byTitle = TECHNOLOGY_RULES.filter((rule) => rule.pattern.test(title));

  if (byTitle.length === 1) return byTitle[0].name;

  if (byTitle.length > 1) return null;

  // Only classify from content when exactly one known technology matches.
  const byContent = TECHNOLOGY_RULES.filter((rule) =>
    rule.pattern.test(text.slice(0, 12000)),
  );

  return byContent.length === 1 ? byContent[0].name : null;
}


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter(req, file, callback) {
    const allowedExtensions = [".pdf", ".md", ".markdown", ".txt"];
    const extension = file.originalname
      .toLowerCase()
      .slice(file.originalname.lastIndexOf("."));

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new Error("Only PDF, Markdown, and TXT files are supported."),
      );
    }

    callback(null, true);
  },
});

const hashText = (text) =>
  crypto.createHash("sha256").update(text).digest("hex");

function cleanText(text = "") {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitIntoChunks(text) {
  const chunks = [];
  const content = cleanText(text);

  if (!content) return chunks;

  let start = 0;

  while (start < content.length) {
    let end = Math.min(start + CHUNK_SIZE, content.length);

    if (end < content.length) {
      const boundary = content.lastIndexOf(" ", end);

      if (boundary > start + CHUNK_SIZE * 0.6) {
        end = boundary;
      }
    }

    const chunk = content.slice(start, end).trim();

    if (chunk) chunks.push(chunk);

    if (end >= content.length) break;

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
}

function stripHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|footer|header|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|h[1-6]|li|pre|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) =>
      String.fromCodePoint(parseInt(number, 16)),
    );
}

function validatePublicUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Enter a valid public documentation URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("URLs containing embedded credentials are not allowed.");
  }

  const host = parsed.hostname.toLowerCase();

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "::1" ||
    host === "[::1]" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "0.0.0.0"
  ) {
    throw new Error("Local and private network URLs are not allowed.");
  }

  return parsed;
}


async function getClient() {
  if (!process.env.WEAVIATE_URL || !process.env.WEAVIATE_API_KEY) {
    throw new Error("Weaviate credentials are not configured.");
  }

  return weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL, {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
    timeout: {
      init: 30,
      query: 60,
      insert: 120,
    },
  });
}



async function ensureCollection(client) {
  const exists = await client.collections.exists(COLLECTION_NAME);

  if (!exists) {
    await client.collections.create({
      name: COLLECTION_NAME,
      vectorizers: [vectors.text2VecWeaviate()],
      properties: [
        { name: "title", dataType: dataType.TEXT },
        { name: "url", dataType: dataType.TEXT },
        { name: "category", dataType: dataType.TEXT },
        { name: "content", dataType: dataType.TEXT },
        { name: "chunkIndex", dataType: dataType.INT },
        { name: "sourceId", dataType: dataType.TEXT },
        { name: "technology", dataType: dataType.TEXT },
        { name: "contentHash", dataType: dataType.TEXT },
        { name: "sourceType", dataType: dataType.TEXT },
        { name: "pdfFileId", dataType: dataType.TEXT },
        { name: "userId", dataType: dataType.TEXT },
      ],
    });
  }

  const collection = client.collections.get(COLLECTION_NAME);

  const existingConfig = await collection.config.get();

  const existingNames = new Set(
    (existingConfig.properties || []).map((property) => property.name),
  );

  const newProperties = [
    { name: "sourceId", dataType: dataType.TEXT },
    { name: "contentHash", dataType: dataType.TEXT },
    { name: "sourceType", dataType: dataType.TEXT },
    { name: "technology", dataType: dataType.TEXT },
    { name: "pdfFileId", dataType: dataType.TEXT },
    { name: "userId", dataType: dataType.TEXT },
  ];

  for (const property of newProperties) {
    if (!existingNames.has(property.name)) {
      await collection.config.addProperty(property);
    }
  }

  return collection;
}


async function getSourceObjects(collection, sourceId, userId) {
  const sourceFilter = collection.filter.byProperty("sourceId").equal(sourceId);

  let filters = sourceFilter;

  if (userId) {
    const userFilter = collection.filter.byProperty("userId").equal(userId);
    filters = Filters.and(sourceFilter, userFilter);
  }

  const result = await collection.query.fetchObjects({
    filters,
    limit: 1000,
    returnProperties: [
      "title",
      "url",
      "category",
      "content",
      "chunkIndex",
      "sourceId",
      "contentHash",
      "sourceType",
      "pdfFileId",
      "userId",
    ],
  });

  return result.objects;
}

async function deleteObjects(collection, objects) {
  for (const object of objects) {
    await collection.data.deleteById(object.uuid);
  }
}

async function ingestDocument({
  collection,
  title,
  url,
  category,
  sourceType,
  sourceId,
  text,
  technology: suppliedTechnology,
  pdfFileId = "",
  userId,
}) {
  const cleaned = cleanText(text);
  const technology =
    suppliedTechnology ||
    inferTechnology({
      title,
      url,
      text: cleaned,
    });

  if (cleaned.length < 30) {
    throw new Error("Not enough readable text was found in this document.");
  }

  const contentHash = hashText(cleaned);
  const previous = await getSourceObjects(collection, sourceId, userId);

  // Skip unchanged documents.
  if (
    previous.length > 0 &&
    previous.every((object) => object.properties.contentHash === contentHash)
  ) {
    return {
      status: "duplicate",
      message: "This document is already indexed and has not changed.",
      title,
      chunks: previous.length,
      pdfFileId: previous[0]?.properties?.pdfFileId || "",
    };
  }

  // Replace an older version of the same URL/source.
  if (previous.length > 0) {
    await deleteObjects(collection, previous);
  }

  const chunks = splitIntoChunks(cleaned);

  const objects = chunks.map((content, chunkIndex) => ({
    properties: {
      title,
      url,
      category,
      technology: technology || "",
      content,
      chunkIndex,
      sourceId,
      contentHash,
      sourceType,
      pdfFileId,
      userId,
    },
  }));

  await collection.data.insertMany(objects);

  return {
    status: "indexed",
    message: "Document indexed successfully.",
    title,
    chunks: objects.length,
  };
}

function getCategory(sourceType, title) {
  if (sourceType === "url") {
    try {
      return new URL(title).hostname;
    } catch {
      return "web-documentation";
    }
  }

  return sourceType;
}


function normalizeCrawlUrl(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = "";
  url.search = "";
  return url.href;
}

function isWithinCrawlScope(candidateUrl, startUrl) {
  const candidate = new URL(candidateUrl);
  const start = new URL(startUrl);

  if (candidate.origin !== start.origin) {
    return false;
  }

  // A URL ending in .html or another extension is treated as a page.
  // Otherwise, crawl within the selected path.
  const hasFileExtension = /\.[a-z0-9]{1,8}$/i.test(start.pathname);

  let basePath;

  if (hasFileExtension) {
    basePath =
      start.pathname.slice(0, start.pathname.lastIndexOf("/") + 1) || "/";
  } else {
    basePath = start.pathname.endsWith("/")
      ? start.pathname
      : `${start.pathname}/`;

    if (start.pathname === "/") {
      basePath = "/";
    }
  }

  return (
    candidate.pathname === start.pathname ||
    candidate.pathname.startsWith(basePath)
  );
}

function extractPageTitle(html, url) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);

  if (match) {
    return stripHtml(match[1]).trim().slice(0, 250) || new URL(url).hostname;
  }

  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);

  if (heading) {
    return stripHtml(heading[1]).trim().slice(0, 250) || new URL(url).hostname;
  }

  return (
    new URL(url).pathname.split("/").filter(Boolean).pop() ||
    new URL(url).hostname
  );
}

function extractInternalLinks(html, pageUrl, startUrl) {
  const links = new Set();
  const anchorPattern =
    /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi;

  let match;

  while ((match = anchorPattern.exec(html)) !== null) {
    const href = match[1] ?? match[2] ?? match[3];

    if (!href) continue;

    try {
      const absoluteUrl = normalizeCrawlUrl(new URL(href, pageUrl).href);

      if (
        isWithinCrawlScope(absoluteUrl, startUrl) &&
        !/\.(pdf|png|jpe?g|gif|svg|webp|zip|css|js|json|xml|woff2?)$/i.test(
          new URL(absoluteUrl).pathname,
        )
      ) {
        links.add(absoluteUrl);
      }
    } catch {
      // Ignore malformed links.
    }
  }

  return [...links];
}

async function fetchCrawlPage(rawUrl) {
  let currentUrl = rawUrl;

  // Validate every redirect destination instead of blindly following it.
  for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
    validatePublicUrl(currentUrl);

    const response = await fetch(currentUrl, {
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
      headers: {
        "User-Agent": "CodeBaseAI-DocumentationBot/1.0",
        Accept: "text/html",
      },
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");

      if (!location) {
        throw new Error("The page returned a redirect without a location.");
      }

      if (redirectCount === 5) {
        throw new Error("Too many redirects.");
      }

      currentUrl = new URL(location, currentUrl).href;
      continue;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      throw new Error("Skipped: the URL does not return HTML.");
    }

    const html = await response.text();

    if (Buffer.byteLength(html, "utf8") > MAX_URL_TEXT_SIZE) {
      throw new Error("Skipped: the page exceeds the size limit.");
    }

    const finalUrl = normalizeCrawlUrl(response.url || currentUrl);
    validatePublicUrl(finalUrl);

    return {
      url: finalUrl,
      html,
      title: extractPageTitle(html, finalUrl),
      text: stripHtml(html),
    };
  }

  throw new Error("Could not fetch the page.");
}

async function crawlDocumentation(startUrl, collection, options = {}) {
  const maxPages = Math.min(25, Math.max(1, Number(options.maxPages) || 25));

  const requestedDepth = Number(options.maxDepth);

const maxDepth = Math.min(
  3,
  Math.max(
    0,
    Number.isFinite(requestedDepth) ? requestedDepth : 2,
  ),
);

  const rootUrl = normalizeCrawlUrl(startUrl);
  const queue = [{ url: rootUrl, depth: 0 }];
  const discovered = new Set([rootUrl]);
  const results = [];
  const errors = [];
  let pagesAttempted = 0;
  const userId = options.userId;

  while (queue.length > 0 && pagesAttempted < maxPages) {
    const current = queue.shift();
    pagesAttempted += 1;

    try {
      const page = await fetchCrawlPage(current.url);

      if (!isWithinCrawlScope(page.url, rootUrl)) {
        errors.push({
          url: current.url,
          message:
            "Skipped: redirected outside the selected documentation scope.",
        });
        continue;
      }

      const result = await ingestDocument({
        collection,
        title: page.title,
        url: page.url,
        category: getCategory("url", page.url),
        sourceType: "url",
        sourceId: `url:${hashText(page.url)}`,
        text: page.text,
        userId,
      });

      results.push({
        url: page.url,
        title: page.title,
        status: result.status,
        chunks: result.chunks,
      });

      if (current.depth < maxDepth) {
        for (const link of extractInternalLinks(page.html, page.url, rootUrl)) {
          if (!discovered.has(link) && discovered.size < 500) {
            discovered.add(link);
            queue.push({
              url: link,
              depth: current.depth + 1,
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        url: current.url,
        message: error.message || "Could not process this page.",
      });
    }
  }

  return {
    startUrl: rootUrl,
    pagesAttempted,
    pagesIndexed: results.filter((page) => page.status === "indexed").length,
    pagesAlreadyIndexed: results.filter((page) => page.status === "duplicate")
      .length,
    totalChunks: results.reduce((sum, page) => sum + page.chunks, 0),
    pages: results,
    errors,
    truncated: queue.length > 0,
  };
}


/*
 * POST /api/documents/migrate-technologies
 *
 * Backfills technology metadata for existing indexed chunks.
 */
router.post("/migrate-technologies", async (req, res) => {
  let client;

  try {
    client = await getClient();
    const collection = await ensureCollection(client);

    const result = await collection.query.fetchObjects({
      limit: 1000,
      returnProperties: [
        "title",
        "url",
        "content",
        "technology",
      ],
    });

    let updated = 0;
    let skipped = 0;

    for (const object of result.objects || []) {
      const properties = object.properties || {};

      // Do not overwrite metadata that is already present.
      if (
        typeof properties.technology === "string" &&
        properties.technology.trim()
      ) {
        skipped++;
        continue;
      }

      const technology = inferTechnology({
        title: properties.title || "",
        url: properties.url || "",
        text: properties.content || "",
      });

      if (!technology) {
        skipped++;
        continue;
      }

      await collection.data.update({
        id: object.uuid,
        properties: { technology },
      });

      updated++;
    }

    return res.json({
      success: true,
      scanned: result.objects?.length || 0,
      updated,
      skipped,
      message:
        "Technology metadata migration completed for the retrieved documents.",
    });
  } catch (error) {
    console.error("Technology migration failed:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Technology migration failed.",
    });
  } finally {
    if (client) {
      try {
        await client.close();
      } catch {}
    }
  }
});

// GET /api/documents
// List indexed documents grouped by their source.
router.get("/", async (req, res) => {
  let client;

  try {
    const userId = req.user.uid;
    client = await getClient();
    const collection = await ensureCollection(client);

    const result = await collection.query.fetchObjects({
      filters: collection.filter.byProperty("userId").equal(userId),
      limit: 1000,
      returnProperties: [
        "title",
        "url",
        "category",
        "chunkIndex",
        "sourceId",
        "contentHash",
        "sourceType",
        "pdfFileId"
        
      ],
    });

    const documents = new Map();

    for (const object of result.objects) {
      const properties = object.properties || {};

      // Preserve legacy Express chunks that do not yet have sourceId.
      const sourceId =
        properties.sourceId ||
        `legacy:${properties.url || properties.title || "unknown"}`;

      if (!documents.has(sourceId)) {
        documents.set(sourceId, {
          id: sourceId,
          title: properties.title || "Untitled document",
          url: properties.url || "",
          category: properties.category || "documentation",
          sourceType: properties.sourceType || "legacy",
          chunks: 0,
          contentHash: properties.contentHash || null,
          pdfFileId: properties.pdfFileId || "",
        });
      }

      documents.get(sourceId).chunks += 1;
    }

    const items = Array.from(documents.values()).sort((a, b) =>
      a.title.localeCompare(b.title),
    );

    return res.json({
      success: true,
      totalDocuments: items.length,
      totalChunks: result.objects.length,
      documents: items,
    });
  } catch (error) {
  console.error("GET /api/documents failed:", error);

  res.status(500).json({
    success: false,
    message: "Could not load indexed documents.",
    ...(process.env.NODE_ENV !== "production" && {
      details: error.message,
    }),
  });
} finally {
    if (client) {
      try {
        await client.close();
      } catch {}
    }
  }
});

// POST /api/documents/url

router.post("/url", async (req, res) => {
  let client;

  try {
    const rawUrl = req.body?.url?.trim();

    if (!rawUrl) {
      return res.status(400).json({
        success: false,
        message: "Please provide a documentation URL.",
      });
    }

    const parsedUrl = validatePublicUrl(rawUrl);
    const startUrl = normalizeCrawlUrl(parsedUrl.href);

    client = await getClient();
    const collection = await ensureCollection(client);

    // Crawling is enabled by default. Send { "crawl": false }
    // if you want to index only the submitted page.
    const shouldCrawl = req.body?.crawl !== false;

    if (shouldCrawl) {
      const result = await crawlDocumentation(startUrl, collection, {
        maxPages: req.body?.maxPages,
        maxDepth: req.body?.maxDepth,
        userId: req.user.uid,
      });

      if (result.pagesAttempted === 0) {
        return res.status(502).json({
          success: false,
          message: "No documentation pages could be indexed.",
          ...result,
        });
      }

      // Store each crawled page in MySQL
      for (const page of result.pages) {
        if (page.status === "indexed") {
          const docId = crypto.randomBytes(16).toString("hex");
          await pool.execute(
            `INSERT INTO user_documents
        (id, user_id, original_name, mime_type, file_size, source_type, source_id, pdf_file_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              docId,
              req.user.uid,
              page.title,
              "text/html",
              0,
              "url",
              `url:${hashText(page.url)}`,
              null,
            ],
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: "Documentation crawl completed.",
        ...result,
      });
    }

    // Single-page mode: preserve the original URL-ingestion behavior.
    const page = await fetchCrawlPage(startUrl);

    const result = await ingestDocument({
      collection,
      title: page.title,
      url: page.url,
      category: getCategory("url", page.url),
      sourceType: "url",
      sourceId: `url:${hashText(page.url)}`,
      text: page.text,
      userId: req.user.uid,
    });

    const docId = crypto.randomBytes(16).toString("hex");
      await pool.execute(
        `INSERT INTO user_documents
      (id, user_id, original_name, mime_type, file_size, source_type, source_id, pdf_file_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          docId,
          req.user.uid,
          page.title,
          "text/html",
          0,
          "url",
          `url:${hashText(page.url)}`,
          null,
        ],
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        ...result,
        url: page.url,
        pagesAttempted: 1,
        pagesIndexed: result.status === "indexed" ? 1 : 0,
        pagesAlreadyIndexed: result.status === "duplicate" ? 1 : 0,
        totalChunks: result.chunks,
        errors: [],
      });
  } catch (error) {
    console.error("URL ingestion/crawl failed:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Could not ingest this URL.",
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


// POST /api/documents/upload
router.post("/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "File upload failed.",
        });
      }

      next();
    });
  },
  async (req, res) => {
    let client;
    let parser;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Choose a file to upload.",
        });
      }

      const originalName = req.file.originalname
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .slice(0, 180);

      const extension = originalName
        .toLowerCase()
        .slice(originalName.lastIndexOf("."));

      let text = "";

      if (extension === ".pdf") {
        if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
          return res.status(400).json({
            success: false,
            message: "The uploaded file is not a valid PDF.",
          });
        }

        parser = new PDFParse({ data: req.file.buffer });
        const pdfResult = await parser.getText();
        text = pdfResult.text || "";
      } else {
        text = req.file.buffer.toString("utf8");

        // Reject binary files disguised as text.
        if (text.includes("\u0000")) {
          return res.status(400).json({
            success: false,
            message:
              "This file does not appear to be a readable text document.",
          });
        }
      }

      const cleanedText = cleanText(text);

      if (cleanedText.length < 30) {
        return res.status(400).json({
          success: false,
          message:
            "No usable text was extracted. Scanned PDFs require OCR before they can be indexed.",
        });
      }

      const fileHash = hashText(cleanedText);

      let pdfFileId = "";

      if (extension === ".pdf") {
        pdfFileId = hashText(req.file.buffer.toString("base64"));

        await pool.execute(
          `INSERT IGNORE INTO uploaded_pdfs
      (id, original_name, mime_type, file_size, file_data)
     VALUES (?, ?, ?, ?, ?)`,
          [
            pdfFileId,
            originalName,
            "application/pdf",
            req.file.buffer.length,
            req.file.buffer,
          ],
        );
      }

      client = await getClient();
      const collection = await ensureCollection(client);


      const result = await ingestDocument({
        collection,
        title: originalName,
        url: `upload://${encodeURIComponent(originalName)}`,
        category: extension.slice(1),
        sourceType: "file",
        sourceId: `file:${fileHash}`,
        text: cleanedText,
        pdfFileId,
        userId: req.user.uid,
      });

      // Store document metadata in MySQL for all file types
      const docId = crypto.randomBytes(16).toString("hex");
      await pool.execute(
        `INSERT INTO user_documents
      (id, user_id, original_name, mime_type, file_size, source_type, source_id, pdf_file_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          docId,
          req.user.uid,
          originalName,
          req.file.mimetype,
          req.file.buffer.length,
          "file",
          `file:${fileHash}`,
          pdfFileId || null,
        ],
      );

      if (
        extension === ".pdf" &&
        result.status === "duplicate" &&
        result.pdfFileId &&
        result.pdfFileId !== pdfFileId
      ) {
        await pool.execute("DELETE FROM uploaded_pdfs WHERE id = ?", [
          pdfFileId,
        ]);
      }

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("File ingestion failed:", error.message);

      return res.status(400).json({
        success: false,
        message: error.message || "Could not ingest this file.",
      });
    } finally {
      if (parser) {
        try {
          await parser.destroy();
        } catch {}
      }

      if (client) {
        try {
          await client.close();
        } catch {}
      }
    }
  },
);

// GET /api/documents/pdf/:pdfFileId

router.get("/pdf/:pdfFileId", async (req, res) => {
  try {
    const { pdfFileId } = req.params;

    if (!/^[a-f0-9]{64}$/i.test(pdfFileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PDF identifier.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT original_name, file_data
       FROM uploaded_pdfs
       WHERE id = ?
       LIMIT 1`,
      [pdfFileId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "PDF not found in MySQL.",
      });
    }

    const filename = rows[0].original_name.replace(/["\\\r\n]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");

    return res.send(rows[0].file_data);
  } catch (error) {
    console.error("PDF preview failed:", error);

    return res.status(500).json({
      success: false,
      message: "Could not open this PDF.",
    });
  }
});

// DELETE /api/documents/:sourceId
router.delete("/:sourceId", async (req, res) => {
  let client;

  try {
    const userId = req.user.uid;
    const sourceId = req.params.sourceId;

    if (
      !sourceId ||
      (!sourceId.startsWith("url:") &&
        !sourceId.startsWith("file:") &&
        !sourceId.startsWith("legacy:"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid document identifier.",
      });
    }

    client = await getClient();
    const collection = await ensureCollection(client);

    const objects = await getSourceObjects(collection, sourceId, userId);

    if (objects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found or access denied.",
      });
    }

    // Legacy documents do not have sourceId metadata.
    if (sourceId.startsWith("legacy:")) {
      const url = sourceId.slice("legacy:".length);

      const urlFilter = collection.filter.byProperty("url").equal(url);
      const userFilter = collection.filter.byProperty("userId").equal(userId);
      const legacyFilters = Filters.and(urlFilter, userFilter);

      const legacyObjects = await collection.query.fetchObjects({
        filters: legacyFilters,
        limit: 1000,
        returnProperties: ["url"],
      });

      const pdfFileIds = [
        ...new Set(
          objects
            .map((object) => object.properties?.pdfFileId)
            .filter(
              (id) => typeof id === "string" && /^[a-f0-9]{64}$/i.test(id),
            ),
        ),
      ];
      await deleteObjects(collection, legacyObjects.objects);
if (pdfFileIds.length > 0) {
  const placeholders = pdfFileIds.map(() => "?").join(", ");

  await pool.execute(
    `DELETE FROM uploaded_pdfs WHERE id IN (${placeholders})`,
    pdfFileIds,
  );
}
      return res.json({
        success: true,
        deletedChunks: legacyObjects.objects.length,
      });
    }

    await deleteObjects(collection, objects);

    return res.json({
      success: true,
      deletedChunks: objects.length,
    });
  } catch (error) {
    console.error("Document deletion failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not delete this document.",
    });
  } finally {
    if (client) {
      try {
        await client.close();
      } catch {}
    }
  }
});

// GET /api/documents/user/:userId
// Admin only: Get all documents for a specific user from MySQL.
router.get("/user/:userId", async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT id, user_id, original_name, mime_type, file_size, source_type, source_id, pdf_file_id, created_at
       FROM user_documents
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [targetUserId],
    );

    const items = rows.map((row) => ({
      id: row.id,
      title: row.original_name,
      url: row.source_type === "url" ? row.source_id.replace("url:", "") : row.source_id,
      category: row.mime_type || "documentation",
      sourceType: row.source_type,
      chunks: 1,
      contentHash: null,
      pdfFileId: row.pdf_file_id || "",
      userId: row.user_id,
      createdAt: row.created_at,
      fileSize: row.file_size,
      mimeType: row.mime_type,
    }));

    return res.json({
      success: true,
      totalDocuments: items.length,
      totalChunks: items.length,
      documents: items,
    });
  } catch (error) {
    console.error("GET /api/documents/user/:userId failed:", error);

    res.status(500).json({
      success: false,
      message: "Could not load user documents.",
      ...(process.env.NODE_ENV !== "production" && {
        details: error.message,
      }),
    });
  }
});

export default router;
