import { supabase } from "../lib/supabase";

export async function getMyTasks({
  search = "",
  status = "",
  priority = "",
} = {}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  let query = supabase
    .from("tasks")
    .select(
      `
      id,
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date,
      position,
      created_at,
      updated_at,
      projects (
        id,
        name
      )
    `,
    )
    .eq("assigned_to", user.id)
    .order("due_date", {
      ascending: true,
      nullsFirst: false,
    });

  // ---------------------------------------------
  // SEARCH
  // ---------------------------------------------

  const searchTerm = search.trim().replace(/[%(),]/g, "");

  if (searchTerm) {
    query = query.ilike("title", `%${searchTerm}%`);
  }

  // ---------------------------------------------
  // STATUS FILTER
  // ---------------------------------------------

  if (status) {
    query = query.eq("status", status);
  }

  // ---------------------------------------------
  // PRIORITY FILTER
  // ---------------------------------------------

  if (priority) {
    query = query.eq("priority", priority);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function updateMyTaskStatus(taskId, status) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("assigned_to", user.id)
    .select(
      `
      id,
      project_id,
      title,
      description,
      status,
      priority,
      assigned_to,
      due_date,
      position,
      created_at,
      updated_at,
      projects (
        id,
        name
      )
    `,
    )
    .single();

  if (error) throw error;

  return data;
}
