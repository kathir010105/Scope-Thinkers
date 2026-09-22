import { supabase } from "../lib/supabase";

/*
|--------------------------------------------------------------------------
| GET TASKS FOR A PROJECT
|--------------------------------------------------------------------------
*/

export async function getProjectTasks(projectId) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("project_id", projectId)
    .order("position", {
      ascending: true,
    });

  if (error) {
    console.error("getProjectTasks error:", error);

    throw error;
  }

  return data || [];
}

/*
|--------------------------------------------------------------------------
| GET SINGLE TASK
|--------------------------------------------------------------------------
*/

export async function getTaskById(taskId) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("id", taskId)
    .single();

  if (error) {
    console.error("getTaskById error:", error);

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| CREATE TASK
|--------------------------------------------------------------------------
*/

export async function createTask({
  projectId,
  title,
  description = "",
  status = "todo",
  priority = "medium",
  assignedTo = null,
  dueDate = null,
}) {
  /*
   * Get current user
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to create a task.");
  }

  /*
   * Find the next position in the project
   */
  const { data: lastTask, error: positionError } = await supabase
    .from("tasks")
    .select("position")
    .eq("project_id", projectId)
    .order("position", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (positionError) {
    console.error("Position lookup error:", positionError);

    throw positionError;
  }

  const nextPosition = lastTask?.position != null ? lastTask.position + 1 : 0;

  /*
   * Create task
   */
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: title.trim(),
      description: description?.trim() || null,
      status,
      priority,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      position: nextPosition,
      created_by: user.id,
    })
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .single();

  if (error) {
    console.error("createTask error:", error);

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| UPDATE TASK
|--------------------------------------------------------------------------
*/

export async function updateTask(
  taskId,
  { title, description, status, priority, assignedTo, dueDate, position },
) {
  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) {
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description?.trim() || null;
  }

  if (status !== undefined) {
    updates.status = status;
  }

  if (priority !== undefined) {
    updates.priority = priority;
  }

  if (assignedTo !== undefined) {
    updates.assigned_to = assignedTo || null;
  }

  if (dueDate !== undefined) {
    updates.due_date = dueDate || null;
  }

  if (position !== undefined) {
    updates.position = position;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .single();

  if (error) {
    console.error("updateTask error:", error);

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| UPDATE TASK POSITION
|--------------------------------------------------------------------------
*/

export async function updateTaskPosition(taskId, status, position) {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("updateTaskPosition error:", error);

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| DELETE TASK
|--------------------------------------------------------------------------
*/

export async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("deleteTask error:", error);

    throw error;
  }

  return true;
}
