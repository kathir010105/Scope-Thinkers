import { useEffect, useState } from "react";
import { X, FolderKanban, Loader2 } from "lucide-react";

export default function ProjectModal({
  project,
  onClose,
  onSave,
  saving = false,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [formError, setFormError] = useState("");

  /*
   * Fill form when editing an existing project
   */
  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setStatus(project.status || "active");
    } else {
      setName("");
      setDescription("");
      setStatus("active");
    }

    setFormError("");
  }, [project]);

  /*
   * Submit
   */
  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Project name is required.");
      return;
    }

    try {
      await onSave({
        name: trimmedName,
        description: description.trim(),
        status,
      });
    } catch (error) {
      console.error("Project form error:", error);

      setFormError(error?.message || "Unable to save project.");
    }
  }

  /*
   * Close when clicking the backdrop
   */
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !saving) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#0b100d] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
              <FolderKanban size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                {project ? "Edit project" : "Create project"}
              </h2>

              <p className="mt-0.5 text-xs text-white/35">
                {project
                  ? "Update your project details."
                  : "Create a new project workspace."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white/65">
                Project name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. E-commerce Platform"
                autoFocus
                disabled={saving}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#22c55e]/50 focus:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white/65">
                Description
                <span className="ml-1 text-white/25">(optional)</span>
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this project about?"
                rows={4}
                disabled={saving}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#22c55e]/50 focus:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white/65">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                disabled={saving}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0b100d] px-3 text-sm text-white/70 outline-none transition focus:border-[#22c55e]/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>

                <option value="completed">Completed</option>

                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Error */}
            {formError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                <p className="text-xs leading-relaxed text-red-400">
                  {formError}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-lg border border-white/10 px-4 text-sm text-white/50 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2 rounded-lg bg-[#22c55e] px-4 text-sm font-medium text-black transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FolderKanban size={16} />

                  {project ? "Save changes" : "Create project"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
