import { supabase } from "../lib/supabase";

export async function searchProjects(searchTerm) {
  const term = searchTerm.trim().replace(/[%(),]/g, "");

  if (!term) {
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      description,
      status,
      updated_at
    `,
    )
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .order("updated_at", {
      ascending: false,
    })
    .limit(5);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function searchTasks(searchTerm) {
  const term = searchTerm.trim().replace(/[%(),]/g, "");

  if (!term) {
    return [];
  }

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      id,
      project_id,
      title,
      description,
      status,
      priority,
      due_date,
      updated_at,
      projects (
        id,
        name
      )
    `,
    )
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    .order("updated_at", {
      ascending: false,
    })
    .limit(5);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function globalSearch(searchTerm) {
  const term = searchTerm.trim();

  if (!term) {
    return {
      projects: [],
      tasks: [],
    };
  }

  const [projects, tasks] = await Promise.all([
    searchProjects(term),
    searchTasks(term),
  ]);

  return {
    projects,
    tasks,
  };
}
