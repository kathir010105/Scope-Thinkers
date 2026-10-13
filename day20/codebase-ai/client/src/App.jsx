import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Layers3,
  Search,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const suggestions = [
  {
    category: "EXPRESS.JS",
    question: "How do I implement authentication middleware?",
  },
  {
    category: "REACT",
    question: "When should I use useEffect?",
  },
  {
    category: "JAVASCRIPT",
    question: "Explain async/await with examples",
  },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [connection, setConnection] = useState("checking");
  const [notice, setNotice] = useState("");

  async function checkConnection() {
    setConnection("checking");

    try {
      const response = await fetch(`${API_BASE}/api/weaviate/status`);
      const data = await response.json();

      setConnection(response.ok && data.connected ? "connected" : "error");
    } catch {
      setConnection("error");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function checkInitialConnection() {
      try {
        const response = await fetch(`${API_BASE}/api/weaviate/status`);
        const data = await response.json();

        if (!cancelled) {
          setConnection(response.ok && data.connected ? "connected" : "error");
        }
      } catch {
        if (!cancelled) setConnection("error");
      }
    }

    checkInitialConnection();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    if (!query.trim()) return;

    setNotice(
      "Search UI is ready. Documentation retrieval will be connected after we index our first library.",
    );
  }

  function chooseQuestion(question) {
    setQuery(question);
    setNotice("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <div className="brand-icon">
            <Code2 size={23} />
          </div>
          <div>
            <div className="brand-name">CodeBase AI</div>
            <div className="brand-caption">DEVELOPER SEARCH</div>
          </div>
        </a>

        <div className="sidebar-label">WORKSPACE</div>

        <button className="nav-item active" type="button">
          <Search size={18} />
          Documentation search
        </button>

        <button
          className="nav-item"
          type="button"
          onClick={() =>
            setNotice("Your documentation library will appear here in Phase 2.")
          }
        >
          <BookOpen size={18} />
          Documentation library
        </button>

        <button
          className="nav-item"
          type="button"
          onClick={() =>
            setNotice("Search history will be implemented after search works.")
          }
        >
          <Activity size={18} />
          Recent activity
        </button>

        <div className="sidebar-bottom">
          <div className="connection-card">
            <div className="connection-heading">
              <Database size={16} />
              DATABASE STATUS
            </div>

            <div className="connection-value">
              <span className={`status-dot ${connection}`} />
              {connection === "checking" && "Checking connection"}
              {connection === "connected" && "Weaviate connected"}
              {connection === "error" && "Connection unavailable"}
            </div>

            <p>
              {connection === "connected"
                ? "Your cloud database is ready."
                : connection === "checking"
                  ? "Checking your backend and cluster."
                  : "Check your server, credentials, and cluster status."}
            </p>

            <button
              className="retry-button"
              type="button"
              onClick={checkConnection}
            >
              Retry connection <ArrowRight size={14} />
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="avatar">CB</div>
            <div className="footer-user">
              <strong>Developer workspace</strong>
              <span>Local development</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Documentation search</strong>
          </div>

          <div className="topbar-right">
            <span className="environment-pill">
              <span className="status-dot connected" />
              DEVELOPMENT
            </span>
            <a
              className="icon-link"
              href="https://docs.weaviate.io/"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Weaviate documentation"
              title="Weaviate documentation"
            >
              <ExternalLink size={17} />
            </a>
          </div>
        </header>

        <section className="content">
          <div className="welcome-label">
            <Sparkles size={15} />
            YOUR AI-POWERED DEVELOPER COMPANION
          </div>

          <h1>
            Build better.
            <br />
            <span>Understand faster.</span>
          </h1>

          <p className="hero-description">
            Search technical documentation, understand APIs, and discover code
            examples — all in one place, backed by relevant sources.
          </p>

          <section className="search-panel">
            <div className="search-panel-label">
              <Search size={16} />
              ASK A DEVELOPMENT QUESTION
              <span className="keyboard-hint">
                <Terminal size={13} /> AI SEARCH
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setNotice("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="e.g. How does JWT authentication middleware work in Express?"
                rows={3}
                aria-label="Ask a development question"
              />

              <div className="search-panel-bottom">
                <span>Enter to submit · Shift + Enter for a new line</span>
                <button
                  className="search-button"
                  type="submit"
                  disabled={!query.trim()}
                >
                  Search docs <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {notice && (
              <div className="notice" role="status">
                <Sparkles size={16} />
                <span>{notice}</span>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </section>

          <section className="suggestions-section">
            <div className="section-heading">
              <div>
                <h2>Try asking</h2>
                <p>Explore common developer questions</p>
              </div>
              <span className="section-count">03 SUGGESTIONS</span>
            </div>

            <div className="suggestion-list">
              {suggestions.map((item, index) => (
                <button
                  type="button"
                  className="suggestion-card"
                  key={item.question}
                  onClick={() => chooseQuestion(item.question)}
                >
                  <span className="suggestion-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="suggestion-content">
                    <span className="suggestion-category">{item.category}</span>
                    <span className="suggestion-question">{item.question}</span>
                  </span>
                  <ArrowUpRight size={18} className="suggestion-arrow" />
                </button>
              ))}
            </div>
          </section>

          <section className="capabilities-section">
            <div className="section-heading">
              <div>
                <h2>What powers CodeBase AI?</h2>
                <p>Three components working together</p>
              </div>
            </div>

            <div className="capability-grid">
              <article className="capability-card">
                <div className="capability-icon purple">
                  <Database size={20} />
                </div>
                <h3>Weaviate</h3>
                <p>
                  Retrieve technical passages using vector similarity and hybrid
                  keyword search.
                </p>
                <span className="capability-tag">RETRIEVAL</span>
              </article>

              <article className="capability-card">
                <div className="capability-icon blue">
                  <Sparkles size={20} />
                </div>
                <h3>Gemini</h3>
                <p>
                  Explain APIs and generate useful examples using retrieved
                  documentation.
                </p>
                <span className="capability-tag">GENERATION</span>
              </article>

              <article className="capability-card">
                <div className="capability-icon green">
                  <Layers3 size={20} />
                </div>
                <h3>Source-backed answers</h3>
                <p>
                  Link responses to the documentation passages that support
                  them.
                </p>
                <span className="capability-tag">CONTEXT</span>
              </article>
            </div>
          </section>

          <footer className="page-footer">
            <span>
              <CheckCircle2 size={14} />
              CodeBase AI · Phase 1
            </span>
            <span>Built for developers, by developers.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
