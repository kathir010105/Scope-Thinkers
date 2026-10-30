import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const STATUSES = [
  "submitted",
  "awaiting_assignment",
  "assigned",
  "visit_scheduled",
  "in_progress",
  "awaiting_customer",
  "resolved",
  "cancelled",
];

const STATUS_LABELS = {
  submitted: "Submitted",
  awaiting_assignment: "Awaiting assignment",
  assigned: "Assigned",
  visit_scheduled: "Visit scheduled",
  in_progress: "In progress",
  awaiting_customer: "Awaiting customer",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

const statusColors = {
  submitted: "bg-slate-100 text-slate-700",
  awaiting_assignment: "bg-amber-100 text-amber-800",
  assigned: "bg-blue-100 text-blue-800",
  visit_scheduled: "bg-violet-100 text-violet-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  awaiting_customer: "bg-orange-100 text-orange-800",
  resolved: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatDate(value) {
  if (!value) return "Not specified";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function displayName(profile) {
  return (
    profile?.full_name ||
    profile?.email ||
    "Unnamed user"
  );
}

function deviceName(request) {
  return [
    request.device_type === "mobile" ? "Mobile" : "Laptop",
    request.device_brand,
    request.device_model,
  ]
    .filter(Boolean)
    .join(" · ");
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusColors[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {STATUS_LABELS[status] || status || "Unknown"}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-[#ded7e8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#716b85]">{label}</p>
        <span className={`rounded-xl p-2 ${color}`}>
          <Icon size={19} />
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold text-[#412653]">
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentChoices, setAssignmentChoices] = useState({});
  const [assignmentNotes, setAssignmentNotes] = useState({});
  const [savingId, setSavingId] = useState(null);

  const technicianProfiles = useMemo(
    () => profiles.filter((profile) => profile.role === "technician"),
    [profiles]
  );

  const profileById = useMemo(
    () => new Map(profiles.map((profile) => [profile.id, profile])),
    [profiles]
  );

  const loadDashboard = useCallback(async (quiet = false) => {
    if (quiet) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [
        { data: requestData, error: requestError },
        { data: profileData, error: profileError },
      ] = await Promise.all([
        supabase
          .from("service_requests")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("profiles")
          .select("id, full_name, email, phone, role, created_at")
          .order("created_at", { ascending: false }),
      ]);

      if (requestError) throw requestError;
      if (profileError) throw profileError;

      setRequests(requestData || []);
      setProfiles(profileData || []);
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
      setError(
        err.message ||
          "Unable to load admin data. Check your admin role and Supabase policies."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const channel = supabase
      .channel("fixora-admin-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
        },
        () => loadDashboard(true)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => loadDashboard(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      unassigned: requests.filter(
        (request) =>
          !request.technician_id &&
          !["resolved", "cancelled"].includes(request.status)
      ).length,
      active: requests.filter((request) =>
        ["assigned", "visit_scheduled", "in_progress", "awaiting_customer"].includes(
          request.status
        )
      ).length,
      completed: requests.filter(
        (request) => request.status === "resolved"
      ).length,
    }),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      const customer = profileById.get(request.user_id);

      const searchableText = [
        request.id,
        request.description,
        request.category,
        request.device_type,
        request.device_brand,
        request.device_model,
        request.service_address,
        request.status,
        customer?.full_name,
        customer?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!query || searchableText.includes(query));
    });
  }, [requests, search, statusFilter, profileById]);

  async function handleAssign(request) {
    const technicianId = assignmentChoices[request.id];

    if (!technicianId) {
      setError("Select a technician before assigning this request.");
      return;
    }

    if (["resolved", "cancelled"].includes(request.status)) {
      setError("Closed requests cannot be assigned.");
      return;
    }

    setSavingId(request.id);
    setError("");
    setNotice("");

    try {
      const { data, error: assignmentError } = await supabase.rpc(
        "assign_service_request",
        {
          p_request_id: request.id,
          p_technician_id: technicianId,
          p_assignment_note: assignmentNotes[request.id] || null,
        }
      );

      if (assignmentError) throw assignmentError;

      // The database is the source of truth; reload its saved state.
      await loadDashboard(true);

      setNotice(
        `Repair ${String(request.id).slice(0, 8)} assigned successfully.`
      );

      setAssignmentChoices((current) => {
        const next = { ...current };
        delete next[request.id];
        return next;
      });

      setAssignmentNotes((current) => {
        const next = { ...current };
        delete next[request.id];
        return next;
      });
    } catch (err) {
      console.error("Technician assignment failed:", err);
      setError(err.message || "Assignment failed. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f1edf6] text-[#412653]">
      <header className="sticky top-0 z-30 border-b border-[#ded7e8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#d174d2] to-[#e0563f] text-white">
              <Wrench size={23} />
            </span>

            <div>
              <h1 className="text-lg font-extrabold">Fixora AI</h1>
              <p className="text-xs text-[#716b85]">
                Administration · Repair operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user.user_metadata?.full_name ||
                  user.email ||
                  "Administrator"}
              </p>
              <p className="text-xs text-[#716b85]">Administrator</p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ded7e8] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f1edf6] disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-[#412653] px-3 py-2 text-sm font-semibold text-white hover:bg-[#3F567F]"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-7 px-4 py-7 sm:px-7">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#412653] to-[#3F567F] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-white/65">
                OPERATIONS CONTROL
              </p>
              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                Repair assignment centre
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Review real customer requests, assign qualified technician
                accounts, and monitor repair progress from one dashboard.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <ShieldCheck size={30} />
              <div>
                <p className="font-bold">Live workspace</p>
                <p className="text-xs text-white/65">
                  Connected to Supabase
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="break-words">{error}</p>
            <button
              type="button"
              className="ml-auto font-bold"
              onClick={() => setError("")}
            >
              Dismiss
            </button>
          </div>
        )}

        {notice && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={19} />
            {notice}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="All repair requests"
            value={stats.total}
            icon={ClipboardList}
            color="bg-[#f1edf6] text-[#412653]"
          />
          <StatCard
            label="Need assignment"
            value={stats.unassigned}
            icon={AlertCircle}
            color="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="Active repairs"
            value={stats.active}
            icon={Activity}
            color="bg-blue-50 text-blue-700"
          />
          <StatCard
            label="Completed repairs"
            value={stats.completed}
            icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-700"
          />
        </section>

        <section className="rounded-3xl border border-[#ded7e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Technician directory</h3>
              <p className="mt-1 text-sm text-[#716b85]">
                Only accounts with the technician role can be assigned.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-[#f1edf6] px-3 py-2 text-sm font-semibold">
              <Users size={17} />
              {technicianProfiles.length} technician
              {technicianProfiles.length === 1 ? "" : "s"}
            </div>
          </div>

          {technicianProfiles.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#ded7e8] bg-[#faf8fc] p-6">
              <UserRound size={25} className="text-[#9a6aa5]" />
              <p className="mt-3 font-semibold">
                No technician accounts yet
              </p>
              <p className="mt-1 text-sm leading-6 text-[#716b85]">
                Create a real account through Supabase Authentication, then
                promote that account to the technician role using the admin
                setup process. It will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {technicianProfiles.map((technician) => {
                const assignedCount = requests.filter(
                  (request) =>
                    request.technician_id === technician.id &&
                    !["resolved", "cancelled"].includes(request.status)
                ).length;

                return (
                  <div
                    key={technician.id}
                    className="flex items-center gap-3 rounded-2xl border border-[#ded7e8] p-4"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f1edf6] text-[#412653]">
                      <Wrench size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {displayName(technician)}
                      </p>
                      <p className="truncate text-xs text-[#716b85]">
                        {technician.email || "No email on profile"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#9a6aa5]">
                        {assignedCount} active job
                        {assignedCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#ded7e8] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ded7e8] p-5 sm:p-6">
            <div>
              <h3 className="text-lg font-bold">All service requests</h3>
              <p className="mt-1 text-sm text-[#716b85]">
                Assign or reassign a technician for each open request.
              </p>
            </div>

            <span className="rounded-full bg-[#f1edf6] px-3 py-1.5 text-xs font-bold">
              {filteredRequests.length} request
              {filteredRequests.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-3 border-b border-[#ded7e8] p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-5">
            <label className="relative block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b829a]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, device, request, address..."
                className="w-full rounded-xl border border-[#ded7e8] bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#d174d2] focus:ring-2 focus:ring-[#d174d2]/20"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[#ded7e8] bg-white px-3 py-3 text-sm outline-none focus:border-[#d174d2]"
              aria-label="Filter requests by status"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid min-h-52 place-items-center p-8 text-sm text-[#716b85]">
              <div className="flex items-center gap-3">
                <LoaderCircle size={20} className="animate-spin" />
                Loading actual repair requests...
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-10 text-center">
              <ClipboardList
                size={32}
                className="mx-auto text-[#9a6aa5]"
              />
              <p className="mt-3 font-semibold">No matching requests</p>
              <p className="mt-1 text-sm text-[#716b85]">
                Try another search or status filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eee8f3]">
              {filteredRequests.map((request) => {
                const customer = profileById.get(request.user_id);
                const assignedTechnician = profileById.get(
                  request.technician_id
                );
                const selectedTechnician =
                  assignmentChoices[request.id] ??
                  request.technician_id ??
                  "";

                const closed = ["resolved", "cancelled"].includes(
                  request.status
                );

                return (
                  <article
                    key={request.id}
                    className="p-5 transition hover:bg-[#fdfbfe] sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all text-xs font-semibold text-[#9a6aa5]">
                          REQUEST · {request.id}
                        </p>
                        <h4 className="mt-2 text-base font-bold">
                          {deviceName(request)}
                        </h4>
                        <p className="mt-1 text-sm text-[#716b85]">
                          {request.category || "General repair"}
                        </p>
                      </div>

                      <StatusBadge status={request.status} />
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#51465f]">
                      {request.description}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-[#f8f5fa] p-3">
                        <p className="text-xs text-[#8b829a]">Customer</p>
                        <p className="mt-1 break-words font-semibold">
                          {displayName(customer)}
                        </p>
                        <p className="mt-1 break-all text-xs text-[#716b85]">
                          {customer?.email || "No email on profile"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f8f5fa] p-3">
                        <p className="text-xs text-[#8b829a]">
                          Service address
                        </p>
                        <p className="mt-1 break-words font-medium">
                          {request.service_address || "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f8f5fa] p-3">
                        <p className="text-xs text-[#8b829a]">
                          Preferred visit
                        </p>
                        <p className="mt-1 font-medium">
                          {formatDate(request.preferred_visit_at)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#f8f5fa] p-3">
                        <p className="text-xs text-[#8b829a]">
                          Created
                        </p>
                        <p className="mt-1 font-medium">
                          {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#ded7e8] bg-white p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-sm font-bold">
                          <UserRound size={17} />
                          Technician assignment
                        </p>

                        {assignedTechnician && (
                          <span className="text-xs text-emerald-700">
                            Currently assigned to{" "}
                            {displayName(assignedTechnician)}
                          </span>
                        )}
                      </div>

                      {closed ? (
                        <p className="text-sm text-[#716b85]">
                          This request is {request.status} and cannot be
                          assigned.
                        </p>
                      ) : technicianProfiles.length === 0 ? (
                        <p className="text-sm text-amber-800">
                          Create a technician account before assigning this
                          request.
                        </p>
                      ) : (
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                          <select
                            value={selectedTechnician}
                            onChange={(event) =>
                              setAssignmentChoices((current) => ({
                                ...current,
                                [request.id]: event.target.value,
                              }))
                            }
                            className="min-w-0 rounded-xl border border-[#ded7e8] bg-white px-3 py-3 text-sm outline-none focus:border-[#d174d2]"
                            aria-label={`Select technician for request ${request.id}`}
                          >
                            <option value="">Select technician...</option>
                            {technicianProfiles.map((technician) => (
                              <option
                                key={technician.id}
                                value={technician.id}
                              >
                                {displayName(technician)}
                                {technician.id === request.technician_id
                                  ? " (currently assigned)"
                                  : ""}
                              </option>
                            ))}
                          </select>

                          <input
                            value={assignmentNotes[request.id] || ""}
                            onChange={(event) =>
                              setAssignmentNotes((current) => ({
                                ...current,
                                [request.id]: event.target.value,
                              }))
                            }
                            maxLength={1000}
                            placeholder="Internal assignment note (optional)"
                            className="min-w-0 rounded-xl border border-[#ded7e8] px-3 py-3 text-sm outline-none focus:border-[#d174d2]"
                          />

                          <button
                            type="button"
                            onClick={() => handleAssign(request)}
                            disabled={
                              savingId === request.id ||
                              !selectedTechnician ||
                              selectedTechnician === request.technician_id
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#412653] to-[#3F567F] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {savingId === request.id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <ArrowRight size={17} />
                            )}
                            {request.technician_id ? "Reassign" : "Assign"}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 pb-4 text-xs text-[#716b85]">
          <span>Fixora AI · Admin operations</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live data from Supabase
          </span>
        </footer>
      </main>
    </div>
  );
}