import { supabase } from "../lib/supabase";

/*
 * Get notifications for the logged-in user.
 */
export async function getNotifications() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      user_id,
      project_id,
      task_id,
      type,
      title,
      message,
      is_read,
      created_at
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("getNotifications error:", error);
    throw error;
  }

  return data || [];
}

/*
 * Create a notification.
 */
export async function createNotification({
  userId,
  projectId = null,
  taskId = null,
  type,
  title,
  message = null,
}) {
  const { data, error } = await supabase.from("notifications").insert({
    user_id: userId,
    project_id: projectId,
    task_id: taskId,
    type,
    title,
    message,
  });

  if (error) {
    console.error("createNotification error:", error);
    throw error;
  }

  return data;
}

/*
 * Mark one notification as read.
 */
export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId);

  if (error) {
    console.error("markNotificationRead error:", error);
    throw error;
  }
}

/*
 * Mark all notifications as read.
 */
export async function markAllNotificationsRead() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("markAllNotificationsRead error:", error);
    throw error;
  }
}
