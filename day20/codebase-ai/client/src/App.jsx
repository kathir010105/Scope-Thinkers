import { useEffect, useState } from "react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import AuthScreen from "./AuthScreen.jsx";
import {
  saveSearchHistory,
  loadSearchHistory,
  clearSearchHistory,
} from "./searchHistory.js";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Command,
  ExternalLink,
  FileCode2,
  FileText,
  GraduationCap,
  History,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserCircle,
  Users,
  X,
  Zap,
  Bug,
  Wrench,
} from "lucide-react";

import DocumentManager from "./DocumentManager.jsx";
import LearningMode from "./LearningMode.jsx";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const PALETTE = {
  midnight: "#1B1931",

  purple: "#44174E",

  burgundy: "#6B2249",

  rose: "#A34054",

  amber: "#ED9659",

  blush: "#EBCBC9",
};

const SUGGESTIONS = [
  {
    icon: <Code2 size={17} />,

    title: "Express middleware",

    description: "How does middleware work in Express?",

    query:
      "Explain how middleware works in Express.js, including middleware order and error-handling middleware.",
  },

  {
    icon: <ShieldCheck size={17} />,

    title: "Error handling",

    description: "How should I handle errors?",

    query:
      "Explain the recommended ways to handle errors in an Express.js application.",
  },

  {
    icon: <FileCode2 size={17} />,

    title: "Routing",

    description: "How do I structure routes?",

    query:
      "Explain Express.js routing, route parameters, query parameters, and router-level middleware.",
  },
];

function cleanQuestion(value) {
  return value.trim().replace(/\s+/g, " ");
}

function getSourceTitle(source, index) {
  return source.title || source.name || source.url || `Source ${index + 1}`;
}

function getSourceUrl(source) {
  return source.url || source.sourceUrl || "";
}

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [searchCount, setSearchCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMode, setActiveMode] = useState("search");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState([]);
  const [selectedUserDocs, setSelectedUserDocs] = useState([]);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [debugTechnologies, setDebugTechnologies] = useState([]);
  const [technologiesLoading, setTechnologiesLoading] = useState(false);
  const [technologiesError, setTechnologiesError] = useState("");
  const [debugTechnology, setDebugTechnology] = useState("Express.js");
  const [debugErrorMessage, setDebugErrorMessage] = useState("");
  const [debugCode, setDebugCode] = useState("");
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState("");
  const [debugResult, setDebugResult] = useState(null);
const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // Check if user is admin (by email)
      const adminEmail = "admin@gmail.com";
      setIsAdmin(user?.email === adminEmail);

      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnapshot = await getDoc(userRef);

          if (!userSnapshot.exists()) {
            await setDoc(
              userRef,
              {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "",
                role: user.email === adminEmail ? "admin" : "user",
                createdAt: serverTimestamp(),
              },
              { merge: true },
            );
          }
        } catch (error) {
          console.error("Could not initialize user profile:", error);
        }
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load search history from Firestore when the user signs in.
  useEffect(() => {
    if (!currentUser?.uid) {
      console.log("[History] No user, clearing history");
      setHistory([]);
      return;
    }

    console.log("[History] Loading history for user:", currentUser.uid);

    let cancelled = false;

    async function fetchHistory() {
      try {
        const savedHistory = await loadSearchHistory(currentUser.uid);
        console.log("[History] Loaded:", savedHistory.length, "entries");

        if (!cancelled) {
          setHistory(savedHistory);
        }
      } catch (error) {
        console.error("[History] Failed to load search history:", error);
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowDocumentManager(false);

        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (activeMode === "debug") {
      loadDebugTechnologies();
    }
  }, [activeMode]);

  const isDark = darkMode;

  const theme = {
    page: isDark ? PALETTE.midnight : "#FFF8F5",

    sidebar: isDark ? "#171528" : "#FFFDFC",

    surface: isDark ? "#242039" : "#FFFFFF",

    surfaceAlt: isDark ? "#29233D" : "#FFF1EB",

    text: isDark ? "#FFF8F5" : PALETTE.midnight,

    muted: isDark ? "#B8B0C7" : "#756B79",

    border: isDark ? "rgba(255,248,245,0.10)" : "rgba(68,23,78,0.12)",

    subtleBorder: isDark ? "rgba(255,248,245,0.07)" : "rgba(68,23,78,0.08)",

    input: isDark ? "#211D35" : "#FFFFFF",
  };

  async function askQuestion(question = query) {
    const cleaned = cleanQuestion(question);

    if (!cleaned || loading) return;

    setQuery(cleaned);

    setSearchedQuery(cleaned);

    setAnswer("");

    setSources([]);

    setError("");

    setLoading(true);

    setSidebarOpen(false);

    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ query: cleaned }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            `Search failed with status ${response.status}.`,
        );
      }

      const generatedAnswer =
        data.answer ||
        data.response ||
        data.result ||
        "No answer was returned. Try rephrasing your question.";

      const resultSources = Array.isArray(data.sources) ? data.sources : [];

      setAnswer(generatedAnswer);

      setSources(resultSources);

      setSearchCount((count) => count + 1);

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        query: cleaned,
        answer: generatedAnswer,
        sources: resultSources,
        createdAt: new Date().toISOString(),
      };

      // Update the UI immediately.
      setHistory((previous) => [
        entry,
        ...previous.filter(
          (item) =>
            cleanQuestion(item.query).toLowerCase() !== cleaned.toLowerCase(),
        ),
      ].slice(0, 30));

      // Save the search to the signed-in user's Firestore history.
      if (currentUser?.uid) {
        console.log("[History] Saving entry for user:", currentUser.uid);
        saveSearchHistory(currentUser.uid, entry)
          .then(() => console.log("[History] Save successful"))
          .catch((error) => {
            console.error("[History] Failed to save search history:", error);
          });
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to CodeBase AI. Check whether the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function runDebugger(event) {
    event.preventDefault();

    const cleanedError = debugErrorMessage.trim();

    if (!cleanedError || debugLoading) return;

    setDebugLoading(true);

    setDebugError("");

    setDebugResult(null);

    setSidebarOpen(false);

    try {
      const response = await fetch(`${API_URL}/api/debug`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          technology: debugTechnology,

          errorMessage: cleanedError,

          code: debugCode.trim(),
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || `Debugging failed with status ${response.status}.`,
        );
      }

      setDebugResult(data);
    } catch (err) {
      setDebugError(
        err.message ||
          "Unable to connect to the debugger. Check whether the backend is running.",
      );
    } finally {
      setDebugLoading(false);
    }
  }


  async function loadDebugTechnologies() {
    setTechnologiesLoading(true);
    setTechnologiesError("");

    try {
      const response = await fetch(`${API_URL}/api/debug/technologies`);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to load documentation categories.",
        );
      }

      const categories = Array.isArray(data.technologies)
        ? data.technologies
        : [];

      setDebugTechnologies(categories);

      // Preserve the current selection if it still exists.
      setDebugTechnology((current) =>
        categories.includes(current) ? current : categories[0] || "",
      );
    } catch (err) {
      setTechnologiesError(
        err.message || "Unable to load documentation categories.",
      );
    } finally {
      setTechnologiesLoading(false);
    }
  }
  function restoreSearch(item) {
    if (loading) return;

    setQuery(item.query || "");

    setSearchedQuery(item.query || "");

    setAnswer(item.answer || "");

    setSources(Array.isArray(item.sources) ? item.sources : []);

    setError("");

    setSidebarOpen(false);
  }

  function startNewSearch() {
    if (loading) return;

    setQuery("");

    setAnswer("");

    setSources([]);

    setSearchedQuery("");

    setError("");

    setSidebarOpen(false);
  }

  async function clearHistory() {
    console.log("[History] Clearing history for user:", currentUser?.uid);
    setHistory([]);

    if (currentUser?.uid) {
      await clearSearchHistory(currentUser.uid)
        .then(() => console.log("[History] Clear successful"))
        .catch((error) => {
          console.error("[History] Failed to clear search history:", error);
        });
    }
  }

  function removeHistoryItem(id) {
    setHistory((previous) => previous.filter((item) => item.id !== id));
  }

  // Admin functions
  async function loadAdminUsers() {
    setAdminLoading(true);
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdminUsers(users);
    } catch (error) {
      console.error("Failed to load admin users:", error);
    } finally {
      setAdminLoading(false);
    }
  }

  async function loadSelectedUserData(userId) {
    try {
      // Load search history
      const history = await loadSearchHistory(userId);
      setSelectedUserHistory(history);

      // Load documents from Weaviate via backend API (admin only)
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/documents/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedUserDocs(data.documents || []);
      } else {
        console.error("Failed to load user documents:", data.message);
        setSelectedUserDocs([]);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      setSelectedUserDocs([]);
    }
  }

  async function handleSelectAdminUser(user) {
    setSelectedAdminUser(user);
    setShowAdminPanel(true);
    await loadSelectedUserData(user.id);
  }

  async function deleteUser(userId) {
    if (deleteConfirmText !== "delete user") return;

    try {
      // Delete user's search history
      const historyRef = collection(db, "users", userId, "searchHistory");
      const historySnapshot = await getDocs(historyRef);
      await Promise.all(historySnapshot.docs.map((doc) => deleteDoc(doc.ref)));

      // Delete user's documents
      const docsRef = collection(db, "users", userId, "documents");
      const docsSnapshot = await getDocs(docsRef);
      await Promise.all(docsSnapshot.docs.map((doc) => deleteDoc(doc.ref)));

      // Delete user profile
      await deleteDoc(doc(db, "users", userId));

      // Refresh users list
      await loadAdminUsers();
      setSelectedAdminUser(null);
      setShowAdminPanel(false);
      setDeleteConfirmText("");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Check console for details.");
    }
  }

  function closeAdminPanel() {
    setShowAdminPanel(false);
    setSelectedAdminUser(null);
    setSelectedUserHistory([]);
    setSelectedUserDocs([]);
    setDeleteConfirmText("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    askQuestion();
  }

  const hasAnswer = Boolean(answer);

  useEffect(() => {
    if (activeMode === "debug") {
      loadDebugTechnologies();
    }
  }, [activeMode]);

  // Keep these checks AFTER all hooks in App().
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1B1931] text-[#FFF8F5]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#ED9659] border-t-transparent" />
          <p className="text-sm text-[#B8B0C7]">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div
      className="flex min-h-screen overflow-hidden transition-colors duration-200"
      style={{
        background: theme.page,

        color: theme.text,
      }}
    >
      {/* Mobile sidebar backdrop */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: theme.sidebar,

          borderColor: theme.border,
        }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-5"
          style={{ borderColor: theme.border }}
        >
          <button
            type="button"
            onClick={startNewSearch}
            className="flex items-center gap-3 text-left"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.rose})`,

                color: "#FFFFFF",
              }}
            >
              <Code2 size={21} />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight">
                CodeBase AI
              </p>

              <p className="mt-0.5 text-[11px]" style={{ color: theme.muted }}>
                Documentation assistant
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={startNewSearch}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90"
            style={{
              background: `linear-gradient(110deg, ${PALETTE.purple}, ${PALETTE.burgundy})`,

              color: "#FFFFFF",
            }}
          >
            <Plus size={17} />
            New search
            <span className="ml-auto opacity-70">
              <Command size={14} />
            </span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3">
          <div className="flex items-center justify-between px-3 py-2">
            <div
              className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: theme.muted }}
            >
              <History size={14} />
              Recent searches
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="rounded-md p-1.5 transition hover:opacity-70"
                title="Clear search history"
                aria-label="Clear search history"
                style={{ color: theme.muted }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <div className="mt-1 flex-1 space-y-1 overflow-y-auto pb-4">
            {history.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <History
                  size={22}
                  className="mx-auto mb-3"
                  style={{ color: theme.muted }}
                />

                <p className="text-xs" style={{ color: theme.muted }}>
                  Your searches will appear here.
                </p>
              </div>
            ) : (
              history.map((item) => {
                const active = searchedQuery === item.query && hasAnswer;

                return (
                  <div
                    key={item.id}
                    className="group flex items-start gap-1 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: active
                        ? isDark
                          ? "rgba(163,64,84,0.13)"
                          : "rgba(163,64,84,0.07)"
                        : "transparent",

                      borderColor: active
                        ? "rgba(163,64,84,0.22)"
                        : "transparent",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => restoreSearch(item)}
                      className="min-w-0 flex-1 px-3 py-3 text-left"
                    >
                      <p
                        className="line-clamp-2 text-[12px] leading-5"
                        style={{
                          color: active ? theme.text : theme.muted,
                        }}
                      >
                        {item.query}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeHistoryItem(item.id)}
                      aria-label="Remove search from history"
                      title="Remove from history"
                      className="mr-1 mt-2 rounded-md p-1.5 opacity-0 transition hover:opacity-100 group-hover:opacity-100 focus:opacity-100"
                      style={{ color: theme.muted }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t p-4" style={{ borderColor: theme.border }}>
          <div
            className="rounded-xl border p-3"
            style={{
              background: theme.surface,

              borderColor: theme.border,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(237,150,89,0.14)",

                  color: PALETTE.amber,
                }}
              >
                <Zap size={16} />
              </div>

              <div>
                <p className="text-xs font-semibold">Knowledge search</p>

                <p
                  className="mt-0.5 text-[10px]"
                  style={{ color: theme.muted }}
                >
                  Powered by your documentation
                </p>
              </div>
            </div>
          </div>

          <p
            className="mt-4 text-center text-[10px]"
            style={{ color: theme.muted }}
          >
            CodeBase AI · Built for developers
          </p>
        </div>
      </aside>

      {/* Main application */}

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}

        <header
          className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b px-4 sm:px-6 lg:px-9"
          style={{
            background: isDark
              ? "rgba(27,25,49,0.92)"
              : "rgba(255,248,245,0.92)",

            borderColor: theme.border,

            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={19} />
            </button>

            <div>
              <p className="text-sm font-semibold">Documentation Search</p>

              <div
                className="mt-1 flex items-center gap-1.5 text-[11px]"
                style={{ color: theme.muted }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "#65C99A" }}
                />
                AI-powered knowledge assistant
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDocumentManager(true)}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition hover:border-[#ED9659]/70"
              style={{
                borderColor: theme.border,

                background: theme.surface,
              }}
            >
              <FileText size={15} style={{ color: PALETTE.rose }} />

              <span className="hidden sm:inline">Documents</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((previous) => !previous)}
              className="rounded-xl border p-2.5 transition hover:opacity-80"
              style={{
                borderColor: theme.border,

                background: theme.surface,
              }}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? (
                <Sun size={16} style={{ color: PALETTE.amber }} />
              ) : (
                <Moon size={16} style={{ color: PALETTE.purple }} />
              )}
            </button>

            {/* Profile avatar dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border p-1.5 transition hover:opacity-80"
                style={{
                  borderColor: theme.border,
                  background: theme.surface,
                }}
                aria-label="User profile"
                aria-expanded={profileOpen}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.rose})`,
                    color: "#FFFFFF",
                  }}
                >
                  {currentUser?.displayName?.charAt(0)?.toUpperCase() ||
                  currentUser?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
                </div>
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border shadow-lg animate-in fade-in-0 zoom-in-95"
                    style={{
                      borderColor: theme.border,
                      background: theme.surface,
                    }}
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: theme.border }}>
                      <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>
                        {currentUser?.displayName || "User"}
                      </p>
                      <p className="mt-0.5 text-xs truncate" style={{ color: theme.muted }}>
                        {currentUser?.email}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          loadAdminUsers();
                          setShowAdminPanel(true);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        style={{ color: PALETTE.amber }}
                        role="menuitem"
                      >
                        <ShieldCheck size={16} />
                        Admin Panel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileOpen(false);
                        try {
                          await signOut(auth);
                        } catch (error) {
                          console.error("Sign out failed:", error);
                        }
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      style={{ color: PALETTE.rose }}
                      role="menuitem"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable content */}

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-7 sm:pt-12 lg:px-10">
            {/* Mode switch */}

            <div
              className="mb-8 flex flex-wrap gap-2 rounded-2xl border p-2"
              style={{
                background: theme.surface,

                borderColor: theme.border,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveMode("search")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition"
                style={{
                  background:
                    activeMode === "search"
                      ? `linear-gradient(110deg, ${PALETTE.purple}, ${PALETTE.rose})`
                      : "transparent",

                  color: activeMode === "search" ? "#FFFFFF" : theme.muted,
                }}
              >
                <Search size={16} />
                Documentation Search
              </button>

              <button
                type="button"
                onClick={() => setActiveMode("debug")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition"
                style={{
                  background:
                    activeMode === "debug"
                      ? `linear-gradient(110deg, ${PALETTE.purple}, ${PALETTE.rose})`
                      : "transparent",

                  color: activeMode === "debug" ? "#FFFFFF" : theme.muted,
                }}
              >
                <Bug size={16} />
                Error Debugger
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode("learn");
                  setSidebarOpen(false);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition"
                style={{
                  background:
                    activeMode === "learn"
                      ? `linear-gradient(110deg, ${PALETTE.purple}, ${PALETTE.rose})`
                      : "transparent",
                  color: activeMode === "learn" ? "#FFFFFF" : theme.muted,
                }}
              >
                <GraduationCap size={16} />
                Learning Mode
              </button>
            </div>

            {/* Hero */}

            {activeMode === "search" && (
              <section className="mb-9">
                <div
                  className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium"
                  style={{
                    background: isDark
                      ? "rgba(163,64,84,0.12)"
                      : "rgba(163,64,84,0.07)",

                    borderColor: "rgba(163,64,84,0.23)",

                    color: isDark ? PALETTE.blush : PALETTE.burgundy,
                  }}
                >
                  <Sparkles size={13} />
                  Retrieval-augmented generation
                </div>

                <h1
                  className="max-w-3xl text-3xl font-bold leading-[1.16] tracking-[-0.04em] sm:text-4xl lg:text-[48px]"
                  style={{ color: theme.text }}
                >
                  Understand your
                  <span
                    className="block"
                    style={{
                      background: `linear-gradient(100deg, ${PALETTE.rose}, ${PALETTE.amber})`,

                      WebkitBackgroundClip: "text",

                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    codebase, faster.
                  </span>
                </h1>

                <p
                  className="mt-4 max-w-2xl text-sm leading-7 sm:text-[15px]"
                  style={{ color: theme.muted }}
                >
                  Ask technical questions and get contextual answers grounded in
                  your indexed documentation. Find the explanation you need
                  without digging through pages of docs.
                </p>
              </section>
            )}
            {/* Learning Mode */}
            {activeMode === "learn" && (
              <LearningMode API_URL={API_URL} theme={theme} isDark={isDark} />
            )}

            {/* Search box */}

            {activeMode === "search" && (
              <form
                onSubmit={handleSubmit}
                className="relative rounded-2xl border p-3 transition focus-within:border-[#A34054]/60 sm:p-4"
                style={{
                  background: theme.surface,

                  borderColor: theme.border,

                  boxShadow: isDark
                    ? "0 16px 50px rgba(0,0,0,0.12)"
                    : "0 16px 50px rgba(68,23,78,0.06)",
                }}
              >
                <label htmlFor="question" className="sr-only">
                  Ask a question about your documentation
                </label>

                <textarea
                  id="question"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();

                      askQuestion();
                    }
                  }}
                  placeholder="Ask anything about your codebase..."
                  rows={3}
                  disabled={loading}
                  className="max-h-52 min-h-[84px] w-full resize-y bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:opacity-50 disabled:opacity-60"
                  style={{ color: theme.text }}
                />

                <div
                  className="flex items-center justify-between gap-3 border-t pt-3"
                  style={{ borderColor: theme.subtleBorder }}
                >
                  <div
                    className="flex min-w-0 items-center gap-2 text-[10px] sm:text-[11px]"
                    style={{ color: theme.muted }}
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} />
                      Documentation context
                    </span>

                    <span className="opacity-40">·</span>

                    <span className="hidden sm:inline">Enter to search</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      background: `linear-gradient(110deg, ${PALETTE.rose}, ${PALETTE.burgundy})`,

                      color: "#FFFFFF",
                    }}
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={15} className="animate-spin" />
                        Searching
                      </>
                    ) : (
                      <>
                        <span>Ask AI</span>

                        <Send size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Documentation-specific error debugger */}
            {activeMode === "debug" && (
              <section className="mt-2">
                <div className="mb-7">
                  <div
                    className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium"
                    style={{
                      background: isDark
                        ? "rgba(237,150,89,0.10)"
                        : "rgba(237,150,89,0.12)",
                      borderColor: "rgba(237,150,89,0.25)",
                      color: isDark ? PALETTE.amber : PALETTE.burgundy,
                    }}
                  >
                    <Bug size={14} />
                    Documentation-grounded debugging
                  </div>
                  <h1
                    className="text-3xl font-bold tracking-tight sm:text-4xl"
                    style={{ color: theme.text }}
                  >
                    Debug with your documentation.
                  </h1>
                  <p
                    className="mt-3 max-w-2xl text-sm leading-7"
                    style={{ color: theme.muted }}
                  >
                    Describe the error and select its technology. CodeBase AI
                    searches your indexed documentation first and only provides
                    a fix when it finds relevant support.
                  </p>
                </div>

                <form
                  onSubmit={runDebugger}
                  className="rounded-2xl border p-4 sm:p-6"
                  style={{
                    background: theme.surface,
                    borderColor: theme.border,
                    boxShadow: isDark
                      ? "0 16px 50px rgba(0,0,0,0.12)"
                      : "0 16px 50px rgba(68,23,78,0.06)",
                  }}
                >
                  <div className="grid gap-5">
                    <div>
                      <label
                        htmlFor="debug-technology"
                        className="mb-2 block text-xs font-semibold"
                      >
                        Technology
                      </label>
                      <select
                        id="debug-technology"
                        value={debugTechnology}
                        onChange={(event) =>
                          setDebugTechnology(event.target.value)
                        }
                        disabled={
                          technologiesLoading || debugTechnologies.length === 0
                        }
                        className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[#A34054]/60 disabled:opacity-60"
                        style={{
                          background: theme.input,
                          color: theme.text,
                          borderColor: theme.border,
                        }}
                      >
                        {technologiesLoading ? (
                          <option value="">Loading categories...</option>
                        ) : debugTechnologies.length > 0 ? (
                          debugTechnologies.map((technology) => (
                            <option key={technology} value={technology}>
                              {technology
                                .split(/[-_]/g)
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                .join(" ")}
                            </option>
                          ))
                        ) : (
                          <option value="">No categories available</option>
                        )}
                      </select>

                      {technologiesError && (
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p
                            className="text-xs"
                            style={{ color: PALETTE.rose }}
                          >
                            {technologiesError}
                          </p>

                          <button
                            type="button"
                            onClick={loadDebugTechnologies}
                            className="text-xs font-semibold underline"
                            style={{ color: PALETTE.rose }}
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {!technologiesLoading &&
                        !technologiesError &&
                        debugTechnologies.length === 0 && (
                          <p
                            className="mt-2 text-xs"
                            style={{ color: theme.muted }}
                          >
                            Add and index documentation to populate this list.
                          </p>
                        )}
                    </div>

                    <div>
                      <label
                        htmlFor="debug-error-message"
                        className="mb-2 block text-xs font-semibold"
                      >
                        Error message{" "}
                        <span style={{ color: PALETTE.rose }}>*</span>
                      </label>
                      <textarea
                        id="debug-error-message"
                        value={debugErrorMessage}
                        onChange={(event) =>
                          setDebugErrorMessage(event.target.value)
                        }
                        placeholder={
                          "Paste the complete error message or stack trace here..."
                        }
                        rows={4}
                        maxLength={12000}
                        required
                        disabled={debugLoading}
                        className="w-full resize-y rounded-xl border px-3 py-3 text-sm leading-6 outline-none placeholder:opacity-50 focus:border-[#A34054]/60 disabled:opacity-60"
                        style={{
                          background: theme.input,
                          color: theme.text,
                          borderColor: theme.border,
                        }}
                      />
                      <p
                        className="mt-1 text-right text-[10px]"
                        style={{ color: theme.muted }}
                      >
                        {debugErrorMessage.length.toLocaleString()} / 12,000
                        characters
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="debug-code"
                        className="mb-2 block text-xs font-semibold"
                      >
                        Relevant code{" "}
                        <span
                          className="font-normal"
                          style={{ color: theme.muted }}
                        >
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="debug-code"
                        value={debugCode}
                        onChange={(event) => setDebugCode(event.target.value)}
                        placeholder={
                          "Paste the related function, route, component, or configuration..."
                        }
                        rows={6}
                        maxLength={20000}
                        disabled={debugLoading}
                        spellCheck={false}
                        className="w-full resize-y rounded-xl border px-3 py-3 font-mono text-xs leading-6 outline-none placeholder:font-sans placeholder:opacity-50 focus:border-[#A34054]/60 disabled:opacity-60"
                        style={{
                          background: theme.input,
                          color: theme.text,
                          borderColor: theme.border,
                        }}
                      />
                      <p
                        className="mt-1 text-right text-[10px]"
                        style={{ color: theme.muted }}
                      >
                        {debugCode.length.toLocaleString()} / 20,000 characters
                      </p>
                    </div>

                    {debugError && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-xl border p-3 text-sm"
                        style={{
                          background: "rgba(163,64,84,0.08)",
                          borderColor: "rgba(163,64,84,0.25)",
                        }}
                      >
                        <X
                          size={16}
                          className="mt-0.5 shrink-0"
                          style={{ color: PALETTE.rose }}
                        />
                        <span className="break-words">{debugError}</span>
                      </div>
                    )}

                    <div
                      className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
                      style={{ borderColor: theme.subtleBorder }}
                    >
                      <p
                        className="max-w-md text-[11px] leading-5"
                        style={{ color: theme.muted }}
                      >
                        The debugger uses indexed documentation as evidence. It
                        may decline to diagnose errors that are unrelated to or
                        unsupported by your documents.
                      </p>
                      <button
                        type="submit"
                        disabled={debugLoading || !debugErrorMessage.trim()}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                          background: `linear-gradient(110deg, ${PALETTE.rose}, ${PALETTE.burgundy})`,
                          color: "#FFFFFF",
                        }}
                      >
                        {debugLoading ? (
                          <>
                            <LoaderCircle size={16} className="animate-spin" />
                            Checking documentation...
                          </>
                        ) : (
                          <>
                            <Wrench size={16} />
                            Diagnose error
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {debugLoading && (
                  <div
                    className="mt-5 flex items-center gap-3 rounded-xl border p-4"
                    style={{
                      background: theme.surface,
                      borderColor: theme.border,
                    }}
                  >
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                      style={{ color: PALETTE.rose }}
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        Searching indexed documentation
                      </p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: theme.muted }}
                      >
                        Retrieving relevant passages and checking whether they
                        support a diagnosis...
                      </p>
                    </div>
                  </div>
                )}

                {!debugLoading && debugResult && (
                  <section className="mt-6">
                    {debugResult.supported ? (
                      <div
                        className="overflow-hidden rounded-2xl border"
                        style={{
                          background: theme.surface,
                          borderColor: theme.border,
                        }}
                      >
                        <div
                          className="flex items-center gap-3 border-b px-5 py-4"
                          style={{ borderColor: theme.border }}
                        >
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                            style={{
                              background: "rgba(101,201,154,0.13)",
                              color: "#65C99A",
                            }}
                          >
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <h2 className="text-sm font-semibold">
                              Documentation-supported diagnosis
                            </h2>
                            <p
                              className="mt-1 text-[11px]"
                              style={{ color: theme.muted }}
                            >
                              {debugResult.technology || debugTechnology} ·{" "}
                              {debugResult.sources?.length || 0} source(s)
                            </p>
                          </div>
                        </div>
                        <article
                          className="markdown-content px-5 py-6 sm:px-7"
                          style={{ color: theme.text }}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="answer-h1">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="answer-h2">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="answer-h3">{children}</h3>
                              ),
                              p: ({ children }) => (
                                <p className="answer-paragraph">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="answer-list answer-ul">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="answer-list answer-ol">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="answer-list-item">{children}</li>
                              ),
                              pre: ({ children }) => (
                                <pre className="answer-code-block">
                                  {children}
                                </pre>
                              ),
                              a: ({ children, href, ...props }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {debugResult.diagnosis ||
                              "No diagnosis text was returned."}
                          </ReactMarkdown>
                        </article>
                      </div>
                    ) : (
                      <div
                        className="rounded-2xl border p-5 sm:p-6"
                        style={{
                          background: theme.surface,
                          borderColor: theme.border,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <ShieldCheck
                            size={21}
                            className="mt-0.5 shrink-0"
                            style={{ color: PALETTE.amber }}
                          />
                          <div>
                            <h2 className="text-sm font-semibold">
                              No documentation-supported fix found
                            </h2>
                            <p
                              className="mt-2 text-sm leading-6"
                              style={{ color: theme.muted }}
                            >
                              {debugResult.message ||
                                "The indexed documentation did not provide enough relevant evidence to diagnose this error."}
                            </p>
                            <p
                              className="mt-3 text-xs leading-5"
                              style={{ color: theme.muted }}
                            >
                              Add relevant documentation using the Documents
                              button, or try again with a more complete error
                              message and the related code.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {Array.isArray(debugResult.sources) &&
                      debugResult.sources.length > 0 && (
                        <div className="mt-5">
                          <div className="mb-3 flex items-center gap-2">
                            <BookOpen
                              size={15}
                              style={{ color: PALETTE.amber }}
                            />
                            <h3 className="text-sm font-semibold">
                              Documentation sources
                            </h3>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {debugResult.sources.map((source, index) => {
                              const sourceUrl = getSourceUrl(source);
                              const sourceTitle = getSourceTitle(source, index);
                              return (
                                <div
                                  key={`${sourceUrl || sourceTitle}-${index}`}
                                  className="rounded-xl border p-4"
                                  style={{
                                    background: theme.surface,
                                    borderColor: theme.border,
                                  }}
                                >
                                  {sourceUrl &&
                                  /^https?:\/\//i.test(sourceUrl) ? (
                                    <a
                                      href={sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-start justify-between gap-3 text-xs font-semibold leading-5 hover:underline"
                                    >
                                      <span className="break-words">
                                        {sourceTitle}
                                      </span>
                                      <ExternalLink
                                        size={14}
                                        className="shrink-0"
                                        style={{ color: PALETTE.rose }}
                                      />
                                    </a>
                                  ) : (
                                    <p className="text-xs font-semibold">
                                      {sourceTitle}
                                    </p>
                                  )}
                                  {source.category && (
                                    <p
                                      className="mt-1 text-[10px]"
                                      style={{ color: theme.muted }}
                                    >
                                      {source.category}
                                    </p>
                                  )}
                                  {source.content && (
                                    <p
                                      className="mt-2 line-clamp-3 text-[11px] leading-5"
                                      style={{ color: theme.muted }}
                                    >
                                      {source.content}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </section>
                )}
              </section>
            )}

            {/* Error message */}

            {activeMode === "search" && error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border p-4"
                style={{
                  background: "rgba(163,64,84,0.08)",

                  borderColor: "rgba(163,64,84,0.28)",

                  color: theme.text,
                }}
              >
                <X
                  size={17}
                  className="mt-0.5 shrink-0"
                  style={{ color: PALETTE.rose }}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Search failed</p>

                  <p
                    className="mt-1 break-words text-xs leading-5"
                    style={{ color: theme.muted }}
                  >
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => askQuestion(searchedQuery || query)}
                    disabled={loading || !query.trim()}
                    className="mt-3 text-xs font-semibold underline underline-offset-4 disabled:opacity-50"
                    style={{ color: PALETTE.rose }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}

            {activeMode === "search" && loading && (
              <div
                className="mt-8 rounded-2xl border p-6 sm:p-8"
                style={{
                  background: theme.surface,

                  borderColor: theme.border,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(163,64,84,0.12)",

                      color: PALETTE.rose,
                    }}
                  >
                    <LoaderCircle size={21} className="animate-spin" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Looking through your documentation
                    </p>

                    <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                      Retrieving relevant context and generating an answer...
                    </p>
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {[100, 88, 94, 65].map((width, index) => (
                    <div
                      key={index}
                      className="h-2 animate-pulse rounded-full"
                      style={{
                        width: `${width}%`,

                        background: isDark ? "#39334D" : "#F0E6E8",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Initial welcome state */}

            {activeMode === "search" && !loading && !error && !hasAnswer && (
              <section className="mt-10">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={15} style={{ color: PALETTE.amber }} />

                  <h2 className="text-xs font-semibold">
                    Try asking something
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => askQuestion(suggestion.query)}
                      className="group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-[#A34054]/40"
                      style={{
                        background: theme.surface,

                        borderColor: theme.border,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{
                            background: "rgba(163,64,84,0.11)",

                            color: PALETTE.rose,
                          }}
                        >
                          {suggestion.icon}
                        </span>

                        <ArrowUpRight
                          size={15}
                          className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          style={{ color: theme.muted }}
                        />
                      </div>

                      <p className="mt-4 text-sm font-semibold">
                        {suggestion.title}
                      </p>

                      <p
                        className="mt-2 text-xs leading-5"
                        style={{ color: theme.muted }}
                      >
                        {suggestion.description}
                      </p>
                    </button>
                  ))}
                </div>

                <div
                  className="mt-8 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    background: isDark
                      ? "rgba(68,23,78,0.18)"
                      : "rgba(68,23,78,0.035)",

                    borderColor: theme.border,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: "rgba(237,150,89,0.14)",

                        color: PALETTE.amber,
                      }}
                    >
                      <FileText size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Search your own documents
                      </p>

                      <p
                        className="mt-1 max-w-lg text-xs leading-5"
                        style={{ color: theme.muted }}
                      >
                        Add documentation URLs or upload PDF, Markdown, and text
                        files to expand your searchable knowledge base.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDocumentManager(true)}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition hover:opacity-80"
                    style={{
                      borderColor: theme.border,

                      background: theme.surface,
                    }}
                  >
                    Manage documents
                    <ArrowRight size={14} />
                  </button>
                </div>
              </section>
            )}

            {/* Generated answer */}

            {activeMode === "search" && !loading && hasAnswer && (
              <section className="mt-9">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div
                      className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em]"
                      style={{ color: PALETTE.rose }}
                    >
                      <Sparkles size={14} />
                      Generated answer
                    </div>

                    <h2 className="max-w-3xl text-lg font-semibold leading-7 sm:text-xl">
                      {searchedQuery}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={startNewSearch}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition hover:opacity-75"
                    style={{
                      borderColor: theme.border,

                      background: theme.surface,
                    }}
                  >
                    <Plus size={14} />
                    New search
                  </button>
                </div>

                <div
                  className="overflow-hidden rounded-2xl border"
                  style={{
                    background: theme.surface,

                    borderColor: theme.border,
                  }}
                >
                  <div
                    className="flex items-center justify-between border-b px-5 py-4"
                    style={{ borderColor: theme.border }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                          background: "rgba(163,64,84,0.12)",

                          color: PALETTE.rose,
                        }}
                      >
                        <Sparkles size={16} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold">CodeBase AI</p>

                        <p
                          className="mt-0.5 text-[10px]"
                          style={{ color: theme.muted }}
                        >
                          Documentation-based response
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1.5 text-[10px]"
                      style={{ color: theme.muted }}
                    >
                      <CheckCircle2 size={13} style={{ color: "#65C99A" }} />
                      Answer ready
                    </div>
                  </div>

                  <article
                    className="markdown-content px-5 py-6 sm:px-7 sm:py-7"
                    style={{ color: theme.text }}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="answer-h1">{children}</h1>
                        ),

                        h2: ({ children }) => (
                          <h2 className="answer-h2">{children}</h2>
                        ),

                        h3: ({ children }) => (
                          <h3 className="answer-h3">{children}</h3>
                        ),

                        p: ({ children }) => (
                          <p className="answer-paragraph">{children}</p>
                        ),

                        ul: ({ children }) => (
                          <ul className="answer-list answer-ul">{children}</ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="answer-list answer-ol">{children}</ol>
                        ),

                        li: ({ children }) => (
                          <li className="answer-list-item">{children}</li>
                        ),

                        a: ({ children, href, ...props }) => (
                          <a
                            href={href}
                            target="\_blank"
                            rel="noopener noreferrer"
                            {...props}
                          >
                            {children}
                          </a>
                        ),

                        blockquote: ({ children }) => (
                          <blockquote className="answer-quote">
                            {children}
                          </blockquote>
                        ),

                        pre: ({ children }) => (
                          <pre className="answer-code-block">{children}</pre>
                        ),

                        code: ({ children, className, ...props }) => (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ),

                        table: ({ children }) => (
                          <div className="answer-table-wrap">
                            <table className="answer-table">{children}</table>
                          </div>
                        ),

                        th: ({ children }) => <th>{children}</th>,

                        td: ({ children }) => <td>{children}</td>,

                        hr: () => <hr className="answer-divider" />,
                      }}
                    >
                      {answer}
                    </ReactMarkdown>
                  </article>
                </div>

                {/* Sources */}

                {sources.length > 0 && (
                  <section className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen size={15} style={{ color: PALETTE.amber }} />

                        <h3 className="text-sm font-semibold">Sources used</h3>

                        <span
                          className="rounded-full px-2 py-0.5 text-[10px]"
                          style={{
                            background: theme.surfaceAlt,

                            color: theme.muted,
                          }}
                        >
                          {sources.length}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {sources.map((source, index) => {
                        const url = getSourceUrl(source);

                        const title = getSourceTitle(source, index);

                        return (
                          <div
                            key={`${url || title}-${index}`}
                            className="flex min-w-0 items-start gap-3 rounded-xl border p-4 transition hover:border-[#A34054]/40"
                            style={{
                              background: theme.surface,

                              borderColor: theme.border,
                            }}
                          >
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                              style={{
                                background: "rgba(68,23,78,0.12)",

                                color: isDark ? PALETTE.blush : PALETTE.purple,
                              }}
                            >
                              <FileCode2 size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              {url && /^https?:\/\//i.test(url) ? (
                                <a
                                  href={url}
                                  target="\_blank"
                                  rel="noopener noreferrer"
                                  className="line-clamp-2 break-words text-xs font-semibold leading-5 hover:underline"
                                >
                                  {title}
                                </a>
                              ) : (
                                <p className="line-clamp-2 break-words text-xs font-semibold leading-5">
                                  {title}
                                </p>
                              )}

                              {source.category && (
                                <p
                                  className="mt-1 text-[10px]"
                                  style={{ color: theme.muted }}
                                >
                                  {source.category}
                                </p>
                              )}

                              {source.content && (
                                <p
                                  className="mt-2 line-clamp-3 text-[11px] leading-5"
                                  style={{ color: theme.muted }}
                                >
                                  {source.content}
                                </p>
                              )}
                            </div>

                            {url && /^https?:\/\//i.test(url) && (
                              <a
                                href={url}
                                target="\_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${title}`}
                                className="shrink-0 rounded-md p-1.5 transition hover:opacity-70"
                                style={{ color: PALETTE.rose }}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                <div
                  className="mt-6 flex items-start gap-2 rounded-xl border p-4"
                  style={{
                    background: isDark
                      ? "rgba(237,150,89,0.06)"
                      : "rgba(237,150,89,0.08)",

                    borderColor: "rgba(237,150,89,0.20)",
                  }}
                >
                  <Check
                    size={15}
                    className="mt-0.5 shrink-0"
                    style={{ color: PALETTE.amber }}
                  />

                  <p
                    className="text-[11px] leading-5"
                    style={{ color: theme.muted }}
                  >
                    Verify important implementation details against the linked
                    documentation. Answers depend on the documents indexed in
                    your knowledge base.
                  </p>
                </div>
              </section>
            )}

            {/* Footer */}

            <footer
              className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
              style={{ borderColor: theme.border }}
            >
              <p className="text-[10px]" style={{ color: theme.muted }}>
                CodeBase AI · Ask questions. Find answers.
              </p>

              <div
                className="flex items-center gap-4 text-[10px]"
                style={{ color: theme.muted }}
              >
                <span className="flex items-center gap-1.5">
                  <Search size={12} />
                  {searchCount} searches this session
                </span>

                <button
                  type="button"
                  onClick={() => setShowDocumentManager(true)}
                  className="flex items-center gap-1 hover:opacity-70"
                >
                  Documents
                  <ChevronRight size={12} />
                </button>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {/* Document manager modal */}

      {showDocumentManager && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1931]/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDocumentManager(false);
            }
          }}
        >
          <div className="mx-auto my-3 max-w-4xl sm:my-8">
            <div
              className="rounded-3xl border p-4 shadow-2xl sm:p-8"
              style={{
                background: theme.page,

                color: theme.text,

                borderColor: theme.border,
              }}
            >
              <DocumentManager
                isDark={isDark}
                currentUser={currentUser}
                onClose={() => setShowDocumentManager(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1931]/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAdminPanel();
            }
          }}
        >
          <div className="mx-auto my-3 max-w-5xl sm:my-8">
            <div
              className="rounded-3xl border p-4 shadow-2xl sm:p-8"
              style={{
                background: theme.page,
                color: theme.text,
                borderColor: theme.border,
              }}
            >
              {!selectedAdminUser ? (
                // Users List View
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                      Admin Panel
                    </h2>
                    <span className="text-sm" style={{ color: theme.muted }}>
                      {adminUsers.length} users
                    </span>
                  </div>

                  {adminLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoaderCircle size={24} className="animate-spin" style={{ color: PALETTE.rose }} />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                      {adminUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectAdminUser(user)}
                          className="flex w-full items-center justify-between gap-4 p-4 rounded-xl border transition hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                          style={{
                            borderColor: theme.border,
                            background: theme.surface,
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                              style={{
                                background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.rose})`,
                                color: "#FFFFFF",
                              }}
                            >
                              {user.displayName?.charAt(0)?.toUpperCase() ||
                              user.email?.charAt(0)?.toUpperCase() ||
                              "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate" style={{ color: theme.text }}>
                                {user.displayName || "Unnamed User"}
                              </p>
                              <p className="text-xs truncate" style={{ color: theme.muted }}>
                                {user.email}
                              </p>
                              <p className="text-xs mt-1" style={{ color: theme.muted }}>
                                Role: {user.role || "user"} • Joined: {user.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown"}
                              </p>
                            </div>
                          </div>
                          <Users size={18} style={{ color: theme.muted }} />
                        </button>
                      ))}
                      {adminUsers.length === 0 && (
                        <p className="text-center py-8" style={{ color: theme.muted }}>
                          No users found
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Selected User Detail View
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdminUser(null);
                        setSelectedUserHistory([]);
                        setSelectedUserDocs([]);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      style={{ color: theme.muted }}
                    >
                      <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} />
                      <span className="text-sm font-medium">Back to users</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                        style={{
                          background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.rose})`,
                          color: "#FFFFFF",
                        }}
                      >
                        {selectedAdminUser.displayName?.charAt(0)?.toUpperCase() ||
                        selectedAdminUser.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                      </div>
                      <div className="text-left">
                        <p className="font-medium" style={{ color: theme.text }}>
                          {selectedAdminUser.displayName || "Unnamed User"}
                        </p>
                        <p className="text-xs" style={{ color: theme.muted }}>
                          {selectedAdminUser.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Search History */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: theme.text }}>
                        <History size={20} />
                        Search History ({selectedUserHistory.length})
                      </h3>
                      {selectedUserHistory.length === 0 ? (
                        <p className="text-center py-8 text-sm" style={{ color: theme.muted }}>
                          No search history
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                          {selectedUserHistory.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl border"
                              style={{
                                borderColor: theme.border,
                                background: theme.surface,
                              }}
                            >
                              <p className="font-medium text-sm mb-1" style={{ color: theme.text }}>
                                {item.query}
                              </p>
                              <p className="text-xs line-clamp-2" style={{ color: theme.muted }}>
                                {item.answer?.slice(0, 200) || "No answer"}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs" style={{ color: theme.muted }}>
                                  {item.sources?.length || 0} sources
                                </span>
                                <span className="text-xs" style={{ color: theme.muted }}>
                                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Unknown date"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: theme.text }}>
                        <FileText size={20} />
                        Uploaded Documents ({selectedUserDocs.length})
                      </h3>
                      {selectedUserDocs.length === 0 ? (
                        <p className="text-center py-8 text-sm" style={{ color: theme.muted }}>
                          No documents uploaded
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                          {selectedUserDocs.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3 rounded-xl border"
                              style={{
                                borderColor: theme.border,
                                background: theme.surface,
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate" style={{ color: theme.text }}>
                                    {doc.fileName || doc.name || "Unnamed Document"}
                                  </p>
                                  <p className="text-xs text-blue-500 truncate mt-1">
                                    {doc.url || doc.downloadURL || doc.link || "No link available"}
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: theme.muted }}>
                                    Type: {doc.type || doc.mimeType || "Unknown"} • Size: {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "Unknown"}
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: theme.muted }}>
                                    Uploaded: {doc.createdAt?.toDate?.()?.toLocaleString() || doc.uploadedAt?.toDate?.()?.toLocaleString() || "Unknown date"}
                                  </p>
                                </div>
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
                                    style={{
                                      background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.rose})`,
                                      color: "#FFFFFF",
                                    }}
                                  >
                                    <ExternalLink size={12} />
                                    Open
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete User Section */}
                  <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "rgba(163,64,84,0.3)", background: "rgba(163,64,84,0.05)" }}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: PALETTE.rose }}>
                      <Trash2 size={20} />
                      Danger Zone
                    </h3>
                    <p className="text-sm mb-4" style={{ color: theme.muted }}>
                      Deleting this user will permanently remove their account, all search history, and all uploaded documents. This action cannot be undone.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder='Type "delete user" to confirm'
                        className="flex-1 rounded-xl border px-4 py-2 text-sm outline-none"
                        style={{
                          borderColor: theme.border,
                          background: theme.input,
                          color: theme.text,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => deleteUser(selectedAdminUser.id)}
                        disabled={deleteConfirmText !== "delete user"}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: deleteConfirmText === "delete user"
                            ? `linear-gradient(110deg, ${PALETTE.rose}, ${PALETTE.burgundy})`
                            : "transparent",
                          color: deleteConfirmText === "delete user" ? "#FFFFFF" : PALETTE.rose,
                          borderColor: deleteConfirmText === "delete user" ? "transparent" : PALETTE.rose,
                        }}
                      >
                        <Trash2 size={16} />
                        Delete User
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
