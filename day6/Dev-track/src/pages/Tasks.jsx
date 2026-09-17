import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock3,
  MoreHorizontal,
  Trash2,
  X,
  CalendarDays,
  FolderKanban,
  ListTodo,
} from "lucide-react";

const initialTasks = [
  {
    id: 1,
    title: "Implement authentication",
    description: "Add login and registration functionality.",
    project: "E-Commerce Platform",
    priority: "High",
    status: "Completed",
    dueDate: "Sep 18",
  },
  {
    id: 2,
    title: "Create dashboard layout",
    description: "Build the main dashboard interface.",
    project: "Travel Planner",
    priority: "Medium",
    status: "In Progress",
    dueDate: "Sep 20",
  },
  {
    id: 3,
    title: "Design database schema",
    description: "Create tables and relationships.",
    project: "AI Assistant",
    priority: "High",
    status: "Todo",
    dueDate: "Sep 22",
  },
  {
    id: 4,
    title: "Fix responsive navigation",
    description: "Improve mobile navigation behavior.",
    project: "E-Commerce Platform",
    priority: "Low",
    status: "In Progress",
    dueDate: "Sep 19",
  },
  {
    id: 5,
    title: "Connect weather API",
    description: "Integrate external weather service.",
    project: "Travel Planner",
    priority: "Medium",
    status: "Todo",
    dueDate: "Sep 25",
  },
  {
    id: 6,
    title: "Build recommendation engine",
    description: "Generate personalized recommendations.",
    project: "AI Assistant",
    priority: "High",
    status: "Todo",
    dueDate: "Sep 29",
  },
  {
    id: 7,
    title: "Create product cards",
    description: "Build reusable product card components.",
    project: "E-Commerce Platform",
    priority: "Medium",
    status: "Completed",
    dueDate: "Sep 14",
  },
  {
    id: 8,
    title: "Add map integration",
    description: "Display locations using an interactive map.",
    project: "Travel Planner",
    priority: "High",
    status: "In Progress",
    dueDate: "Sep 23",
  },
  {
    id: 9,
    title: "Write API documentation",
    description: "Document application API endpoints.",
    project: "AI Assistant",
    priority: "Low",
    status: "Todo",
    dueDate: "Oct 01",
  },
];

const columns = [
  {
    id: "Todo",
    title: "Todo",
    icon: Circle,
    color: "text-slate-500",
    background: "bg-slate-100",
  },
  {
    id: "In Progress",
    title: "In Progress",
    icon: Clock3,
    color: "text-amber-500",
    background: "bg-amber-50",
  },
  {
    id: "Completed",
    title: "Completed",
    icon: CheckCircle2,
    color: "text-emerald-500",
    background: "bg-emerald-50",
  },
];

const TaskCard = memo(function TaskCard({ task, onDelete, onMove }) {
  console.log("🟡 TaskCard rendered:", task.title);

  const priorityStyles = {
    High: "bg-rose-50 text-rose-600",
    Medium: "bg-amber-50 text-amber-600",
    Low: "bg-blue-50 text-blue-600",
  };

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold leading-5 text-slate-800">
          {task.title}
        </h3>

        <button
          onClick={() => onDelete(task.id)}
          className="rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
        {task.description}
      </p>

      {/* Project */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <FolderKanban size={14} />

        <span className="truncate">{task.project}</span>
      </div>

      {/* Tags */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            priorityStyles[task.priority]
          }`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <CalendarDays size={13} />
          {task.dueDate}
        </div>
      </div>

      {/* Move buttons */}
      <div className="mt-4 flex gap-1.5 border-t border-slate-100 pt-3">
        {task.status !== "Todo" && (
          <button
            onClick={() =>
              onMove(
                task.id,
                task.status === "Completed" ? "In Progress" : "Todo",
              )
            }
            className="flex-1 rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ← Move back
          </button>
        )}

        {task.status !== "Completed" && (
          <button
            onClick={() =>
              onMove(
                task.id,
                task.status === "Todo" ? "In Progress" : "Completed",
              )
            }
            className="flex-1 rounded-lg bg-indigo-50 px-2 py-1.5 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            Move forward →
          </button>
        )}
      </div>
    </article>
  );
});

function NewTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("E-Commerce Platform");
  const [priority, setPriority] = useState("Medium");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    onCreate({
      title: title.trim(),
      description: description.trim() || "No description provided.",
      project,
      priority,
    });

    setTitle("");
    setDescription("");
    setProject("E-Commerce Platform");
    setPriority("Medium");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create Task</h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a task to your development workflow.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Task title
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Build authentication API"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What needs to be done?"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Project */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Project
            </label>

            <select
              value={project}
              onChange={(event) => setProject(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            >
              <option>E-Commerce Platform</option>
              <option>Travel Planner</option>
              <option>AI Assistant</option>
              <option>Portfolio Website</option>
              <option>Campus Connect</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Priority
            </label>

            <div className="grid grid-cols-3 gap-2">
              {["Low", "Medium", "High"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setPriority(item)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    priority === item
                      ? item === "High"
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : item === "Medium"
                          ? "border-amber-200 bg-amber-50 text-amber-600"
                          : "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyColumn({ status, onCreate }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <ListTodo size={18} />
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-500">
        No {status.toLowerCase()} tasks
      </p>

      {status === "Todo" && (
        <button
          onClick={onCreate}
          className="mt-2 text-xs font-semibold text-indigo-500 hover:text-indigo-600"
        >
          + Add a task
        </button>
      )}
    </div>
  );
}

function Tasks() {
  console.log("🔄 Tasks rendered");
  const [tasks, setTasks] = useState(initialTasks);

  const [search, setSearch] = useState("");

  const [priorityFilter, setPriorityFilter] = useState("All");

  const [projectFilter, setProjectFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const filteredTasks = useMemo(() => {
    console.log("Filtering tasks...");

    return tasks.filter((task) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        task.title.toLowerCase().includes(searchValue) ||
        task.description.toLowerCase().includes(searchValue) ||
        task.project.toLowerCase().includes(searchValue);

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      const matchesProject =
        projectFilter === "All" || task.project === projectFilter;

      return matchesSearch && matchesPriority && matchesProject;
    });
  }, [tasks, search, priorityFilter, projectFilter]);

  const handleDelete = useCallback((id) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }, []);

  const handleMove = useCallback((id, newStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: newStatus,
            }
          : task,
      ),
    );
  }, []);

  const handleCreate = (newTask) => {
    const task = {
      id: Date.now(),
      ...newTask,
      status: "Todo",
      dueDate: "Not set",
    };

    setTasks((currentTasks) => [task, ...currentTasks]);

    setShowModal(false);
  };

  const getColumnTasks = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const completedCount = tasks.filter(
    (task) => task.status === "Completed",
  ).length;

  const progressCount = tasks.filter(
    (task) => task.status === "In Progress",
  ).length;

  const todoCount = tasks.filter((task) => task.status === "Todo").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-500">
            <ListTodo size={17} />
            Workflow
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tasks
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organize your work and keep development moving.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          <Plus size={18} />
          New Task
        </button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Circle size={15} />
            <span className="text-xs font-medium">Todo</span>
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900">{todoCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500">
            <Clock3 size={15} />
            <span className="text-xs font-medium">In Progress</span>
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {progressCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 size={15} />
            <span className="text-xs font-medium">Completed</span>
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {completedCount}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400"
          >
            <option value="All">All priorities</option>

            <option value="High">High priority</option>

            <option value="Medium">Medium priority</option>

            <option value="Low">Low priority</option>
          </select>

          {/* Project */}
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400"
          >
            <option value="All">All projects</option>

            <option value="E-Commerce Platform">E-Commerce</option>

            <option value="Travel Planner">Travel Planner</option>

            <option value="AI Assistant">AI Assistant</option>
          </select>
        </div>
      </section>

      {/* Kanban */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;

          const columnTasks = getColumnTasks(column.id);

          return (
            <div key={column.id} className="min-w-0">
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${column.background}`}
                  >
                    <Icon size={16} className={column.color} />
                  </div>

                  <h2 className="text-sm font-bold text-slate-800">
                    {column.title}
                  </h2>

                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-[10px] font-bold text-slate-500">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDelete}
                      onMove={handleMove}
                    />
                  ))
                ) : (
                  <EmptyColumn
                    status={column.title}
                    onCreate={() => setShowModal(true)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Modal */}
      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default Tasks;
