import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  ShieldCheck,
  Mail,
  MapPin,
  Briefcase,
} from "lucide-react";

import { supabase } from "../services/supabase";

function KycDashboard() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  /*
   * Fetch KYC records from Supabase
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching KYC records:", error);

      setError(error.message || "Failed to fetch KYC records.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Fetch when dashboard loads
   */
  useEffect(() => {
    fetchUsers();
  }, []);

  /*
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const total = users.length;

    const pending = users.filter(
      (user) => user.kyc_status === "Pending",
    ).length;

    const approved = users.filter(
      (user) => user.kyc_status === "Approved",
    ).length;

    const rejected = users.filter(
      (user) => user.kyc_status === "Rejected",
    ).length;

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }, [users]);

  /*
   * Search + status filtering
   */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        user.full_name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.mobile?.includes(search);

      const matchesStatus =
        statusFilter === "All" || user.kyc_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#0a0f1c]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-wide sm:text-base">
                VERIFY
                <span className="text-blue-400">ID</span>
              </h1>

              <p className="text-[11px] text-slate-500">KYC Administration</p>
            </div>
          </div>
          <Link
            to="/register"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
          >
            New Application
          </Link>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        {/* PAGE TITLE */}

        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
            Administration
          </p>

          <h2 className="text-3xl font-bold tracking-tight">KYC Dashboard</h2>

          <p className="mt-2 text-sm text-slate-500">
            Review and monitor submitted KYC applications.
          </p>
        </div>

        {/* STATISTICS */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total applications"
            value={statistics.total}
            icon={Users}
          />

          <StatCard title="Pending" value={statistics.pending} icon={Clock3} />

          <StatCard
            title="Approved"
            value={statistics.approved}
            icon={CheckCircle2}
          />

          <StatCard
            title="Rejected"
            value={statistics.rejected}
            icon={XCircle}
          />
        </div>

        {/* FILTER BAR */}

        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-[#0d1321] p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, email or mobile..."
                className="w-full rounded-xl border border-slate-700/80 bg-[#080d17] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="cursor-pointer rounded-xl border border-slate-700/80 bg-[#080d17] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>

              <option value="Pending">Pending</option>

              <option value="Approved">Approved</option>

              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1321]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Applications</h3>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredUsers.length} records found
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Loading KYC records...
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                <Users className="h-5 w-5 text-slate-500" />
              </div>

              <p className="text-sm font-medium text-slate-300">
                No applications found
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                      Applicant
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                      Location
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                      Occupation
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d1321] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
    </div>
  );
}

/* =========================
   USER ROW
========================= */

function UserRow({ user }) {
  const statusStyles = {
    Pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",

    Approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

    Rejected: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  return (
    <tr className="border-b border-white/[0.04] transition hover:bg-blue-500/[0.04]">
      {/* APPLICANT */}

      <td className="px-6 py-5">
        <Link
          to={`/dashboard/${user.id}`}
          className="flex w-fit items-center gap-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-400">
            {user.full_name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-200 transition hover:text-blue-400">
              {user.full_name}
            </p>

            <p className="mt-1 text-xs text-slate-600">ID #{user.id}</p>
          </div>
        </Link>
      </td>

      {/* CONTACT */}

      <td className="px-6 py-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Mail className="h-3.5 w-3.5 text-slate-600" />

            {user.email}
          </div>

          <div className="text-xs text-slate-600">{user.mobile}</div>
        </div>
      </td>

      {/* LOCATION */}

      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5 text-slate-600" />
          {user.city}, {user.state}
        </div>
      </td>

      {/* OCCUPATION */}

      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Briefcase className="h-3.5 w-3.5 text-slate-600" />

          {user.occupation}
        </div>
      </td>

      {/* STATUS */}

      <td className="px-6 py-5">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${
            statusStyles[user.kyc_status] ||
            "border-slate-700 bg-slate-800 text-slate-400"
          }`}
        >
          {user.kyc_status}
        </span>
      </td>

      {/* DATE */}

      <td className="px-6 py-5">
        <span className="text-xs text-slate-500">
          {new Date(user.created_at).toLocaleDateString("en-IN")}
        </span>
      </td>
    </tr>
  );
}

export default KycDashboard;
