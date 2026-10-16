import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  File,
  FileText,
  FileUp,
  Globe,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

function createPdfBlobUrl(pdfFileId) {
  return fetch(`${API_URL}/api/documents/pdf/${encodeURIComponent(pdfFileId)}`)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch PDF");
      return response.blob();
    })
    .then((blob) => URL.createObjectURL(blob))
    .catch((error) => {
      console.error("Failed to create PDF blob URL:", error);
      return null;
    });
}

const COLORS = {
  midnight: "#1B1931",
  purple: "#44174E",
  burgundy: "#6B2249",
  rose: "#A34054",
  amber: "#ED9659",
  blush: "#EBCBC9",
};

export default function DocumentManager({ isDark = false, onClose }) {
  const [url, setUrl] = useState("");
  const [documents, setDocuments] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const fileInputRef = useRef(null);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Fetch PDF as blob and create object URL for same-origin iframe embedding
  useEffect(() => {
    let currentBlobUrl = null;

    if (previewDocument?.pdfFileId) {
      createPdfBlobUrl(previewDocument.pdfFileId).then((url) => {
        if (url) {
          currentBlobUrl = url;
          setPdfBlobUrl(url);
        }
      });
    }

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [previewDocument]);

  // Cleanup blob URL when component unmounts or preview closes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, []);

  const panel = isDark
    ? "border-white/10 bg-[#292039]"
    : "border-[#44174E]/10 bg-[#FFFCFA]";

  const muted = isDark ? "text-[#EBCBC9]/70" : "text-[#716477]";

  const field = isDark
    ? "border-white/10 bg-[#1B1931] text-[#FFF8F5] placeholder:text-white/35"
    : "border-[#44174E]/15 bg-[#FFF8F5] text-[#1B1931] placeholder:text-[#88798A]";

  const loadDocuments = async () => {
    setLoadingList(true);

    try {
      const response = await fetch(`${API_URL}/api/documents`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load documents.");
      }

      setDocuments(data.documents || []);
      setTotalChunks(data.totalChunks || 0);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Could not load indexed documents.",
      });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const ingestUrl = async (event) => {
    event.preventDefault();

    if (!url.trim() || ingesting || uploading) return;

    setIngesting(true);
    setMessage({
      type: "progress",
      text: "Ingesting documentation and generating chunks...",
    });

    try {
      const response = await fetch(`${API_URL}/api/documents/url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "URL ingestion failed.");
      }

      // Support both single-page and crawler response formats.
      const chunkCount = data.totalChunks ?? data.chunks ?? 0;

      setMessage({
        type: data.status === "duplicate" ? "info" : "success",
        text: `${data.message || "Documentation ingestion completed."} ${chunkCount} chunks.`,
      });

      setUrl("");

      // Refresh the indexed documents and chunk statistics.
      await loadDocuments();
    } catch (error) {
      console.error("URL ingestion failed:", error);

      setMessage({
        type: "error",
        text: error.message || "Could not index this URL.",
      });
    } finally {
      setIngesting(false);
    }
  };

  const ingestFile = async () => {
    if (!selectedFile || uploading || ingesting) return;

    setUploading(true);
    setMessage({
      type: "progress",
      text: `Extracting and indexing ${selectedFile.name}...`,
    });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "File ingestion failed.");
      }

      setMessage({
        type: data.status === "duplicate" ? "info" : "success",
        text: `${data.message} ${data.chunks} chunks.`,
      });

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDocuments();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Could not index this file.",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (document) => {
    const confirmed = window.confirm(
      `Delete "${document.title}" and its indexed chunks?`,
    );

    if (!confirmed) return;

    setDeletingId(document.id);

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${encodeURIComponent(document.id)}`,
        { method: "DELETE" },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete document.");
      }

      setMessage({
        type: "success",
        text: `Document deleted. ${data.deletedChunks} chunks removed.`,
      });

      await loadDocuments();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Could not delete document.",
      });
    } finally {
      setDeletingId("");
    }
  };

  const chooseFile = (file) => {
    if (!file) return;

    const allowedExtensions = [".pdf", ".md", ".markdown", ".txt"];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(extension)) {
      setMessage({
        type: "error",
        text: "Choose a PDF, Markdown, or TXT file.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Files must be 10 MB or smaller.",
      });
      return;
    }

    setSelectedFile(file);
    setMessage(null);
  };

  const busy = ingesting || uploading;

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{
              background: isDark ? "#44174E" : "#F0E5EB",
              color: isDark ? COLORS.blush : COLORS.burgundy,
            }}
          >
            <FileText size={13} />
            Knowledge base
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            Document Manager
          </h2>

          <p className={`mt-2 max-w-xl text-sm leading-6 ${muted}`}>
            Add documentation to Weaviate. Your AI assistant can then retrieve
            relevant passages when answering questions.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isDark ? "border-white/10" : "border-[#44174E]/10"
            }`}
            aria-label="Close document manager"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-2xl border p-5 ${panel}`}>
          <div className={`flex items-center gap-2 text-xs ${muted}`}>
            <FileText size={15} style={{ color: COLORS.rose }} />
            Indexed documents
          </div>
          <p className="mt-3 text-3xl font-semibold">
            {loadingList ? "—" : documents.length}
          </p>
        </div>

        <div className={`rounded-2xl border p-5 ${panel}`}>
          <div className={`flex items-center gap-2 text-xs ${muted}`}>
            <CheckCircle2 size={15} style={{ color: COLORS.amber }} />
            Indexed chunks
          </div>
          <p className="mt-3 text-3xl font-semibold">
            {loadingList ? "—" : totalChunks}
          </p>
        </div>
      </div>

      {/* Status */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border p-4 text-sm"
          style={{
            borderColor:
              message.type === "error"
                ? `${COLORS.rose}60`
                : `${COLORS.burgundy}35`,
            background:
              message.type === "error"
                ? `${COLORS.rose}12`
                : isDark
                  ? "#44174E"
                  : "#F4E9ED",
          }}
        >
          {message.type === "progress" ? (
            <LoaderCircle
              size={18}
              className="mt-0.5 shrink-0 animate-spin"
              style={{ color: COLORS.amber }}
            />
          ) : message.type === "error" ? (
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: COLORS.rose }}
            />
          ) : (
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: COLORS.amber }}
            />
          )}

          <p className="min-w-0 flex-1 leading-6">{message.text}</p>

          <button
            onClick={() => setMessage(null)}
            aria-label="Dismiss status"
            className="opacity-60 hover:opacity-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* URL ingestion */}
      <section className={`rounded-2xl border p-5 sm:p-6 ${panel}`}>
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: isDark ? "#44174E" : "#F0E5EB",
              color: COLORS.rose,
            }}
          >
            <Globe size={19} />
          </div>
          <div>
            <h3 className="font-semibold">Add from a URL</h3>
            <p className={`mt-1 text-xs ${muted}`}>
              Ingest a public HTML, Markdown, or text documentation page.
            </p>
          </div>
        </div>

        <form onSubmit={ingestUrl} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://react.dev/learn"
            disabled={busy}
            className={`min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#ED9659] ${field}`}
          />

          <button
            type="submit"
            disabled={busy || !url.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: COLORS.amber, color: COLORS.midnight }}
          >
            {ingesting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Globe size={16} />
            )}
            {ingesting ? "Indexing..." : "Add URL"}
          </button>
        </form>
      </section>

      {/* File ingestion */}
      <section className={`rounded-2xl border p-5 sm:p-6 ${panel}`}>
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: isDark ? "#6B2249" : "#F4E3E4",
              color: COLORS.rose,
            }}
          >
            <FileUp size={19} />
          </div>
          <div>
            <h3 className="font-semibold">Upload a document</h3>
            <p className={`mt-1 text-xs ${muted}`}>
              PDF, Markdown, and plain text. Maximum size: 10 MB.
            </p>
          </div>
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            chooseFile(event.dataTransfer.files?.[0]);
          }}
          className="block cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8"
          style={{
            borderColor: dragging ? COLORS.amber : `${COLORS.rose}55`,
            background: dragging
              ? `${COLORS.amber}12`
              : isDark
                ? "#1B1931"
                : "#FFF8F5",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.md,.markdown,.txt,application/pdf,text/plain,text/markdown"
            className="sr-only"
            disabled={busy}
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />

          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: isDark ? "#44174E" : "#F0E5EB",
              color: COLORS.rose,
            }}
          >
            <Upload size={22} />
          </div>

          <p className="mt-4 text-sm font-semibold">
            Drop a file here or{" "}
            <span style={{ color: COLORS.rose }}>browse files</span>
          </p>

          <p className={`mt-2 text-xs ${muted}`}>PDF · MD · Markdown · TXT</p>
        </label>

        {selectedFile && (
          <div
            className={`mt-4 flex items-center gap-3 rounded-xl border p-3 ${
              isDark ? "border-white/10" : "border-[#44174E]/10"
            }`}
          >
            <File size={19} style={{ color: COLORS.amber }} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {selectedFile.name}
              </p>
              <p className={`mt-1 text-xs ${muted}`}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="opacity-60 hover:opacity-100"
              aria-label="Remove selected file"
            >
              <X size={16} />
            </button>

            <button
              onClick={ingestFile}
              disabled={busy}
              className="rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-50"
              style={{ background: COLORS.amber, color: COLORS.midnight }}
            >
              {uploading ? "Indexing..." : "Upload"}
            </button>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className={muted}>Extracting text and indexing chunks</span>
              <LoaderCircle
                size={14}
                className="animate-spin"
                style={{ color: COLORS.amber }}
              />
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#44174E]/15">
              <div
                className="h-full w-2/3 animate-pulse rounded-full"
                style={{ background: COLORS.amber }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Indexed documents */}
      <section className={`rounded-2xl border p-5 sm:p-6 ${panel}`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Indexed documents</h3>
            <p className={`mt-1 text-xs ${muted}`}>
              Sources currently available to your AI assistant.
            </p>
          </div>

          <button
            onClick={loadDocuments}
            disabled={loadingList}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
              isDark ? "border-white/10" : "border-[#44174E]/10"
            }`}
          >
            <RefreshCw
              size={14}
              className={loadingList ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loadingList ? (
          <div
            className={`flex items-center justify-center gap-2 py-10 text-sm ${muted}`}
          >
            <LoaderCircle size={18} className="animate-spin" />
            Loading document status...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-10 text-center">
            <FileText
              size={30}
              className="mx-auto"
              style={{ color: COLORS.rose }}
            />
            <p className="mt-3 text-sm font-medium">No documents found</p>
            <p className={`mt-1 text-xs ${muted}`}>
              Add a URL or upload a file to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 sm:p-4 ${
                  isDark ? "border-white/10" : "border-[#44174E]/10"
                }`}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: isDark ? "#44174E" : "#F0E5EB",
                    color: COLORS.rose,
                  }}
                >
                  {document.sourceType === "url" ? (
                    <Globe size={18} />
                  ) : (
                    <FileText size={18} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {document.title}
                  </p>
                  <div
                    className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] ${muted}`}
                  >
                    <span className="uppercase">{document.sourceType}</span>
                    <span>·</span>
                    <span>{document.chunks} chunks</span>
                    {document.url?.startsWith("http") && (
                      <>
                        <span>·</span>
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                          style={{ color: COLORS.rose }}
                        >
                          Open source <ExternalLink size={11} />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className="hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium sm:inline-flex"
                  style={{
                    background: isDark ? "#6B2249" : "#F0E5EB",
                    color: isDark ? COLORS.blush : COLORS.burgundy,
                  }}
                >
                  <CheckCircle2 size={12} />
                  Indexed
                </span>
                {document.pdfFileId && (
                  <button
                    type="button"
                    onClick={() => setPreviewDocument(document)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-[#ED9659]/15"
                    style={{ color: COLORS.amber }}
                    aria-label={`Preview ${document.title}`}
                    title="Preview PDF"
                  >
                    <Eye size={17} />
                  </button>
                )}
                <button
                  onClick={() => deleteDocument(document)}
                  disabled={deletingId === document.id}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-[#A34054]/10 disabled:opacity-50"
                  style={{ color: COLORS.rose }}
                  aria-label={`Delete ${document.title}`}
                  title="Delete document"
                >
                  {deletingId === document.id ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      {previewDocument && (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-black/50"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewDocument(null);
            }
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`PDF preview: ${previewDocument.title}`}
            className={`flex h-full w-full max-w-3xl flex-col border-l shadow-2xl ${
              isDark
                ? "border-white/10 bg-[#1B1931]"
                : "border-[#44174E]/10 bg-[#FFFCFA]"
            }`}
          >
            <header className="flex items-center gap-3 border-b border-current/10 p-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: isDark ? "#44174E" : "#F0E5EB",
                  color: COLORS.rose,
                }}
              >
                <FileText size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold">
                  {previewDocument.title}
                </h3>
                <p className={`mt-1 text-xs ${muted}`}>PDF preview</p>
              </div>

              <a
                href={`${API_URL}/api/documents/pdf/${encodeURIComponent(
                  previewDocument.pdfFileId,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-current/5"
                title="Open PDF in a new tab"
                aria-label="Open PDF in a new tab"
              >
                <ExternalLink size={17} />
              </a>

              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-current/5"
                aria-label="Close PDF preview"
                title="Close preview"
              >
                <X size={19} />
              </button>
            </header>

            <div className="min-h-0 flex-1 bg-[#525659]">
              {pdfBlobUrl ? (
                <iframe
                  key={previewDocument.pdfFileId}
                  src={pdfBlobUrl}
                  title={`PDF preview: ${previewDocument.title}`}
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-center p-4">
                  <LoaderCircle size={32} className="animate-spin mx-auto" style={{ color: COLORS.amber }} />
                  <p className={`mt-2 text-sm ${muted}`}>Loading PDF preview...</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
