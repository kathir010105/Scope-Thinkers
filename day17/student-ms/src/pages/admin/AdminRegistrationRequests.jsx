import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Users,
  Check,
  X,
  Eye,
  ShieldCheck,
  Ban,
  Loader2 as LoaderIcon,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { apiAdminRegistrationRequests } from "../../services/api";
import {
  DataTable,
  LoadingState,
  EmptyState,
  ErrorState,
  Modal,
  RoleBadge,
  StatusBadge,
  DepartmentBadge,
} from "../../components/common";

function AdminRegistrationRequests() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [viewingRequest, setViewingRequest] = useState(null);
  const [processing, setProcessing] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const q = query(
        collection(db, "users"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setFilteredRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setError("Unable to load registration requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let result = [...requests];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.name?.toLowerCase().includes(s)) ||
          (r.email?.toLowerCase().includes(s)) ||
          (r.uid?.toLowerCase().includes(s))
      );
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    setFilteredRequests(result);
  }, [requests, search, statusFilter]);

  const handleApprove = async (uid) => {
    try {
      setProcessing(uid);
      await apiAdminRegistrationRequests.approve(uid);
      await fetchRequests();
    } catch (err) {
      setError(err.message || "Failed to approve request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (uid) => {
    try {
      setProcessing(uid);
      await apiAdminRegistrationRequests.reject(uid);
      await fetchRequests();
    } catch (err) {
      setError(err.message || "Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9] text-[#48252a]">
          <Users size={17} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#48252a]">{row.name || "Unnamed"}</p>
          <p className="text-[10px] text-[#b29d96]">{row.uid?.slice(0, 8)}...</p>
        </div>
      </div>
    )},
    { key: "email", header: "Email", render: (v) => <span className="text-xs text-[#8b7774]">{v}</span> },
    { key: "role", header: "Requested Role", render: (v) => <RoleBadge role={v} /> },
    { key: "department", header: "Department", render: (v) => <DepartmentBadge department={v || "—"} /> },
    { key: "createdAt", header: "Requested", render: (v) => <span className="text-xs text-[#8b7774]">{v ? new Date(v).toLocaleString("en-IN") : "—"}</span> },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v} /> },
    {
      key: "actions",
      header: "Actions",
      render: (v, row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === "pending" && (
            <>
              <button
                onClick={() => handleApprove(row.uid)}
                disabled={processing === row.uid}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-medium transition disabled:opacity-50"
              >
                {processing === row.uid ? <LoaderIcon size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleReject(row.uid)}
                disabled={processing === row.uid}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition disabled:opacity-50"
              >
                {processing === row.uid ? <LoaderIcon size={14} className="animate-spin" /> : <X size={14} />}
                <span>Reject</span>
              </button>
            </>
          )}
          {row.status !== "pending" && (
            <span className="text-xs text-[#8b7774]">Processed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#f8f2ee]">
      <AdminSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] p-5 lg:p-8">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e06464]">Administration</p>
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Registration Requests</h1>
                <p className="mt-2 text-sm text-[#8b7774]">Review and approve pending user registrations.</p>
              </div>
              <button onClick={fetchRequests} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            {error && <ErrorState message={error} onRetry={fetchRequests} className="mb-5" />}

            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-4 pr-10 text-sm text-[#48252a] outline-none focus:border-[#e06464] appearance-none"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredRequests.length === 0 ? (
              <EmptyState icon={Users} title={search ? "No requests found" : "No pending requests"} description={search ? "Try a different search term." : "All registration requests have been processed."} />
            ) : (
              <DataTable columns={columns} data={filteredRequests} rowKey="uid" searchable={false} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminRegistrationRequests;