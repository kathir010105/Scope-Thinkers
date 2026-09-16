import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FolderKanban,
  MoreHorizontal,
  CalendarDays,
  ListTodo,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

const initialProjects = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description: "Full-stack shopping platform",
    status: "Active",
    priority: "High",
    progress: 78,
    tasks: 32,
    dueDate: "Sep 24, 2026",
  },
  {
    id: 2,
    name: "Travel Planner",
    description: "Smart travel planning application",
    status: "Active",
    priority: "Medium",
    progress: 64,
    tasks: 24,
    dueDate: "Sep 28, 2026",
  },
  {
    id: 3,
    name: "AI Assistant",
    description: "Personal productivity assistant",
    status: "Active",
    priority: "High",
    progress: 42,
    tasks: 18,
    dueDate: "Oct 05, 2026",
  },
  {
    id: 4,
    name: "Portfolio Website",
    description: "Personal developer portfolio",
    status: "Completed",
    priority: "Medium",
    progress: 100,
    tasks: 16,
    dueDate: "Sep 10, 2026",
  },
  {
    id: 5,
    name: "Campus Connect",
    description: "Student communication platform",
    status: "Active",
    priority: "Low",
    progress: 35,
    tasks: 27,
    dueDate: "Oct 12, 2026",
  },
  {
    id: 6,
    name: "Weather Dashboard",
    description: "Real-time weather monitoring app",
    status: "Completed",
    priority: "Low",
    progress: 100,
    tasks: 11,
    dueDate: "Aug 30, 2026",
  },
];

function ProjectCard({ project, onDelete }) {
  const priorityStyles = {
    High: "bg-rose-50 text-rose-600",
    Medium: "bg-amber-50 text-amber-600",
    Low: "bg-blue-50 text-blue-600",
  };

  const projectColors = {
    1: "from-rose-400 to-orange-300",
    2: "from-blue-400 to-cyan-300",
    3: "from-violet-500 to-purple-400",
    4: "from-emerald-400 to-teal-300",
    5: "from-amber-400 to-yellow-300",
    6: "from-sky-400 to-indigo-300",
  };

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
              projectColors[project.id]
            }`}
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

        <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <MoreHorizontal size={19} />
        </button>
      </div>

      {/* Tags */}
      <div className="mt-5 flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            priorityStyles[project.priority]
          }`}
        >
          {project.priority} priority
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            project.status === "Completed"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {project.status}
        </span>
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
            className={`h-full rounded-full ${
              project.status === "Completed"
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-indigo-500 to-violet-500"
            }`}
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ListTodo size={15} />
          {project.tasks} tasks
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays size={14} />
          {project.dueDate}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(project.id)}
        className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-400 opacity-0 transition group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
      >
        Remove Project
      </button>
    </article>
  );
}

function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      description: description.trim() || "New development project",
    });

    setName("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Project</h2>

            <p className="mt-1 text-sm text-slate-500">
              Start tracking a new project.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Project name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile Banking App"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you building?"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Projects() {
  const [projects, setProjects] = useState(initialProjects);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  /*
   * We'll come back to this later.
   *
   * This is our first real useMemo opportunity.
   */
  const filteredProjects = useMemo(() => {
    console.log("Filtering projects...");

    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleDelete = (id) => {
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== id),
    );
  };

  const handleCreate = (newProject) => {
    const project = {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description,
      status: "Active",
      priority: "Medium",
      progress: 0,
      tasks: 0,
      dueDate: "Not set",
    };

    setProjects((currentProjects) => [project, ...currentProjects]);

    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-500">
            <FolderKanban size={17} />
            Workspace
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Projects
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage and track everything you're building.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          <Plus size={18} />
          New Project
        </button>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Projects</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {projects.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Active</p>

          <p className="mt-2 text-2xl font-bold text-indigo-600">
            {projects.filter((project) => project.status === "Active").length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Completed</p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {
              projects.filter((project) => project.status === "Completed")
                .length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Tasks</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {projects.reduce((total, project) => total + project.tasks, 0)}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        {/* Status */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          {["All", "Active", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                statusFilter === status
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      {filteredProjects.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </section>
      ) : (
        <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <FolderKanban size={25} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No projects found
          </h2>

          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Try changing your search or filter, or create a new project.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500"
          >
            <Plus size={17} />
            Create Project
          </button>
        </section>
      )}

      {/* Modal */}
      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default Projects;
