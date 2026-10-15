import "dotenv/config";
import express from "express";
import cors from "cors";
import weaviateRouter from "./routes/weaviate.js";
import ingestRouter from "./routes/ingest.js";
import searchRouter from "./routes/search.js";
import documentsRouter from "./routes/documents.js";
import debugRouter from "./routes/debug.js";


const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/ingest", ingestRouter);
app.use("/api/search", searchRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/debug", debugRouter);
app.use("/api/weaviate", weaviateRouter);


app.get("/", (req, res) => {
  res.json({
    name: "CodeBase AI API",
    status: "running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CodeBase AI backend is running.",
  });
});

app.get("/api/config/status", (req, res) => {
  res.json({
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    weaviateConfigured: Boolean(
      process.env.WEAVIATE_URL && process.env.WEAVIATE_API_KEY,
    ),
  });
});



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

app.listen(PORT, () => {
  console.log(`CodeBase AI API running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
