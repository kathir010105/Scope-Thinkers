import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";

import { getDashboardData } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardData();

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const completionPercentage = useMemo(() => {
    if (!dashboard?.stats?.totalTasks) {
      return 0;
    }

    return Math.round(
      (dashboard.stats.completedTasks / dashboard.stats.totalTasks) * 100,
    );
  }, [dashboard]);

  function formatDate(date) {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
      low: "text-zinc-400",
      medium: "text-blue-400",
      high: "text-orange-400",
      urgent: "text-red-400",
    };

    return classes[priority] || classes.medium;
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-400" />

            <div>
              <h2 className="font-medium text-red-400">
                Unable to load dashboard
              </h2>

              <p className="mt-1 text-sm text-zinc-400">{error}</p>

              <button
                onClick={loadDashboard}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
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

  const { stats, recentProjects, upcomingTasks } = dashboard;

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Welcome back</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {user?.user_metadata?.full_name ||
              user?.email?.split("@")[0] ||
              "Developer"}
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Here's what's happening across your projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* ========================================= */}
      {/* STAT CARDS */}
      {/* ========================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          subtitle={`${stats.activeProjects} active`}
          icon={FolderKanban}
        />

        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          subtitle={`${stats.completedTasks} completed`}
          icon={ClipboardList}
        />

        <StatCard
          title="My Tasks"
          value={stats.myTasks}
          subtitle="Currently assigned"
          icon={Target}
        />

        <StatCard
          title="Overdue"
          value={stats.overdueTasks}
          subtitle="Tasks need attention"
          icon={AlertTriangle}
          danger={stats.overdueTasks > 0}
        />
      </div>

      {/* ========================================= */}
      {/* MAIN GRID */}
      {/* ========================================= */}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* ======================================= */}
        {/* TASK PROGRESS */}
        {/* ======================================= */}

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />

                <h2 className="font-medium text-white">Task Progress</h2>
              </div>

              <p className="mt-1 text-sm text-zinc-500">
                Current task distribution across your projects.
              </p>
            </div>

            <span className="text-2xl font-semibold text-white">
              {completionPercentage}%
            </span>
          </div>

          {/* Progress bar */}

          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>
          </div>

          {/* Task breakdown */}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TaskStatus
              label="To Do"
              value={stats.todoTasks}
              dot="bg-zinc-500"
            />

            <TaskStatus
              label="In Progress"
              value={stats.inProgressTasks}
              dot="bg-blue-400"
            />

            <TaskStatus
              label="Review"
              value={stats.reviewTasks}
              dot="bg-yellow-400"
            />

            <TaskStatus
              label="Done"
              value={stats.completedTasks}
              dot="bg-emerald-400"
            />
          </div>
        </section>

        {/* ======================================= */}
        {/* PROJECT SUMMARY */}
        {/* ======================================= */}

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-medium text-white">Project Overview</h2>

              <p className="mt-1 text-sm text-zinc-500">
                Current project status.
              </p>
            </div>

            <FolderKanban className="h-5 w-5 text-zinc-600" />
          </div>

          <div className="mt-6 space-y-4">
            <ProjectStat label="Active" value={stats.activeProjects} />

            <ProjectStat label="Completed" value={stats.completedProjects} />

            <ProjectStat
              label="Archived"
              value={Math.max(
                stats.totalProjects -
                  stats.activeProjects -
                  stats.completedProjects,
                0,
              )}
            />
          </div>

          <Link
            to="/projects"
            className="mt-6 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-white"
          >
            <span>View all projects</span>

            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      {/* ========================================= */}
      {/* RECENT PROJECTS */}
      {/* ========================================= */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-medium text-white">Recent Projects</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Projects you've recently worked on.
            </p>
          </div>

          <Link
            to="/projects"
            className="flex items-center gap-1 text-sm text-zinc-500 transition hover:text-white"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center">
            <FolderKanban className="mx-auto h-8 w-8 text-zinc-700" />

            <p className="mt-3 text-sm text-zinc-500">No projects yet.</p>

            <Link
              to="/projects"
              className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
            >
              Create your first project
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-white group-hover:text-emerald-400">
                      {project.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-zinc-400" />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs capitalize ${
                      project.status === "active"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : project.status === "completed"
                          ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                          : "border-zinc-700 bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    {project.status}
                  </span>

                  <span className="text-xs text-zinc-600">
                    {formatDate(project.updated_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ========================================= */}
      {/* UPCOMING TASKS */}
      {/* ========================================= */}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-medium text-white">Upcoming Tasks</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Your next assigned tasks.
            </p>
          </div>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-10 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/50" />

            <p className="mt-3 text-sm text-zinc-500">No upcoming tasks.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
            <div className="divide-y divide-zinc-800">
              {upcomingTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/projects/${task.project_id}`}
                  className="flex flex-col gap-4 p-4 transition hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <Timer className="h-4 w-4 shrink-0 text-zinc-600" />

                      <h3 className="truncate text-sm font-medium text-zinc-200">
                        {task.title}
                      </h3>
                    </div>

                    <p className="mt-1 pl-7 text-xs text-zinc-600">
                      {task.projects?.name || "Unknown project"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pl-7 sm:pl-0">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs ${getStatusClass(
                        task.status,
                      )}`}
                    >
                      {getStatusLabel(task.status)}
                    </span>

                    <span
                      className={`text-xs font-medium capitalize ${getPriorityClass(
                        task.priority,
                      )}`}
                    >
                      {task.priority}
                    </span>

                    <span className="whitespace-nowrap text-xs text-zinc-500">
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ================================================= */
/* STAT CARD */
/* ================================================= */

function StatCard({ title, value, subtitle, icon: Icon, danger = false }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
          <Icon
            className={`h-4 w-4 ${danger ? "text-red-400" : "text-zinc-400"}`}
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm text-zinc-500">{title}</p>

        <p
          className={`mt-1 text-3xl font-semibold ${
            danger && value > 0 ? "text-red-400" : "text-white"
          }`}
        >
          {value}
        </p>

        <p className="mt-1 text-xs text-zinc-600">{subtitle}</p>
      </div>
    </div>
  );
}

/* ================================================= */
/* TASK STATUS */
/* ================================================= */

function TaskStatus({ label, value, dot }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />

        <span className="text-xs text-zinc-500">{label}</span>
      </div>

      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

/* ================================================= */
/* PROJECT STAT */
/* ================================================= */

function ProjectStat({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500">{label}</span>

      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
