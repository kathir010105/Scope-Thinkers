import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Bell,
  Send,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  Users,
  Building2,
  User,
  Eye,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, writeBatch, serverTimestamp } from "firebase/firestore";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  DataTable,
  LoadingState,
  EmptyState,
  ErrorState,
  Modal,
  ConfirmDialog,
  FormField,
  InputField,
  SelectField,
  TextareaField,
  SubmitButton,
  CancelButton,
  StatCard,
  StatusBadge,
  DepartmentBadge,
  RoleBadge,
} from "../../components/common";

function AdminNotifications() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const snapshot = await getDocs(query(collection(db, "notifications"), orderBy("createdAt", "desc")));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
      setFilteredNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let result = [...notifications];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (n) =>
          (n.title?.toLowerCase().includes(s)) ||
          (n.message?.toLowerCase().includes(s))
      );
    }
    if (targetTypeFilter) result = result.filter((n) => n.targetType === targetTypeFilter);
    setFilteredNotifications(result);
  }, [notifications, search, targetTypeFilter]);

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setCreating(true);
      await addDoc(collection(db, "notifications"), {
        title: e.target.title.value.trim(),
        message: e.target.message.value.trim(),
        targetType: e.target.targetType.value,
        targetId: e.target.targetId.value || null,
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
        readBy: [],
      });
      setShowCreateModal(false);
      e.target.reset();
      await fetchNotifications();
    } catch (err) {
      setError(err.message || "Failed to create notification");
    } finally {
      setCreating(false);
    }
  };

  const handleEditNotification = async (e) => {
    e.preventDefault();
    if (!editingNotification) return;
    setError("");
    try {
      setCreating(true);
      await updateDoc(doc(db, "notifications", editingNotification.id), {
        title: e.target.title.value.trim(),
        message: e.target.message.value.trim(),
        targetType: e.target.targetType.value,
        targetId: e.target.targetId.value || null,
      });
      setShowEditModal(false);
      setEditingNotification(null);
      await fetchNotifications();
    } catch (err) {
      setError(err.message || "Failed to update notification");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      setDeleteConfirm(null);
      await fetchNotifications();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const batch = writeBatch(db);
      filteredNotifications.forEach((n) => {
        if (!n.readBy.includes(profile.uid)) {
          batch.update(doc(db, "notifications", n.id), {
            readBy: [...n.readBy, profile.uid],
          });
        }
      });
      await batch.commit();
      await fetchNotifications();
    } catch (err) {
      setError(err.message || "Failed to mark all as read");
    }
  };

  // Stats
  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter((n) => !n.readBy.includes(profile?.uid)).length;
  const byType = {
    all: notifications.filter((n) => n.targetType === "all").length,
    department: notifications.filter((n) => n.targetType === "department").length,
    role: notifications.filter((n) => n.targetType === "role").length,
    user: notifications.filter((n) => n.targetType === "user").length,
  };

  const columns = [
    { key: "title", header: "Title", render: (v, row) => (
      <div>
        <p className="text-xs font-semibold text-[#48252a]">{v}</p>
        <p className="text-[10px] text-[#8b7774] line-clamp-1">{row.message}</p>
      </div>
    )},
    { key: "targetType", header: "Target", render: (v) => {
      const icons = { all: Users, department: Building2, role: Target, user: User };
      const Icon = icons[v] || Bell;
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#fbc6b9]/50 text-[#48252a]">
          <Icon size={10} /> {v?.charAt(0).toUpperCase() + v?.slice(1)}
        </span>
      );
    }},
    { key: "targetId", header: "Target ID", render: (v, row) => {
      if (!v) return <span className="text-xs text-[#b29d96]">—</span>;
      if (row.targetType === "department") return <DepartmentBadge department={v} />;
      if (row.targetType === "role") return <RoleBadge role={v} />;
      return <span className="text-xs text-[#8b7774]">{v.slice(0, 8)}...</span>;
    }},
    { key: "createdAt", header: "Created", render: (v) => <span className="text-xs text-[#8b7774]">{v ? new Date(v).toLocaleString("en-IN") : "—"}</span> },
    { key: "readCount", header: "Read", render: (v, row) => (
      <span className="text-xs text-[#8b7774]">
        {(row.readBy?.length || 0)} / {row.targetType === "all" ? "All users" : "Targeted"}
      </span>
    )},
    {
      key: "actions",
      header: "Actions",
      render: (v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setEditingNotification(row); setShowEditModal(true); }}
            className="p-1.5 rounded-lg text-[#e06464] hover:bg-[#fbc6b9]/30 transition"
            title="Edit"
          ><Edit size={14} /></button>
          <button
            onClick={() => setDeleteConfirm(row)}
            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
            title="Delete"
          ><Trash2 size={14} /></button>
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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Notifications</h1>
                <p className="mt-2 text-sm text-[#8b7774]">Manage system-wide notifications and announcements.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchNotifications} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#e06464] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d65757] transition">
                  <Plus size={15} /> Send Notification
                </button>
              </div>
            </div>

            {error && <ErrorState message={error} onRetry={fetchNotifications} className="mb-5" />}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <StatCard title="Total Sent" value={totalNotifications} icon={Bell} accent="#e06464" />
              <StatCard title="Unread (You)" value={unreadCount} icon={Bell} accent="#f1745e" />
              <StatCard title="By Department" value={byType.department} icon={Building2} accent="#e6a07f" />
              <StatCard title="By Role" value={byType.role} icon={Target} accent="#48252a" />
            </div>

            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>
              <FilterSelect value={targetTypeFilter} onChange={setTargetTypeFilter} options={[
                { value: "", label: "All Targets" },
                { value: "all", label: "All Users" },
                { value: "department", label: "Department" },
                { value: "role", label: "Role" },
                { value: "user", label: "Specific User" },
              ]} placeholder="Target Type" className="w-40" />
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white"
                >
                  <Eye size={15} /> Mark All Read
                </button>
              )}
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredNotifications.length === 0 ? (
              <EmptyState icon={Bell} title={search ? "No notifications found" : "No notifications sent"} description={search ? "Try a different search term." : "Create your first notification to get started."} />
            ) : (
              <DataTable columns={columns} data={filteredNotifications} rowKey="id" searchable={false} />
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Send Notification" size="max-w-xl">
        <form onSubmit={handleCreateNotification} className="space-y-4">
          <InputField label="Title" name="title" required placeholder="Notification title" />
          <TextareaField label="Message" name="message" required placeholder="Notification message" rows={4} />
          <SelectField label="Target Audience" name="targetType" required options={[
            { value: "all", label: "All Users" },
            { value: "department", label: "Specific Department" },
            { value: "role", label: "Specific Role" },
            { value: "user", label: "Specific User" },
          ]} />
          <InputField
            label="Target ID"
            name="targetId"
            placeholder={[
              { value: "all", label: "Not required" },
              { value: "department", label: "Department ID (e.g. dept-cse)" },
              { value: "role", label: "Role (admin/hod/teacher/student)" },
              { value: "user", label: "User UID" },
            ].find((t) => t.value === (document.querySelector('select[name="targetType"]')?.value || "all"))?.label || "Target identifier"}
          />
          <FormActions>
            <CancelButton onClick={() => setShowCreateModal(false)} />
            <SubmitButton loading={creating}>Send Notification</SubmitButton>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingNotification(null); }} title="Edit Notification" size="max-w-xl">
        {editingNotification && (
          <form onSubmit={handleEditNotification} className="space-y-4">
            <InputField label="Title" name="title" required defaultValue={editingNotification.title} />
            <TextareaField label="Message" name="message" required defaultValue={editingNotification.message} rows={4} />
            <SelectField label="Target Audience" name="targetType" required defaultValue={editingNotification.targetType} options={[
              { value: "all", label: "All Users" },
              { value: "department", label: "Specific Department" },
              { value: "role", label: "Specific Role" },
              { value: "user", label: "Specific User" },
            ]} />
            <InputField label="Target ID" name="targetId" defaultValue={editingNotification.targetId} />
            <FormActions>
              <CancelButton onClick={() => { setShowEditModal(false); setEditingNotification(null); }} />
              <SubmitButton loading={creating}>Save Changes</SubmitButton>
            </FormActions>
          </form>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => handleDelete(deleteConfirm.id)} title="Delete Notification" message={`Permanently delete "${deleteConfirm?.title || "this notification"}"?`} confirmText="Delete" variant="danger" />
    </div>
  );
}

export default AdminNotifications;