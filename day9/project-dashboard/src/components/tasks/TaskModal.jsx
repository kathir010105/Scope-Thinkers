import { useEffect, useState } from "react";
import { X, ListTodo, Loader2, UserRound } from "lucide-react";

export default function TaskModal({
  task,
  members = [],
  onClose,
  onSave,
  saving = false,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("todo");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setStatus(task.status || "todo");
      setAssignedTo(task.assigned_to || "");
      setDueDate(task.due_date || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("todo");
      setAssignedTo("");
      setDueDate("");
    }

    setFormError("");
  }, [task]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Task title is required.");
      return;
    }

    try {
      await onSave({
        title: trimmedTitle,
        description: description.trim(),
        priority,
        status,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
      });
    } catch (error) {
      console.error("Task form error:", error);

      setFormError(error?.message || "Unable to save task.");
    }
  }

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
              <ListTodo size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                {task?.id ? "Edit task" : "Create task"}
              </h2>

              <p className="mt-0.5 text-xs text-white/35">
                {task?.id
                  ? "Update task details."
                  : "Add a task to this project."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white/65">
                Task title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Implement authentication"
                autoFocus
                disabled={saving}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#22c55e]/50"
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
                placeholder="Describe what needs to be done..."
                rows={3}
                disabled={saving}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#22c55e]/50"
              />
            </div>

            {/* Priority + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-xs font-medium text-white/65">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#0b100d] px-3 text-sm text-white/70 outline-none focus:border-[#22c55e]/50"
                >
                  <option value="low">Low</option>

                  <option value="medium">Medium</option>

                  <option value="high">High</option>

                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/65">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#0b100d] px-3 text-sm text-white/70 outline-none focus:border-[#22c55e]/50"
                >
                  <option value="todo">Todo</option>

                  <option value="in_progress">In Progress</option>

                  <option value="review">Review</option>

                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Assignment */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white/65">
                Assign to
              </label>

              <div className="relative">
                <UserRound
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                />

                <select
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.target.value)}
                  disabled={saving || members.length === 0}
                  className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-[#0b100d] pl-9 pr-3 text-sm text-white/70 outline-none focus:border-[#22c55e]/50"
                >
                  <option value="">Unassigned</option>

                  {members.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.profile?.full_name || "Unnamed user"}
                    </option>
                  ))}
                </select>
              </div>

              {members.length === 0 && (
                <p className="mt-1.5 text-[10px] text-white/25">
                  Add project members before assigning tasks.
                </p>
              )}
            </div>

            {/* Due date */}
            <div>
              <label className="mb-2 block text-xs font-medium text-white/65">
                Due date
                <span className="ml-1 text-white/25">(optional)</span>
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                disabled={saving}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0b100d] px-3 text-sm text-white/70 outline-none focus:border-[#22c55e]/50"
              />
            </div>

            {/* Error */}
            {formError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                <p className="text-xs text-red-400">{formError}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-lg border border-white/10 px-4 text-sm text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#22c55e] px-4 text-sm font-medium text-black transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ListTodo size={16} />

                  {task?.id ? "Save changes" : "Create task"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
