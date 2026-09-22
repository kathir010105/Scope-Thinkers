import { supabase } from "../lib/supabase";
import { createNotification } from "./notificationService";

/*
 * Get owner + project members.
 */
export async function getProjectMembers(projectId) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      `
        id,
        owner_id,
        owner:profiles!projects_owner_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `,
    )
    .eq("id", projectId)
    .single();

  if (projectError) {
    console.error("getProjectMembers project error:", projectError);
    throw projectError;
  }

  const { data: memberRows, error: membersError } = await supabase
    .from("project_members")
    .select(
      `
        project_id,
        user_id,
        role,
        joined_at,
        profile:profiles(
          id,
          full_name,
          avatar_url
        )
      `,
    )
    .eq("project_id", projectId)
    .order("joined_at", {
      ascending: true,
    });

  if (membersError) {
    console.error("getProjectMembers members error:", membersError);
    throw membersError;
  }

  const owner = {
    project_id: projectId,
    user_id: project.owner_id,
    role: "owner",
    joined_at: null,
    profile: project.owner,
    is_owner: true,
  };

  const members = (memberRows || [])
    .filter((member) => member.user_id !== project.owner_id)
    .map((member) => ({
      ...member,
      is_owner: false,
    }));

  return [owner, ...members];
}

/*
 * Get all registered profiles.
 */
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url
    `,
    )
    .order("full_name", {
      ascending: true,
    });

  if (error) {
    console.error("getAllProfiles error:", error);
    throw error;
  }

  return data || [];
}

/*
 * Add project member.
 */
export async function addProjectMember(projectId, userId) {
  const { data, error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: userId,
      role: "member",
    })
    .select(
      `
      project_id,
      user_id,
      role,
      joined_at,
      profile:profiles(
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .single();

  if (error) {
    console.error("addProjectMember error:", error);
    throw error;
  }

  /*
   * Get project name for notification.
   */
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  /*
   * Create notification for the new member.
   *
   * We deliberately don't fail the member
   * addition if notification creation fails.
   */
  try {
    await createNotification({
      userId,
      projectId,
      type: "project_member_added",
      title: "Added to a project",
      message: `You were added to ${project?.name || "a project"}.`,
    });
  } catch (notificationError) {
    console.error("Member notification error:", notificationError);
  }

  return {
    ...data,
    is_owner: false,
  };
}

/*
 * Remove project member.
 */
export async function removeProjectMember(projectId, userId) {
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) {
    console.error("removeProjectMember error:", error);
    throw error;
  }

  return true;
}
