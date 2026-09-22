import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Filter,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import { getMyTasks, updateMyTaskStatus } from "../services/myTaskService";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyTasks({
        search,
        status,
        priority,
      });

      setTasks(data);
    } catch (err) {
      console.error("My Tasks error:", err);
      setError(err?.message || "Unable to load your tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [search, status, priority]);

  // ---------------------------------------------
  // COUNTS
  // ---------------------------------------------

  const counts = useMemo(() => {
    const total = tasks.length;

    const todo = tasks.filter((task) => task.status === "todo").length;

    const inProgress = tasks.filter(
      (task) => task.status === "in_progress",
    ).length;

    const review = tasks.filter((task) => task.status === "review").length;

    const done = tasks.filter((task) => task.status === "done").length;

    const today = new Date().toISOString().split("T")[0];

    const overdue = tasks.filter(
      (task) =>
        task.due_date && task.due_date < today && task.status !== "done",
    ).length;

    return {
      total,
      todo,
      inProgress,
      review,
      done,
      overdue,
    };
  }, [tasks]);

  // ---------------------------------------------
  // UPDATE STATUS
  // ---------------------------------------------

  async function handleStatusChange(taskId, newStatus) {
    try {
      setUpdatingTaskId(taskId);

      const updatedTask = await updateMyTaskStatus(taskId, newStatus);

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...updatedTask,
              }
            : task,
        ),
      );
    } catch (err) {
      console.error("Task status update error:", err);

      setError(err?.message || "Unable to update task status.");
    } finally {
      setUpdatingTaskId(null);
    }
  }

  // ---------------------------------------------
  // HELPERS
  // ---------------------------------------------

  function formatDate(date) {
    if (!date) {
      return "No due date";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function isOverdue(task) {
    if (!task.due_date) {
      return false;
    }

    const today = new Date().toISOString().split("T")[0];

    return task.due_date < today && task.status !== "done";
  }

  function getStatusLabel(status) {
    const labels = {
      todo: "To Do",
      in_progress: "In Progress",
      review: "Review",
      done: "Done",
    };

    return labels[status] || status;
  }

  function getStatusClass(status) {
    const classes = {
      todo: "border-zinc-700 bg-zinc-900 text-zinc-300",

      in_progress: "border-blue-500/20 bg-blue-500/10 text-blue-400",

      review: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",

      done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    };

    return classes[status] || classes.todo;
  }

  function getPriorityClass(priority) {
    const classes = {
      low: "text-zinc-500",
      medium: "text-blue-400",
      high: "text-orange-400",
      urgent: "text-red-400",
    };

    return classes[priority] || classes.medium;
  }

  // ---------------------------------------------
  // ERROR
  // ---------------------------------------------

  if (error && !loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-400" />

            <div>
              <h2 className="font-medium text-red-400">
                Unable to load your tasks
              </h2>

              <p className="mt-1 text-sm text-zinc-500">{error}</p>

              <button
                onClick={loadTasks}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Personal workspace</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            My Tasks
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Tasks currently assigned to you.
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* ========================================= */}
      {/* SUMMARY */}
      {/* ========================================= */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total" value={counts.total} icon={ClipboardList} />

        <SummaryCard
          label="In Progress"
          value={counts.inProgress}
          icon={Clock3}
        />

        <SummaryCard
          label="Completed"
          value={counts.done}
          icon={CheckCircle2}
        />

        <SummaryCard
          label="Overdue"
          value={counts.overdue}
          icon={AlertTriangle}
          danger={counts.overdue > 0}
        />
      </div>

      {/* ========================================= */}
      {/* FILTER BAR */}
      {/* ========================================= */}

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your tasks..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          {/* Status */}

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 pl-9 pr-9 text-sm text-zinc-300 outline-none focus:border-zinc-600 lg:w-44"
            >
              <option value="">All statuses</option>

              <option value="todo">To Do</option>

              <option value="in_progress">In Progress</option>

              <option value="review">Review</option>

              <option value="done">Done</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          </div>

          {/* Priority */}

          <div className="relative">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 pr-9 text-sm text-zinc-300 outline-none focus:border-zinc-600 lg:w-44"
            >
              <option value="">All priorities</option>

              <option value="low">Low</option>

              <option value="medium">Medium</option>

              <option value="high">High</option>

              <option value="urgent">Urgent</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* TASK LIST */}
      {/* ========================================= */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-medium text-white">Assigned Tasks</h2>

            <p className="mt-1 text-sm text-zinc-500">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} shown
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading tasks...
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState hasFilters={search || status || priority} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
            <div className="divide-y divide-zinc-800">
              {tasks.map((task) => {
                const overdue = isOverdue(task);

                return (
                  <div
                    key={task.id}
                    className="group p-4 transition hover:bg-zinc-900/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Task information */}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                              task.status === "done"
                                ? "bg-emerald-400"
                                : overdue
                                  ? "bg-red-400"
                                  : "bg-zinc-600"
                            }`}
                          />

                          <div className="min-w-0">
                            <h3
                              className={`truncate text-sm font-medium ${
                                task.status === "done"
                                  ? "text-zinc-500 line-through"
                                  : "text-zinc-200"
                              }`}
                            >
                              {task.title}
                            </h3>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
                              <span>
                                {task.projects?.name || "Unknown project"}
                              </span>

                              <span className="text-zinc-800">•</span>

                              <span
                                className={`capitalize ${getPriorityClass(
                                  task.priority,
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}

                      <div className="flex flex-wrap items-center gap-3 pl-5 lg:pl-0">
                        {/* Due date */}

                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            overdue ? "text-red-400" : "text-zinc-500"
                          }`}
                        >
                          {overdue ? (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          ) : (
                            <CalendarDays className="h-3.5 w-3.5" />
                          )}

                          <span>
                            {overdue
                              ? `Overdue · ${formatDate(task.due_date)}`
                              : formatDate(task.due_date)}
                          </span>
                        </div>

                        {/* Status */}

                        <div className="relative">
                          {updatingTaskId === task.id ? (
                            <div className="flex h-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-3">
                              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                            </div>
                          ) : (
                            <select
                              value={task.status}
                              onChange={(event) =>
                                handleStatusChange(task.id, event.target.value)
                              }
                              className={`appearance-none rounded-lg border py-1.5 pl-3 pr-8 text-xs outline-none transition ${getStatusClass(
                                task.status,
                              )}`}
                            >
                              <option value="todo">To Do</option>

                              <option value="in_progress">In Progress</option>

                              <option value="review">Review</option>

                              <option value="done">Done</option>
                            </select>
                          )}

                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
                        </div>

                        {/* Open project */}

                        <Link
                          to={`/projects/${task.project_id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-white"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ================================================= */
/* SUMMARY CARD */
/* ================================================= */

function SummaryCard({ label, value, icon: Icon, danger = false }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">{label}</span>

        <Icon
          className={`h-4 w-4 ${danger ? "text-red-400" : "text-zinc-600"}`}
        />
      </div>

      <p
        className={`mt-3 text-2xl font-semibold ${
          danger && value > 0 ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ================================================= */
/* EMPTY STATE */
/* ================================================= */

function EmptyState({ hasFilters }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
      <ClipboardList className="mx-auto h-8 w-8 text-zinc-700" />

      <h3 className="mt-4 text-sm font-medium text-zinc-300">
        {hasFilters ? "No matching tasks" : "No tasks assigned to you"}
      </h3>

      <p className="mt-1 text-sm text-zinc-600">
        {hasFilters
          ? "Try changing your search or filters."
          : "Tasks assigned to your account will appear here."}
      </p>
    </div>
  );
}
