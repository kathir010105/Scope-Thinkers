import React from "react";
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  MoreHorizontal,
  CalendarDays,
  Lightbulb,
  Rocket,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Total Projects",
    value: "12",
    change: "+2 this month",
    icon: FolderKanban,
    iconStyle: "bg-violet-100 text-violet-600",
    trendStyle: "text-emerald-500",
  },
  {
    title: "Total Tasks",
    value: "148",
    change: "+18 this week",
    icon: ListTodo,
    iconStyle: "bg-blue-100 text-blue-600",
    trendStyle: "text-emerald-500",
  },
  {
    title: "Completed",
    value: "96",
    change: "64.8% completion rate",
    icon: CheckCircle2,
    iconStyle: "bg-emerald-100 text-emerald-600",
    trendStyle: "text-slate-500",
  },
  {
    title: "Due Soon",
    value: "8",
    change: "Within 7 days",
    icon: Clock3,
    iconStyle: "bg-orange-100 text-orange-600",
    trendStyle: "text-slate-500",
  },
];

const projects = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description: "Full-stack shopping platform",
    progress: 78,
    tasks: 32,
    updated: "Updated 2 days ago",
    color: "from-rose-400 to-orange-300",
  },
  {
    id: 2,
    name: "Travel Planner",
    description: "Smart travel planning application",
    progress: 64,
    tasks: 24,
    updated: "Updated 5 days ago",
    color: "from-blue-400 to-cyan-300",
  },
  {
    id: 3,
    name: "AI Assistant",
    description: "Personal productivity assistant",
    progress: 42,
    tasks: 18,
    updated: "Updated 1 week ago",
    color: "from-violet-500 to-purple-400",
  },
];

const recentTasks = [
  {
    id: 1,
    title: "Implement authentication",
    project: "E-Commerce Platform",
    priority: "High",
    status: "Completed",
    updated: "2 hours ago",
    dot: "bg-emerald-500",
  },
  {
    id: 2,
    title: "Create dashboard layout",
    project: "Travel Planner",
    priority: "Medium",
    status: "In Progress",
    updated: "5 hours ago",
    dot: "bg-amber-400",
  },
  {
    id: 3,
    title: "Design database schema",
    project: "AI Assistant",
    priority: "High",
    status: "Todo",
    updated: "1 day ago",
    dot: "bg-slate-400",
  },
  {
    id: 4,
    title: "Fix responsive navigation",
    project: "E-Commerce Platform",
    priority: "Low",
    status: "In Progress",
    updated: "1 day ago",
    dot: "bg-amber-400",
  },
];

function StatCard({ title, value, change, icon: Icon, iconStyle, trendStyle }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {trendStyle === "text-emerald-500" && (
          <TrendingUp size={14} className="text-emerald-500" />
        )}

        <p className={`text-xs font-medium ${trendStyle}`}>{change}</p>
      </div>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {/* Project image */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${project.color}`}
          >
            <FolderKanban size={21} className="text-white" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {project.name}
            </h3>

            <p className="mt-1 truncate text-xs text-slate-500">
              {project.description}
            </p>
          </div>
        </div>

        <button className="ml-3 text-slate-400 transition hover:text-slate-700">
          <MoreHorizontal size={19} />
        </button>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Progress</span>

          <span className="text-xs font-bold text-slate-800">
            {project.progress}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ListTodo size={15} />
          {project.tasks} tasks
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <CalendarDays size={14} />
          {project.updated}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }) {
  const priorityStyles = {
    High: "bg-rose-50 text-rose-600",
    Medium: "bg-amber-50 text-amber-600",
    Low: "bg-indigo-50 text-indigo-600",
  };

  const statusStyles = {
    Completed: "bg-emerald-50 text-emerald-600",
    "In Progress": "bg-blue-50 text-blue-600",
    Todo: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="grid grid-cols-12 items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
      {/* Task */}
      <div className="col-span-12 flex items-center gap-3 md:col-span-4">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${task.dot}`} />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {task.title}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">{task.project}</p>
        </div>
      </div>

      {/* Project */}
      <div className="hidden text-sm text-slate-500 md:col-span-3 md:block">
        {task.project}
      </div>

      {/* Priority */}
      <div className="hidden md:col-span-2 md:block">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      {/* Status */}
      <div className="col-span-6 md:col-span-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}
        >
          {task.status}
        </span>
      </div>

      {/* Updated */}
      <div className="col-span-6 text-right text-xs text-slate-400 md:col-span-1">
        {task.updated}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-10">
      {/* ─────────────────────────────────────
          HERO
      ───────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/70 px-6 py-8 shadow-sm sm:px-8">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-indigo-500">
              Wednesday, September 16
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Good morning, Kathirvel 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Here's what's happening across your development projects.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500">
              New Task
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────
          STATS
      ───────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      {/* ─────────────────────────────────────
          PROJECTS HEADER
      ───────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban size={20} className="text-indigo-500" />

              <h2 className="text-xl font-bold text-slate-900">
                Recent Projects
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Your latest active projects
            </p>
          </div>

          <button className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 sm:flex">
            View all
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────
          TASKS
      ───────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-indigo-500" />

              <h2 className="text-xl font-bold text-slate-900">Recent Tasks</h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Your latest task activity
            </p>
          </div>

          <button className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 sm:flex">
            View all
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table header */}
          <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
            <div className="col-span-4">Task</div>

            <div className="col-span-3">Project</div>

            <div className="col-span-2">Priority</div>

            <div className="col-span-2">Status</div>

            <div className="col-span-1">Updated</div>
          </div>

          {recentTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────
          MOTIVATION
      ───────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Rocket size={23} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">Keep going!</h3>

              <p className="mt-1 text-sm text-slate-500">
                You've completed 64.8% of your tasks. You're making great
                progress.
              </p>
            </div>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50">
            View Analytics
            <ArrowUpRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
