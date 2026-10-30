import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clipboard,
  Code2,
  Copy,
  Crosshair,
  Eye,
  FileCode2,
  Layers,
  LayoutDashboard,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import {
  getCssDiagnostics,
  type ElementDetails,
  type CssDiagnostic,
} from "./utils/cssDiagnostics";

import "./App.css";

type Tab = "overview" | "styles" | "layout";

const STORAGE_KEY = "cssDetectiveSelection";

const STYLE_GROUPS: {
  title: string;
  icon: typeof Code2;
  properties: string[];
}[] = [
  {
    title: "Layout",
    icon: LayoutDashboard,
    properties: [
      "display",
      "position",
      "box-sizing",
      "width",
      "height",
      "min-width",
      "max-width",
      "min-height",
      "max-height",
    ],
  },
  {
    title: "Spacing",
    icon: Layers,
    properties: [
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
    ],
  },
  {
    title: "Flexbox & Grid",
    icon: Activity,
    properties: [
      "flex-direction",
      "flex-wrap",
      "justify-content",
      "align-items",
      "align-content",
      "gap",
      "grid-template-columns",
      "grid-template-rows",
    ],
  },
  {
    title: "Appearance",
    icon: Eye,
    properties: [
      "font-size",
      "line-height",
      "color",
      "background-color",
      "transform",
      "z-index",
    ],
  },
];

function getElementLabel(details: ElementDetails): string {
  if (details.id) {
    return `#${details.id}`;
  }

  if (details.className) {
    return `.${details.className.trim().split(/\s+/).slice(0, 2).join(".")}`;
  }

  return details.tagName;
}

function formatBytes(value: number): string {
  return `${Math.round(value)}px`;
}

function DiagnosticCard({
  diagnostic,
}: {
  diagnostic: CssDiagnostic;
}) {
  const severityIcon = {
    error: CircleAlert,
    warning: AlertTriangle,
    info: ShieldCheck,
  };

  const Icon = severityIcon[diagnostic.severity];

  return (
    <article
      className={`diagnostic-card severity-${diagnostic.severity}`}
    >
      <div className="diagnostic-card-heading">
        <span className="severity-badge">
          <Icon size={12} />
          {diagnostic.severity.toUpperCase()}
        </span>

        <h4>{diagnostic.title}</h4>
      </div>

      <p className="diagnostic-description">
        {diagnostic.description}
      </p>

      <div className="diagnostic-evidence">
        <strong>Evidence</strong>
        <p>{diagnostic.evidence}</p>
      </div>

      <div className="diagnostic-fix">
        <strong>Suggested fix</strong>
        <p>{diagnostic.suggestedFix}</p>
      </div>
    </article>
  );
}

function App() {
  const [details, setDetails] = useState<ElementDetails | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isPicking, setIsPicking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSelection() {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);

        if (mounted && result[STORAGE_KEY]) {
          setDetails(result[STORAGE_KEY] as ElementDetails);
        }
      } catch {
        if (mounted) {
          setError(
            "Could not access extension storage. Reload the extension and try again."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSelection();

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName !== "local") return;

      if (changes[STORAGE_KEY]) {
        const newValue = changes[STORAGE_KEY].newValue;

        setDetails((newValue as ElementDetails | undefined) ?? null);
        setIsPicking(false);
        setError("");
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const diagnostics = useMemo(
    () => (details ? getCssDiagnostics(details) : []),
    [details]
  );

  const errorCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error"
  ).length;

  const warningCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "warning"
  ).length;

  const infoCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "info"
  ).length;

  const selectElement = useCallback(async () => {
    setError("");

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id || !tab.url) {
        setError("Could not access the active browser tab.");
        return;
      }

      if (
        !tab.url.startsWith("http://") &&
        !tab.url.startsWith("https://")
      ) {
        setError(
          "This page cannot be inspected. Open a regular website and try again."
        );
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      await chrome.tabs.sendMessage(tab.id, {
        type: "CSS_DETECTIVE_START_PICKING",
      });

      setIsPicking(true);
      window.close();
    } catch (err) {
      console.error("CSS Detective picker error:", err);

      setError(
        "Could not start element selection. Reload the page and try again."
      );
    }
  }, []);

  const stopPicking = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: "CSS_DETECTIVE_STOP_PICKING",
        });
      }
    } catch (err) {
      console.error("Could not stop element picker:", err);
    }

    setIsPicking(false);
  }, []);

  const clearSelection = useCallback(async () => {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
      setDetails(null);
      setActiveTab("overview");
      setError("");
    } catch {
      setError("Could not clear the saved inspection.");
    }
  }, []);

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, []);

  const tabs: {
    id: Tab;
    label: string;
    icon: typeof Eye;
  }[] = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "styles", label: "Styles", icon: Code2 },
    { id: "layout", label: "Layout", icon: Layers },
  ];

  return (
    <main className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <ScanSearch size={21} strokeWidth={2.2} />
          </div>

          <div className="brand-copy">
            <h1>CSS Detective</h1>
            <p>Website layout inspector</p>
          </div>
        </div>

        <button
          className="icon-button"
          title="Refresh inspection data"
          aria-label="Refresh inspection data"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={16} />
        </button>
      </header>

      <section className="hero">
        <div className="hero-top">
          <span className="hero-eyebrow">
            <span className="status-dot" />
            DEVELOPER TOOLKIT
          </span>

          <span className="version-badge">v1.0</span>
        </div>

        <h2>
          Find the problem.
          <br />
          <span>Fix the layout.</span>
        </h2>

        <p>
          Inspect any element, explore its computed CSS, and discover
          potential layout issues.
        </p>

        <button
          className="primary-button"
          onClick={() => void selectElement()}
          disabled={isLoading}
        >
          <Crosshair size={17} />
          Inspect an element
          <ArrowUpRight size={16} className="button-arrow" />
        </button>

        <div className="hero-hint">
          <span>Click to activate the picker</span>
          <span className="keyboard-key">ESC</span>
          <span>to cancel</span>
        </div>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>

          <button
            className="error-dismiss"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {isPicking && (
        <div className="picking-banner">
          <Crosshair size={16} />
          <span>Element picker is active.</span>

          <button onClick={() => void stopPicking()}>
            Cancel
          </button>
        </div>
      )}

      <section className="inspection-section">
        <div className="section-heading">
          <div>
            <h3>Current inspection</h3>
            <p>Your selected element and its properties</p>
          </div>

          {details && (
            <button
              className="text-button danger-text"
              onClick={() => void clearSelection()}
              title="Clear selected element"
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>

        {!details ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ScanSearch size={25} />
            </div>

            <h4>No element selected</h4>

            <p>
              Open a website, click Inspect an element, and select
              something on the page to start debugging.
            </p>

            <div className="empty-steps">
              <div className="empty-step">
                <span>1</span>
                Activate the picker
              </div>

              <ChevronRight size={14} />

              <div className="empty-step">
                <span>2</span>
                Click an element
              </div>
            </div>
          </div>
        ) : (
          <div className="selected-element-card">
            <div className="selected-element-top">
              <div className="element-tag">
                <FileCode2 size={17} />
                <span>{details.tagName}</span>
              </div>

              <span className="selected-badge">
                <Check size={11} />
                SELECTED
              </span>
            </div>

            <div className="element-identity">
              <div className="element-label">
                {getElementLabel(details)}
              </div>

              <div className="element-selector">
                <code>{details.selector}</code>

                <button
                  className="small-icon-button"
                  title="Copy CSS selector"
                  aria-label="Copy CSS selector"
                  onClick={() => void copyText(details.selector)}
                >
                  {copied ? (
                    <Check size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {details.textContent && (
              <p className="element-text-preview">
                {details.textContent}
              </p>
            )}

            <div className="dimension-grid">
              <div className="dimension-item">
                <span>WIDTH</span>
                <strong>{formatBytes(details.dimensions.width)}</strong>
              </div>

              <div className="dimension-item">
                <span>HEIGHT</span>
                <strong>{formatBytes(details.dimensions.height)}</strong>
              </div>

              <div className="dimension-item">
                <span>DISPLAY</span>
                <strong>
                  {details.computedStyles.display || "unknown"}
                </strong>
              </div>
            </div>
          </div>
        )}
      </section>

      {details && (
        <>
          <nav className="tab-navigation" aria-label="Inspection sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  className={`tab-button ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} />
                  {tab.label}

                  {tab.id === "layout" && diagnostics.length > 0 && (
                    <span className="tab-count">
                      {diagnostics.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <section className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-content">
                <div className="section-heading compact-heading">
                  <div>
                    <h3>Element overview</h3>
                    <p>Dimensions and layout information</p>
                  </div>
                </div>

                <div className="overview-grid">
                  <div className="overview-card">
                    <span>POSITION</span>
                    <strong>
                      {details.computedStyles.position || "unknown"}
                    </strong>
                  </div>

                  <div className="overview-card">
                    <span>BOX SIZING</span>
                    <strong>
                      {details.computedStyles["box-sizing"] || "unknown"}
                    </strong>
                  </div>

                  <div className="overview-card">
                    <span>VIEWPORT</span>
                    <strong>
                      {details.viewport.width} × {details.viewport.height}
                    </strong>
                  </div>

                  <div className="overview-card">
                    <span>CSS RULES</span>
                    <strong>
                      {Object.keys(details.computedStyles).length}
                    </strong>
                  </div>
                </div>

                <div className="subsection-heading">
                  <h4>Parent element</h4>
                </div>

                {details.parent ? (
                  <div className="parent-card">
                    <div className="parent-tag">
                      <Code2 size={15} />
                      <strong>{details.parent.tagName}</strong>

                      {details.parent.id && (
                        <span>#{details.parent.id}</span>
                      )}
                    </div>

                    <div className="parent-details">
                      <span>Display</span>
                      <strong>{details.parent.display}</strong>
                    </div>

                    <div className="parent-details">
                      <span>Dimensions</span>
                      <strong>
                        {details.parent.width} × {details.parent.height}px
                      </strong>
                    </div>

                    {details.parent.className && (
                      <div className="parent-classes">
                        {details.parent.className}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="muted-message">
                    No parent element information is available.
                  </p>
                )}

                <div className="subsection-heading">
                  <h4>Quick diagnostics</h4>
                  <button
                    className="inline-link"
                    onClick={() => setActiveTab("layout")}
                  >
                    View all <ChevronRight size={13} />
                  </button>
                </div>

                <div className="quick-diagnostic-list">
                  {diagnostics.slice(0, 3).map((diagnostic) => (
                    <button
                      key={diagnostic.id}
                      className={`quick-diagnostic severity-${diagnostic.severity}`}
                      onClick={() => setActiveTab("layout")}
                    >
                      <span className="quick-diagnostic-indicator" />

                      <span>{diagnostic.title}</span>

                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>

                <div className="page-source">
                  <span>INSPECTED PAGE</span>

                  <div className="page-url">
                    <span>{details.page}</span>

                    <button
                      className="small-icon-button"
                      title="Copy page URL"
                      onClick={() => void copyText(details.page)}
                    >
                      <Clipboard size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "styles" && (
              <div className="styles-content">
                <div className="section-heading compact-heading">
                  <div>
                    <h3>Computed CSS</h3>
                    <p>Resolved styles for the selected element</p>
                  </div>
                </div>

                {STYLE_GROUPS.map((group) => {
                  const Icon = group.icon;

                  return (
                    <section
                      className="style-group"
                      key={group.title}
                    >
                      <div className="style-group-heading">
                        <Icon size={15} />
                        <h4>{group.title}</h4>
                      </div>

                      <div className="style-property-list">
                        {group.properties.map((property) => {
                          const value =
                            details.computedStyles[property] || "—";

                          return (
                            <div
                              className="style-property"
                              key={property}
                            >
                              <code>{property}</code>

                              <span title={value}>{value}</span>

                              <button
                                className="property-copy"
                                title={`Copy ${property}`}
                                aria-label={`Copy ${property}`}
                                onClick={() =>
                                  void copyText(`${property}: ${value};`)
                                }
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

                <button
                  className="secondary-button full-width-button"
                  onClick={() => {
                    const css = Object.entries(details.computedStyles)
                      .map(([property, value]) => `${property}: ${value};`)
                      .join("\n");

                    void copyText(css);
                  }}
                >
                  <Clipboard size={15} />
                  Copy displayed computed styles
                </button>
              </div>
            )}

            {activeTab === "layout" && (
              <div className="layout-content">
                <div className="section-heading compact-heading">
                  <div>
                    <h3>Layout diagnostics</h3>
                    <p>Potential problems based on element measurements</p>
                  </div>
                </div>

                <div className="diagnostic-summary">
                  <div className="diagnostic-summary-item error-summary">
                    <strong>{errorCount}</strong>
                    <span>Errors</span>
                  </div>

                  <div className="diagnostic-summary-item warning-summary">
                    <strong>{warningCount}</strong>
                    <span>Warnings</span>
                  </div>

                  <div className="diagnostic-summary-item info-summary">
                    <strong>{infoCount}</strong>
                    <span>Info</span>
                  </div>
                </div>

                <section className="diagnostics-section">
                  <div className="diagnostics-heading">
                    <div>
                      <h3>CSS Diagnostics</h3>
                      <p>
                        Potential layout problems detected from computed
                        styles.
                      </p>
                    </div>

                    <span className="diagnostic-count">
                      {diagnostics.length}
                    </span>
                  </div>

                  <div className="diagnostics-list">
                    {diagnostics.map((diagnostic) => (
                      <DiagnosticCard
                        key={diagnostic.id}
                        diagnostic={diagnostic}
                      />
                    ))}
                  </div>
                </section>

                <section className="box-model-section">
                  <div className="subsection-heading">
                    <h4>Box model</h4>
                  </div>

                  <div className="box-model">
                    <div className="box-model-margin">
                      <span className="box-model-label">MARGIN</span>

                      <div className="box-model-padding">
                        <span className="box-model-label">BORDER</span>

                        <div className="box-model-border">
                          <span className="box-model-label">PADDING</span>

                          <div className="box-model-content">
                            <strong>
                              {Math.round(details.dimensions.width)} ×{" "}
                              {Math.round(details.dimensions.height)}
                            </strong>
                            <span>CONTENT BOX</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="box-model-values">
                    {[
                      ["Margin", "margin-top", "margin-right", "margin-bottom", "margin-left"],
                      ["Padding", "padding-top", "padding-right", "padding-bottom", "padding-left"],
                    ].map(([label, top, right, bottom, left]) => (
                      <div className="box-model-value-row" key={label}>
                        <strong>{label}</strong>

                        <span>
                          T: {details.computedStyles[top] || "0px"}
                        </span>

                        <span>
                          R: {details.computedStyles[right] || "0px"}
                        </span>

                        <span>
                          B: {details.computedStyles[bottom] || "0px"}
                        </span>

                        <span>
                          L: {details.computedStyles[left] || "0px"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="layout-measurements">
                  <div>
                    <span>Horizontal scroll</span>
                    <strong>
                      {details.scroll.hasHorizontalOverflow
                        ? "Detected"
                        : "Not detected"}
                    </strong>
                  </div>

                  <div>
                    <span>Vertical scroll</span>
                    <strong>
                      {details.scroll.hasVerticalOverflow
                        ? "Detected"
                        : "Not detected"}
                    </strong>
                  </div>

                  <div>
                    <span>Scroll width</span>
                    <strong>{details.scroll.scrollWidth}px</strong>
                  </div>

                  <div>
                    <span>Client width</span>
                    <strong>{details.scroll.clientWidth}px</strong>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <footer className="app-footer">
        <div className="footer-brand">
          <ScanSearch size={14} />
          <span>CSS Detective</span>
        </div>

        <span>Built for developers</span>
      </footer>
    </main>
  );
}

export default App;
