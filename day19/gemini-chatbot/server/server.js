import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MODEL = "gemini-3.5-flash-lite";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing from server/.env");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Chatbot backend is running",
  });
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getStatus(error) {
  return Number(
    error?.status ?? error?.statusCode ?? error?.code ?? error?.error?.code,
  );
}

function getFriendlyError(status) {
  if (status === 429) {
    return "Gemini rate limit or quota reached. Check your API usage and try again later.";
  }

  if (status === 503 || status === 502 || status === 504) {
    return "Gemini is temporarily unavailable due to high demand. Please try again shortly.";
  }

  if (status === 401 || status === 403) {
    return "Gemini rejected the request. Check your API key and API access.";
  }

  if (status === 400) {
    return "Gemini rejected the request. Check the message and conversation history.";
  }

  return "Unable to generate a response. Please try again.";
}

// Retry only temporary errors, with a maximum of 3 attempts.
async function createGeminiStream(contents) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContentStream({
        model: MODEL,
        contents,
        config: {
          systemInstruction:
            "You are a helpful AI assistant. Explain concepts clearly, " +
            "be accurate, and admit when you are unsure.",
          maxOutputTokens: 2048,
        },
      });
    } catch (error) {
      const status = getStatus(error);
      const retryable = [429, 500, 502, 503, 504].includes(status);

      console.error(
        `Gemini request failed (attempt ${attempt}/${maxAttempts}), status:`,
        status || "unknown",
        error.message,
      );

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);
      console.log(`Retrying Gemini request in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw new Error("Gemini request failed after retries.");
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    if (message.length > 10000) {
      return res.status(400).json({
        error: "Message is too long.",
      });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: "Invalid conversation history.",
      });
    }

    const previousMessages = history
      .filter(
        (item) =>
          item &&
          ["user", "model"].includes(item.role) &&
          typeof item.text === "string",
      )
      .slice(-20)
      .map((item) => ({
        role: item.role,
        parts: [{ text: item.text.slice(0, 10000) }],
      }));

    const contents = [
      ...previousMessages,
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ];

    // Retry temporary errors before sending response headers.
    const stream = await createGeminiStream(contents);

    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.flushHeaders();

    for await (const chunk of stream) {
      if (res.destroyed) return;

      if (chunk.text) {
        res.write(JSON.stringify({ text: chunk.text }) + "\n");
      }
    }

    if (!res.destroyed) {
      res.end();
    }
  } catch (error) {
    const status = getStatus(error);

    console.error("Gemini streaming error:", {
      status: status || "unknown",
      message: error.message,
    });

    const friendlyError = getFriendlyError(status);

    // Once streaming has started, the HTTP status cannot be changed.
    if (res.headersSent) {
      if (!res.destroyed) {
        res.write(JSON.stringify({ error: friendlyError }) + "\n");
        res.end();
      }
      return;
    }

    let httpStatus = 500;

    if (status === 429) {
      httpStatus = 429;
    } else if ([502, 503, 504].includes(status)) {
      httpStatus = 503;
    } else if (status === 401 || status === 403) {
      httpStatus = 502;
    } else if (status === 400) {
      httpStatus = 400;
    }

    res.status(httpStatus).json({
      error: friendlyError,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot backend running at http://localhost:${PORT}`);
  console.log(`Gemini model: ${MODEL}`);
});
