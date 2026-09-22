import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Loader2,
  Search,
  X,
} from "lucide-react";

import { globalSearch } from "../../services/searchService";

export default function GlobalSearch() {
  const navigate = useNavigate();

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [results, setResults] = useState({
    projects: [],
    tasks: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------
  // SEARCH
  // ---------------------------------------------

  useEffect(() => {
    const term = query.trim();

    if (!term) {
      setResults({
        projects: [],
        tasks: [],
      });

      setLoading(false);
      setError("");

      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const data = await globalSearch(term);

        setResults(data);
      } catch (err) {
        console.error("Global search error:", err);

        setError(err?.message || "Unable to perform search.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // ---------------------------------------------
  // OPEN SEARCH
  // ---------------------------------------------

  function openSearch() {
    setOpen(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  // ---------------------------------------------
  // CLOSE SEARCH
  // ---------------------------------------------

  function closeSearch() {
    setOpen(false);
    setQuery("");

    setResults({
      projects: [],
      tasks: [],
    });

    setError("");
  }

  // ---------------------------------------------
  // NAVIGATION
  // ---------------------------------------------

  function openProject(projectId) {
    closeSearch();

    navigate(`/projects/${projectId}`);
  }

  function openTask(projectId) {
    closeSearch();

    navigate(`/projects/${projectId}`);
  }

  // ---------------------------------------------
  // KEYBOARD SHORTCUT
  // ---------------------------------------------

  useEffect(() => {
    function handleKeyboard(event) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();

        if (open) {
          inputRef.current?.focus();
        } else {
          openSearch();
        }
      }

      if (event.key === "Escape" && open) {
        closeSearch();
      }
    }

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [open]);

  // ---------------------------------------------
  // CLICK OUTSIDE
  // ---------------------------------------------

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        closeSearch();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const hasResults = results.projects.length > 0 || results.tasks.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      {/* ======================================= */}
      {/* SEARCH INPUT */}
      {/* ======================================= */}

      <div
        className={`flex h-10 items-center rounded-lg border bg-zinc-950 transition ${
          open ? "border-zinc-600" : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        <Search className="ml-3 h-4 w-4 shrink-0 text-zinc-600" />

        <input
          ref={inputRef}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects and tasks..."
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");

              inputRef.current?.focus();
            }}
            className="mr-1 rounded-md p-1.5 text-zinc-600 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <kbd className="mr-2 hidden rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-600 sm:block">
          Ctrl K
        </kbd>
      </div>

      {/* ======================================= */}
      {/* RESULTS */}
      {/* ======================================= */}

      {open && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40">
          {/* Empty search */}

          {!query.trim() && (
            <div className="p-6 text-center">
              <Search className="mx-auto h-6 w-6 text-zinc-700" />

              <p className="mt-3 text-sm text-zinc-400">
                Search projects and tasks
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Use Ctrl + K to quickly open search.
              </p>
            </div>
          )}

          {/* Loading */}

          {query.trim() && loading && (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          )}

          {/* Error */}

          {query.trim() && !loading && error && (
            <div className="flex items-start gap-3 p-5">
              <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />

              <div>
                <p className="text-sm text-red-400">Search failed</p>

                <p className="mt-1 text-xs text-zinc-600">{error}</p>
              </div>
            </div>
          )}

          {/* No results */}

          {query.trim() && !loading && !error && !hasResults && (
            <div className="p-8 text-center">
              <Search className="mx-auto h-6 w-6 text-zinc-700" />

              <p className="mt-3 text-sm text-zinc-400">No results found</p>

              <p className="mt-1 text-xs text-zinc-600">
                Try a different search term.
              </p>
            </div>
          )}

          {/* Results */}

          {query.trim() && !loading && !error && hasResults && (
            <div className="max-h-[70vh] overflow-y-auto">
              {/* -------------------------------- */}
              {/* PROJECTS */}
              {/* -------------------------------- */}

              {results.projects.length > 0 && (
                <div className="p-2">
                  <div className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    Projects
                  </div>

                  {results.projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => openProject(project.id)}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-zinc-900"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                        <FolderKanban className="h-4 w-4 text-zinc-500" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {project.name}
                        </p>

                        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-600">
                          {project.description || "No description"}
                        </p>
                      </div>

                      <span
                        className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] capitalize ${
                          project.status === "active"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : project.status === "completed"
                              ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                              : "border-zinc-800 bg-zinc-900 text-zinc-600"
                        }`}
                      >
                        {project.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* -------------------------------- */}
              {/* TASKS */}
              {/* -------------------------------- */}

              {results.tasks.length > 0 && (
                <div
                  className={`p-2 ${
                    results.projects.length > 0
                      ? "border-t border-zinc-800"
                      : ""
                  }`}
                >
                  <div className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                    Tasks
                  </div>

                  {results.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => openTask(task.project_id)}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-zinc-900"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                        {task.status === "done" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ClipboardList className="h-4 w-4 text-zinc-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {task.title}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-zinc-600">
                          {task.projects?.name || "Unknown project"}
                        </p>
                      </div>

                      <span className="mt-1 text-[10px] capitalize text-zinc-600">
                        {task.priority}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
