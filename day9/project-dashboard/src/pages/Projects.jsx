import { useEffect, useState } from "react";
import {
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ProjectsTable from "../components/projects/ProjectsTable";
import ProjectModal from "../components/projects/ProjectModal";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projectService";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const result = await getProjects({
        page,
        pageSize,
        search,
        status,
      });

      setProjects(result.projects);
      setTotal(result.total);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [page, search, status]);

  function openCreateModal() {
    setEditingProject(null);
    setModalOpen(true);
  }

  function openEditModal(project) {
    setEditingProject(project);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingProject(null);
  }

  async function handleSave(formData) {
    try {
      setSaving(true);
      setError("");

      if (editingProject) {
        await updateProject(editingProject.id, formData);
      } else {
        await createProject(formData);
      }

      setModalOpen(false);
      setEditingProject(null);

      await loadProjects();
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProject(project.id);

      if (projects.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadProjects();
      }
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to delete project.");
    }
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-white/35">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white/55">Projects</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Projects
          </h1>

          <p className="mt-1 text-sm text-white/40">
            Manage your projects and keep your team aligned.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#22c55e] px-4 text-sm font-medium text-black transition hover:bg-[#16a34a]"
        >
          <Plus size={17} />
          New project
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-xs text-red-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main card */}
      <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0b100d]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 focus-within:border-[#22c55e]/40">
              <Search size={16} className="shrink-0 text-white/30" />

              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search projects..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>

            {/* Status */}
            <select
              value={status}
              onChange={handleStatusChange}
              className="h-10 rounded-lg border border-white/10 bg-[#0b100d] px-3 text-sm text-white/60 outline-none focus:border-[#22c55e]/40"
            >
              <option value="">All statuses</option>

              <option value="active">Active</option>

              <option value="completed">Completed</option>

              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={loadProjects}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#22c55e]" />

              <p className="text-sm text-white/35">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
              <FolderKanban size={24} className="text-white/25" />
            </div>

            <h3 className="text-sm font-semibold text-white">
              No projects yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-white/35">
              Create your first project to start organizing tasks and
              collaboration.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#22c55e] px-4 text-sm font-medium text-black transition hover:bg-[#16a34a]"
            >
              <Plus size={16} />
              Create project
            </button>
          </div>
        ) : (
          <ProjectsTable
            projects={projects}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/35">
              Showing{" "}
              <span className="text-white/60">{(page - 1) * pageSize + 1}</span>{" "}
              to{" "}
              <span className="text-white/60">
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of <span className="text-white/60">{total}</span> projects
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-white/40 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={15} />
              </button>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-white/5 px-2 text-xs text-white">
                {page}
              </div>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-white/40 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modal */}
      {modalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
