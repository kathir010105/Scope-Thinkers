import { supabase } from "../lib/supabase";

/*
|--------------------------------------------------------------------------
| GET PROJECTS
|--------------------------------------------------------------------------
*/

export async function getProjects({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("projects")
    .select("*", {
      count: "exact",
    })
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  /*
   * Server-side search
   */
  const searchTerm = search.trim().replace(/[%(),]/g, "");

  if (searchTerm) {
    query = query.or(
      `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
    );
  }

  /*
   * Status filter
   */
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("getProjects error:", error);

    throw error;
  }

  return {
    projects: data || [],
    total: count || 0,
  };
}

/*
|--------------------------------------------------------------------------
| GET SINGLE PROJECT
|--------------------------------------------------------------------------
*/

export async function getProjectById(projectId) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("getProjectById error:", error);

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| CREATE PROJECT
|--------------------------------------------------------------------------
*/

export async function createProject({ name, description, status = "active" }) {
  /*
   * Get currently authenticated user
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("You must be logged in to create a project.");
  }

  /*
   * Create project
   */
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      status,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("createProject error:", error);

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| UPDATE PROJECT
|--------------------------------------------------------------------------
*/

export async function updateProject(projectId, { name, description, status }) {
  const { data, error } = await supabase
    .from("projects")
    .update({
      name: name.trim(),
      description: description?.trim() || null,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    console.error("updateProject error:", error);

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| DELETE PROJECT
|--------------------------------------------------------------------------
*/

export async function deleteProject(projectId) {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("deleteProject error:", error);

    throw error;
  }

  return true;
}
