import { useEffect, useMemo, useState } from "react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useNavigate, useParams } from "react-router-dom";
import { createNotification } from "../services/notificationService";

import { ArrowLeft, FolderKanban, Loader2, Plus, Users } from "lucide-react";

import { getProjectById } from "../services/projectService";

import {
  createTask,
  deleteTask,
  getProjectTasks,
  updateTask,
  updateTaskPosition,
} from "../services/taskService";

import { getProjectMembers } from "../services/memberService";

import TaskModal from "../components/tasks/TaskModal";
import TaskCard from "../components/tasks/TaskCard";
import KanbanColumn from "../components/tasks/KanbanColumn";
import MembersModal from "../components/members/MembersModal";

const columns = [
  {
    id: "todo",
    title: "Todo",
    dot: "bg-white/40",
  },
  {
    id: "in_progress",
    title: "In Progress",
    dot: "bg-blue-400",
  },
  {
    id: "review",
    title: "Review",
    dot: "bg-orange-400",
  },
  {
    id: "done",
    title: "Done",
    dot: "bg-[#22c55e]",
  },
];

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  /* -------------------------------------------------------
     PROJECT
  ------------------------------------------------------- */

  const [project, setProject] = useState(null);

  /* -------------------------------------------------------
     TASKS
  ------------------------------------------------------- */

  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);

  /* -------------------------------------------------------
     MEMBERS
  ------------------------------------------------------- */

  const [members, setMembers] = useState([]);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  /* -------------------------------------------------------
     GENERAL LOADING / ERROR
  ------------------------------------------------------- */

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* -------------------------------------------------------
     TASK MODAL
  ------------------------------------------------------- */

  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const [editingTask, setEditingTask] = useState(null);

  const [defaultTaskStatus, setDefaultTaskStatus] = useState("todo");

  const [savingTask, setSavingTask] = useState(false);

  /* -------------------------------------------------------
     DRAGGING
  ------------------------------------------------------- */

  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  /* -------------------------------------------------------
     LOAD PROJECT
  ------------------------------------------------------- */

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    try {
      setLoading(true);
      setError("");

      const [projectData, taskData, memberData] = await Promise.all([
        getProjectById(projectId),
        getProjectTasks(projectId),
        getProjectMembers(projectId),
      ]);

      setProject(projectData);
      setTasks(taskData);
      setMembers(memberData);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to load this project.");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------
     LOAD TASKS
  ------------------------------------------------------- */

  async function loadTasks() {
    try {
      setTaskLoading(true);

      const data = await getProjectTasks(projectId);

      setTasks(data);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to load tasks.");
    } finally {
      setTaskLoading(false);
    }
  }

  /* -------------------------------------------------------
     GROUP TASKS
  ------------------------------------------------------- */

  const groupedTasks = useMemo(() => {
    const groups = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };

    tasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });

    Object.keys(groups).forEach((status) => {
      groups[status].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    });

    return groups;
  }, [tasks]);

  /* -------------------------------------------------------
     MEMBERS CHANGED
  ------------------------------------------------------- */

  function handleMembersChanged(updatedMembers) {
    setMembers(updatedMembers);
  }

  /* -------------------------------------------------------
     CREATE TASK
  ------------------------------------------------------- */

  function openCreateTask(status = "todo") {
    setEditingTask(null);
    setDefaultTaskStatus(status);
    setTaskModalOpen(true);
  }

  /* -------------------------------------------------------
     EDIT TASK
  ------------------------------------------------------- */

  function openEditTask(task) {
    setEditingTask(task);
    setDefaultTaskStatus(task.status);
    setTaskModalOpen(true);
  }

  /* -------------------------------------------------------
     CLOSE TASK MODAL
  ------------------------------------------------------- */

  function closeTaskModal() {
    if (savingTask) return;

    setTaskModalOpen(false);
    setEditingTask(null);
  }

  /* -------------------------------------------------------
     SAVE TASK
  ------------------------------------------------------- */

  async function handleSaveTask(formData) {
    try {
      setSavingTask(true);
      setError("");

      /*
       * -----------------------------------------------------
       * EDIT EXISTING TASK
       * -----------------------------------------------------
       */

      if (editingTask) {
        const previousAssignee = editingTask.assigned_to || null;

        const newAssignee = formData.assignedTo || null;

        const updatedTask = await updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          assignedTo: newAssignee,
          dueDate: formData.dueDate,
        });

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTask.id
              ? {
                  ...task,
                  ...updatedTask,
                }
              : task,
          ),
        );

        /*
         * Notify only when the assignee changes.
         */
        if (newAssignee && newAssignee !== previousAssignee) {
          try {
            await createNotification({
              userId: newAssignee,
              projectId,
              taskId: editingTask.id,
              type: "task_assigned",
              title: "Task assigned to you",
              message: `You were assigned "${formData.title}".`,
            });
          } catch (notificationError) {
            console.error(
              "Task assignment notification error:",
              notificationError,
            );
          }
        }
      } else {

      /*
       * -----------------------------------------------------
       * CREATE NEW TASK
       * -----------------------------------------------------
       */
        const newTask = await createTask({
          projectId,

          title: formData.title,

          description: formData.description,

          priority: formData.priority,

          status: formData.status || defaultTaskStatus,

          assignedTo: formData.assignedTo,

          dueDate: formData.dueDate,
        });

        setTasks((currentTasks) => [...currentTasks, newTask]);

        /*
         * If the task was created with an assignee,
         * notify that person.
         */
        if (formData.assignedTo) {
          try {
            await createNotification({
              userId: formData.assignedTo,
              projectId,
              taskId: newTask.id,
              type: "task_assigned",
              title: "Task assigned to you",
              message: `You were assigned "${formData.title}".`,
            });
          } catch (notificationError) {
            console.error(
              "Task assignment notification error:",
              notificationError,
            );
          }
        }
      }

      setTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to save task.");

      throw err;
    } finally {
      setSavingTask(false);
    }
  }

  /* -------------------------------------------------------
     DELETE TASK
  ------------------------------------------------------- */

  async function handleDeleteTask(task) {
    const confirmed = window.confirm(`Delete "${task.title}"?`);

    if (!confirmed) return;

    try {
      setError("");

      await deleteTask(task.id);

      setTasks((currentTasks) =>
        currentTasks.filter((item) => item.id !== task.id),
      );
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to delete task.");
    }
  }

  /* -------------------------------------------------------
     DRAG START
  ------------------------------------------------------- */

  function handleDragStart(event) {
    const { active } = event;

    const task = tasks.find((item) => item.id === active.id);

    setActiveTask(task || null);
  }

  /* -------------------------------------------------------
     DRAG END
  ------------------------------------------------------- */

  async function handleDragEnd(event) {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const draggedTask = tasks.find((task) => task.id === active.id);

    if (!draggedTask) return;

    let targetStatus = draggedTask.status;

    /*
     * Dropped directly on a column
     */

    const targetColumn = columns.find((column) => column.id === over.id);

    if (targetColumn) {
      targetStatus = targetColumn.id;
    } else {

    /*
     * Dropped on another task
     */
      const targetTask = tasks.find((task) => task.id === over.id);

      if (targetTask) {
        targetStatus = targetTask.status;
      }
    }

    /*
     * Same column.
     */

    if (targetStatus === draggedTask.status) {
      return;
    }

    const oldStatus = draggedTask.status;

    /*
     * Get destination tasks.
     */

    const destinationTasks = groupedTasks[targetStatus] || [];

    /*
     * Put task at the bottom.
     */

    const newPosition =
      destinationTasks.length > 0
        ? Math.max(...destinationTasks.map((task) => task.position ?? 0)) + 1
        : 0;

    /*
     * Optimistic UI update.
     */

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === draggedTask.id
          ? {
              ...task,
              status: targetStatus,
              position: newPosition,
            }
          : task,
      ),
    );

    try {
      await updateTaskPosition(draggedTask.id, targetStatus, newPosition);
    } catch (err) {
      console.error("Failed to move task:", err);

      /*
       * Restore if database update fails.
       */

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === draggedTask.id
            ? {
                ...task,
                status: oldStatus,
                position: draggedTask.position,
              }
            : task,
        ),
      );

      setError(err?.message || "Unable to move the task.");
    }
  }

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-[#22c55e]" />

          <p className="mt-3 text-sm text-white/40">Loading project...</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     PROJECT NOT FOUND
  ------------------------------------------------------- */

  if (!project) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <FolderKanban size={36} className="mx-auto text-white/20" />

          <h2 className="mt-4 text-lg font-semibold text-white">
            Project not found
          </h2>

          <p className="mt-1 text-sm text-white/35">
            This project may have been deleted or you don't have access to it.
          </p>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="mt-5 rounded-lg bg-[#22c55e] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#16a34a]"
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     MAIN UI
  ------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* ===================================================
          PROJECT HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
            title="Back to projects"
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <FolderKanban size={17} className="text-[#22c55e]" />

              <span className="text-xs text-white/30">Project</span>
            </div>

            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">
              {project.name}
            </h1>

            {project.description && (
              <p className="mt-1 max-w-2xl text-sm text-white/40">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMembersModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <Users size={16} />
            Members
          </button>

          <button
            type="button"
            onClick={() => openCreateTask("todo")}
            className="inline-flex items-center gap-2 rounded-lg bg-[#22c55e] px-3 py-2 text-sm font-medium text-black transition hover:bg-[#16a34a]"
          >
            <Plus size={16} />
            Add task
          </button>
        </div>
      </div>

      {/* ===================================================
          PROJECT TEAM
      ================================================== */}

      <div className="rounded-xl border border-white/10 bg-[#0b100d]">
        {/* Team header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-xs font-semibold text-white">Team</h2>

            <p className="mt-1 text-[10px] text-white/30">
              People working on this project
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMembersModalOpen(true)}
            className="text-xs text-[#22c55e] transition hover:text-[#4ade80]"
          >
            Manage members
          </button>
        </div>

        {/* Members */}
        <div className="flex flex-wrap items-center gap-2 p-4">
          {members.length === 0 ? (
            <p className="text-xs text-white/25">No members found.</p>
          ) : (
            members.map((member) => {
              const name = member.profile?.full_name || "Unnamed user";

              const initial = name.charAt(0).toUpperCase();

              return (
                <div
                  key={member.user_id}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium ${
                      member.is_owner
                        ? "bg-[#22c55e]/10 text-[#22c55e]"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {initial}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-white">{name}</p>

                    <p
                      className={`text-[9px] ${
                        member.is_owner ? "text-[#22c55e]" : "text-white/30"
                      }`}
                    >
                      {member.is_owner ? "Owner" : "Member"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-xs text-red-400">{error}</p>

          <button
            type="button"
            onClick={() => {
              setError("");
              loadProject();
            }}
            className="text-xs text-red-300 underline underline-offset-2 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          BOARD HEADER
      ================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Task board</h2>

          <p className="mt-1 text-xs text-white/30">
            Drag tasks between columns to update their status.
          </p>
        </div>

        {taskLoading && (
          <Loader2 size={15} className="animate-spin text-white/30" />
        )}
      </div>

      {/* ===================================================
          KANBAN
      ================================================== */}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={groupedTasks[column.id] || []}
              onAddTask={openCreateTask}
              onEditTask={openEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        {/* Drag preview */}
        <DragOverlay>
          {activeTask ? (
            <div className="w-[280px]">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ===================================================
          TASK MODAL
      ================================================== */}

      {taskModalOpen && (
        <TaskModal
          task={
            editingTask
              ? editingTask
              : {
                  status: defaultTaskStatus,
                }
          }
          members={members}
          onClose={closeTaskModal}
          onSave={handleSaveTask}
          saving={savingTask}
        />
      )}

      {/* ===================================================
          MEMBERS MODAL
      ================================================== */}

      {membersModalOpen && (
        <MembersModal
          projectId={projectId}
          onClose={() => setMembersModalOpen(false)}
          onMembersChanged={handleMembersChanged}
        />
      )}
    </div>
  );
}
