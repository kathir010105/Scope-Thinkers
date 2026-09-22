import { supabase } from "../lib/supabase";

export async function getDashboardData() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User is not authenticated.");

  const today = new Date().toISOString().split("T")[0];

  // --------------------------------------------------
  // PROJECTS
  // --------------------------------------------------

  const [
    totalProjectsResult,
    activeProjectsResult,
    completedProjectsResult,
    recentProjectsResult,
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),

    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),

    supabase
      .from("projects")
      .select(
        `
        id,
        name,
        description,
        status,
        created_at,
        updated_at
      `,
      )
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const projectErrors = [
    totalProjectsResult.error,
    activeProjectsResult.error,
    completedProjectsResult.error,
    recentProjectsResult.error,
  ].filter(Boolean);

  if (projectErrors.length > 0) {
    throw projectErrors[0];
  }

  // --------------------------------------------------
  // TASKS
  // --------------------------------------------------

  const [
    totalTasksResult,
    completedTasksResult,
    todoTasksResult,
    inProgressTasksResult,
    reviewTasksResult,
    overdueTasksResult,
    myTasksResult,
  ] = await Promise.all([
    supabase.from("tasks").select("*", { count: "exact", head: true }),

    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "done"),

    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "todo"),

    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress"),

    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "review"),

    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .lt("due_date", today)
      .neq("status", "done"),

    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", user.id)
      .neq("status", "done"),
  ]);

  const taskErrors = [
    totalTasksResult.error,
    completedTasksResult.error,
    todoTasksResult.error,
    inProgressTasksResult.error,
    reviewTasksResult.error,
    overdueTasksResult.error,
    myTasksResult.error,
  ].filter(Boolean);

  if (taskErrors.length > 0) {
    throw taskErrors[0];
  }

  // --------------------------------------------------
  // UPCOMING TASKS
  // --------------------------------------------------

  const { data: upcomingTasks, error: upcomingError } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      status,
      priority,
      due_date,
      project_id,
      projects (
        id,
        name
      )
    `,
    )
    .eq("assigned_to", user.id)
    .neq("status", "done")
    .not("due_date", "is", null)
    .gte("due_date", today)
    .order("due_date", { ascending: true })
    .limit(6);

  if (upcomingError) {
    throw upcomingError;
  }

  // --------------------------------------------------
  // RETURN DASHBOARD DATA
  // --------------------------------------------------

  return {
    stats: {
      totalProjects: totalProjectsResult.count || 0,
      activeProjects: activeProjectsResult.count || 0,
      completedProjects: completedProjectsResult.count || 0,

      totalTasks: totalTasksResult.count || 0,
      completedTasks: completedTasksResult.count || 0,
      todoTasks: todoTasksResult.count || 0,
      inProgressTasks: inProgressTasksResult.count || 0,
      reviewTasks: reviewTasksResult.count || 0,

      overdueTasks: overdueTasksResult.count || 0,
      myTasks: myTasksResult.count || 0,
    },

    recentProjects: recentProjectsResult.data || [],

    upcomingTasks: upcomingTasks || [],
  };
}
