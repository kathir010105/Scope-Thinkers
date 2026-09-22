import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

export default function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[500px] min-w-[280px] flex-1 flex-col rounded-xl border bg-[#0b100d] transition ${
        isOver ? "border-[#22c55e]/40 bg-[#22c55e]/[0.03]" : "border-white/10"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${column.dot}`} />

          <h3 className="text-xs font-semibold text-white">{column.title}</h3>

          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask(column.id)}
          className="rounded p-1.5 text-white/25 transition hover:bg-white/5 hover:text-white"
          title="Add task"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Column Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Empty column */}
        {tasks.length === 0 && (
          <button
            type="button"
            onClick={() => onAddTask(column.id)}
            className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-white/20 transition hover:border-[#22c55e]/30 hover:text-[#22c55e]"
          >
            + Add task
          </button>
        )}

        {/* Extra drop space */}
        <div className="min-h-20 flex-1" />
      </div>
    </section>
  );
}
