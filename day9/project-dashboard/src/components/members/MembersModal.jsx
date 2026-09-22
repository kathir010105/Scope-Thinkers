import { useEffect, useMemo, useState } from "react";

import {
  Search,
  UserPlus,
  Users,
  X,
  Loader2,
  Trash2,
  Crown,
} from "lucide-react";

import {
  addProjectMember,
  getAllProfiles,
  getProjectMembers,
  removeProjectMember,
} from "../../services/memberService";

export default function MembersModal({ projectId, onClose, onMembersChanged }) {
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [error, setError] = useState("");

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      const [membersData, profilesData] = await Promise.all([
        getProjectMembers(projectId),
        getAllProfiles(),
      ]);

      setMembers(membersData);
      setProfiles(profilesData);

      onMembersChanged?.(membersData);
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to load project members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  /*
   * Don't show existing members in the
   * "Add members" section.
   */
  const availableProfiles = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.user_id));

    const term = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      if (memberIds.has(profile.id)) {
        return false;
      }

      if (!term) {
        return true;
      }

      return profile.full_name?.toLowerCase().includes(term);
    });
  }, [profiles, members, search]);

  async function handleAddMember(profile) {
    try {
      setAdding(true);
      setError("");

      const newMember = await addProjectMember(projectId, profile.id);

      setMembers((current) => {
        const updated = [...current, newMember];

        onMembersChanged?.(updated);

        return updated;
      });

      setSearch("");
    } catch (err) {
      console.error(err);

      if (err?.code === "23505") {
        setError("This user is already a project member.");
      } else {
        setError(err?.message || "Unable to add member.");
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveMember(member) {
    /*
     * Owner cannot be removed.
     */
    if (member.is_owner) {
      return;
    }

    const name = member.profile?.full_name || "this member";

    const confirmed = window.confirm(`Remove ${name} from this project?`);

    if (!confirmed) return;

    try {
      setError("");

      await removeProjectMember(projectId, member.user_id);

      setMembers((current) => {
        const updated = current.filter(
          (item) => item.user_id !== member.user_id,
        );

        onMembersChanged?.(updated);

        return updated;
      });
    } catch (err) {
      console.error(err);

      setError(err?.message || "Unable to remove member.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b100d] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
              <Users size={18} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Project members
              </h2>

              <p className="mt-0.5 text-xs text-white/35">
                People working on this project.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-white/10 p-4">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 focus-within:border-[#22c55e]/40">
            <Search size={16} className="text-white/25" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search registered users..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={22} className="animate-spin text-[#22c55e]" />
            </div>
          ) : (
            <>
              {/* Current members */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                    Project members
                  </p>

                  <span className="text-[10px] text-white/25">
                    {members.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {members.map((member) => {
                    const name = member.profile?.full_name || "Unnamed user";

                    const initial = name.charAt(0).toUpperCase();

                    return (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                              member.is_owner
                                ? "bg-[#22c55e]/10 text-[#22c55e]"
                                : "bg-white/5 text-white/50"
                            }`}
                          >
                            {initial}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-white">{name}</p>

                              {member.is_owner && (
                                <Crown size={13} className="text-[#22c55e]" />
                              )}
                            </div>

                            <p
                              className={`text-[10px] capitalize ${
                                member.is_owner
                                  ? "text-[#22c55e]"
                                  : "text-white/30"
                              }`}
                            >
                              {member.is_owner ? "Owner" : "Member"}
                            </p>
                          </div>
                        </div>

                        {!member.is_owner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member)}
                            className="rounded-lg p-2 text-white/20 transition hover:bg-red-500/10 hover:text-red-400"
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add members */}
              <div className="mt-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                  Add members
                </p>

                <div className="space-y-2">
                  {availableProfiles.length === 0 ? (
                    <p className="py-5 text-center text-xs text-white/25">
                      No available users found.
                    </p>
                  ) : (
                    availableProfiles.slice(0, 10).map((profile) => {
                      const name = profile.full_name || "Unnamed user";

                      return (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2.5 transition hover:bg-white/[0.03]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-white/50">
                              {name.charAt(0).toUpperCase()}
                            </div>

                            <p className="text-sm text-white/70">{name}</p>
                          </div>

                          <button
                            type="button"
                            disabled={adding}
                            onClick={() => handleAddMember(profile)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#22c55e]/10 px-3 py-1.5 text-xs font-medium text-[#22c55e] transition hover:bg-[#22c55e]/20 disabled:opacity-40"
                          >
                            <UserPlus size={13} />
                            Add
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-white/10 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
