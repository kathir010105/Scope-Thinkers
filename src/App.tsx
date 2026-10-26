import { useEffect, useState } from "react";
import "./App.css";

interface ElementDetails {
  tagName: string;
  id: string;
  className: string;
  selector: string;
  textContent: string;
  page: string;

  dimensions: {
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
  };

  scroll: {
    scrollWidth: number;
    scrollHeight: number;
    clientWidth: number;
    clientHeight: number;
    hasHorizontalOverflow: boolean;
    hasVerticalOverflow: boolean;
  };

  viewport: {
    width: number;
    height: number;
  };

  parent: {
    tagName: string;
    id: string;
    className: string;
    display: string;
    width: number;
    height: number;
  } | null;

  computedStyles: Record<string, string>;
}

const STORAGE_KEY = "cssDetectiveSelection";

function App() {
  const [details, setDetails] = useState<ElementDetails | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "styles" | "layout">(
    "overview",
  );

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (result[STORAGE_KEY]) {
        setDetails(result[STORAGE_KEY] as ElementDetails);
      }
    });

    const handleStorageChange = (
      changes: {
        [key: string]: chrome.storage.StorageChange;
      },
      areaName: string,
    ) => {
      if (areaName === "local" && changes[STORAGE_KEY]) {
        setDetails(
          (changes[STORAGE_KEY].newValue as ElementDetails | undefined) ?? null,
        );
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  async function selectElement() {
    setLoading(true);
    setError("");

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.id) {
        throw new Error("No active browser tab was found.");
      }

      if (!tab.url || !/^https?:\/\//i.test(tab.url)) {
        throw new Error(
          "Open a regular website first. Chrome internal pages cannot be inspected.",
        );
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      await chrome.tabs.sendMessage(tab.id, {
        type: "CSS_DETECTIVE_START_PICKING",
      });

      // The popup will close when you click the webpage.
      // The injected script continues running.
      window.close();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to start the element picker.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function clearSelection() {
    await chrome.storage.local.remove(STORAGE_KEY);
    setDetails(null);
    setError("");
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  const styles = details?.computedStyles;

  const layoutIssues = details
    ? [
        details.scroll.hasHorizontalOverflow
          ? "The element has horizontal overflow."
          : null,

        details.scroll.hasVerticalOverflow
          ? "The element has vertical overflow."
          : null,

        details.parent && details.dimensions.width > details.parent.width + 1
          ? "The element is wider than its parent."
          : null,

        details.dimensions.right > details.viewport.width + 1 ||
        details.dimensions.left < -1
          ? "The element is wider than the popup viewport."
          : null,
      ].filter((issue): issue is string => Boolean(issue))
    : [];

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">C</div>

          <div>
            <h1>CSS Detective</h1>
            <p>Visual layout debugger</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot" />
          Inspector
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">
          <span className="sparkle">✳</span>
          DEVELOPER TOOLKIT
        </div>

        <h2>
          Find the problem.
          <br />
          <span>Fix the layout.</span>
        </h2>

        <p className="hero-description">
          Inspect any element, explore its CSS, and understand what's happening
          in your layout.
        </p>

        <button
          className="primary-button"
          onClick={selectElement}
          disabled={loading}
        >
          <span className="button-icon">⌖</span>

          {loading ? "Starting inspector..." : "Select element on page"}

          <span className="button-arrow">↗</span>
        </button>

        <p className="hint">
          Click the button, then click any element on the page. Press Esc to
          cancel.
        </p>

        {error && <div className="error-message">{error}</div>}
      </section>

      {details ? (
        <>
          <section className="selection-card">
            <div className="section-heading">
              <div>
                <p className="section-label">SELECTED ELEMENT</p>

                <h3>Element inspector</h3>
              </div>

              <button
                className="icon-button"
                title="Clear selection"
                onClick={clearSelection}
              >
                ×
              </button>
            </div>

            <div className="element-identity">
              <span className="tag-badge">{details.tagName}</span>

              <span className="element-name">
                {details.id
                  ? `#${details.id}`
                  : details.className
                    ? `.${details.className.trim().split(/\s+/).join(".")}`
                    : "Selected element"}
              </span>
            </div>

            <div className="selector-row">
              <code>{details.selector}</code>

              <button
                className="copy-button"
                onClick={() => copyText(details.selector)}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="dimension-grid">
              <div className="dimension">
                <span>Width</span>
                <strong>{details.dimensions.width}px</strong>
              </div>

              <div className="dimension">
                <span>Height</span>
                <strong>{details.dimensions.height}px</strong>
              </div>
            </div>

            <nav className="tabs">
              <button
                className={activeTab === "overview" ? "active" : ""}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>

              <button
                className={activeTab === "styles" ? "active" : ""}
                onClick={() => setActiveTab("styles")}
              >
                Styles
              </button>

              <button
                className={activeTab === "layout" ? "active" : ""}
                onClick={() => setActiveTab("layout")}
              >
                Layout
              </button>
            </nav>

            {activeTab === "overview" && (
              <div className="tab-content">
                <div className="subheading">
                  <h4>Element details</h4>

                  <button
                    className="text-button"
                    onClick={() => copyText(JSON.stringify(details, null, 2))}
                  >
                    Copy JSON
                  </button>
                </div>

                <div className="detail-row">
                  <span>HTML tag</span>
                  <code>{details.tagName}</code>
                </div>

                <div className="detail-row">
                  <span>Element ID</span>
                  <code>{details.id || "None"}</code>
                </div>

                <div className="detail-row">
                  <span>Classes</span>

                  <code className="truncate">
                    {details.className || "None"}
                  </code>
                </div>

                <div className="detail-row">
                  <span>Position</span>

                  <code>{styles?.position || "—"}</code>
                </div>

                <div className="detail-row">
                  <span>Display</span>

                  <code>{styles?.display || "—"}</code>
                </div>

                <div className="detail-row">
                  <span>Box sizing</span>

                  <code>{styles?.["box-sizing"] || "—"}</code>
                </div>

                {details.textContent && (
                  <div className="text-preview">
                    <span>Text content</span>

                    <p>{details.textContent}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "styles" && (
              <div className="tab-content">
                <div className="subheading">
                  <h4>Computed CSS</h4>

                  <button
                    className="text-button"
                    onClick={() =>
                      copyText(
                        Object.entries(styles || {})
                          .map(([property, value]) => `${property}: ${value};`)
                          .join("\n"),
                      )
                    }
                  >
                    Copy CSS
                  </button>
                </div>

                {Object.entries(styles || {}).map(([property, value]) => (
                  <div className="style-row" key={property}>
                    <code>{property}</code>
                    <span>{value || "—"}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "layout" && (
              <div className="tab-content">
                <h4 className="layout-title">Layout diagnostics</h4>

                <div className="box-model">
                  <div className="box-margin">
                    <span className="box-label">MARGIN</span>

                    <div className="box-border">
                      <span className="box-label">BORDER</span>

                      <div className="box-padding">
                        <span className="box-label">PADDING</span>

                        <div className="box-content">
                          <strong>
                            {details.dimensions.width} ×{" "}
                            {details.dimensions.height}
                          </strong>

                          <span>CONTENT AREA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-row">
                  <span>Scroll width</span>

                  <code>{details.scroll.scrollWidth}px</code>
                </div>

                <div className="detail-row">
                  <span>Client width</span>

                  <code>{details.scroll.clientWidth}px</code>
                </div>

                <div className="detail-row">
                  <span>Parent display</span>

                  <code>{details.parent?.display || "—"}</code>
                </div>

                <div className="issues-section">
                  <h4>Detected issues ({layoutIssues.length})</h4>

                  {layoutIssues.length > 0 ? (
                    layoutIssues.map((issue) => (
                      <div className="issue" key={issue}>
                        <span>!</span>
                        {issue}
                      </div>
                    ))
                  ) : (
                    <div className="success-message">
                      <span>✓</span>
                      No basic overflow issues detected.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="empty-state">
          <div className="empty-icon">⌗</div>

          <h3>Nothing selected yet</h3>

          <p>
            Select an element on any website to inspect its CSS properties and
            layout.
          </p>
        </section>
      )}

      <footer className="footer">
        <span>CSS DETECTIVE</span>
        <span>Built for developers</span>
      </footer>
    </main>
  );
}

export default App;
