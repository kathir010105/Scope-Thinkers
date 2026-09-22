import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityStyles = {
    low: "text-white/35 bg-white/5",
    medium: "text-blue-400 bg-blue-500/10",
    high: "text-orange-400 bg-orange-500/10",
    urgent: "text-red-400 bg-red-500/10",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab rounded-lg border border-white/10 bg-[#0f1511] p-3 transition ${
        isDragging
          ? "z-50 cursor-grabbing opacity-60 shadow-2xl"
          : "hover:border-white/15"
      }`}
    >
      {/* Main content */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {/* Title is now NOT clickable */}
          <p className="text-sm font-medium leading-5 text-white">
            {task.title}
          </p>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/35">
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex shrink-0 opacity-0 transition group-hover:opacity-100"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            className="rounded p-1.5 text-white/25 transition hover:bg-white/5 hover:text-white"
            title="Edit task"
          >
            <Pencil size={13} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task);
            }}
            className="rounded p-1.5 text-white/25 transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Bottom metadata */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`rounded px-2 py-1 text-[10px] font-medium capitalize ${
            priorityStyles[task.priority] || priorityStyles.medium
          }`}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span className="flex items-center gap-1 text-[10px] text-white/30">
            <CalendarDays size={12} />

            {new Date(`${task.due_date}T00:00:00`).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        )}
      </div>
    </article>
  );
}
