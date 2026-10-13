import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Users,
  GraduationCap,
  UserCog,
  ShieldCheck,
  UserX,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, updateDoc, doc, query, orderBy, where } from "firebase/firestore";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { apiAdminUsers, apiAdminRegistrationRequests } from "../../services/api";
import {
  DataTable,
  StatCard,
  LoadingState,
  EmptyState,
  ErrorState,
  Modal,
  ConfirmDialog,
  RoleBadge,
  StatusBadge,
  DepartmentBadge,
  FormField,
  InputField,
  SelectField,
  SubmitButton,
  CancelButton,
} from "../../components/common";

function AdminUsers() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activateConfirm, setActivateConfirm] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersSnap, deptsSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "departments")),
      ]);

      const usersData = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const deptsData = deptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setUsers(usersData);
      setFilteredUsers(usersData);
      setDepartments(deptsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (u) =>
          (u.name?.toLowerCase().includes(s)) ||
          (u.email?.toLowerCase().includes(s)) ||
          (u.uid?.toLowerCase().includes(s))
      );
    }
    if (roleFilter) result = result.filter((u) => u.role === roleFilter);
    if (statusFilter) result = result.filter((u) => u.status === statusFilter);
    if (deptFilter) result = result.filter((u) => u.departmentId === deptFilter);
    setFilteredUsers(result);
  }, [users, search, roleFilter, statusFilter, deptFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setCreating(true);
      await apiAdminUsers.create({
        email: e.target.email.value,
        password: e.target.password.value,
        name: e.target.name.value,
        role: e.target.role.value,
        department: e.target.department.value,
        departmentId: e.target.departmentId.value,
        phone: e.target.phone.value || "",
      });
      setShowCreateModal(false);
      e.target.reset();
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setError("");
    try {
      setCreating(true);
      const updates = {
        name: e.target.name.value,
        role: e.target.role.value,
        department: e.target.department.value,
        departmentId: e.target.departmentId.value,
        phone: e.target.phone.value || "",
        status: e.target.status.value,
      };
      await apiAdminUsers.update(editingUser.uid, updates);
      setShowEditModal(false);
      setEditingUser(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setCreating(false);
    }
  };

  const handleActivate = async (uid) => {
    try {
      await apiAdminUsers.activate(uid);
      setActivateConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to activate user");
    }
  };

  const handleDeactivate = async (uid) => {
    try {
      await apiAdminUsers.deactivate(uid);
      setDeactivateConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to deactivate user");
    }
  };

  const handleDelete = async (uid) => {
    try {
      await apiAdminUsers.delete(uid);
      setDeleteConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  };

  const columns = [
    { key: "name", header: "User", render: (v, row) => (
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
    { key: "role", header: "Role", render: (v) => <RoleBadge role={v} /> },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "department", header: "Department", render: (v) => <DepartmentBadge department={v || "—"} /> },
    { key: "createdAt", header: "Created", render: (v) => <span className="text-xs text-[#8b7774]">{v ? new Date(v).toLocaleDateString("en-IN") : "—"}</span> },
    {
      key: "actions",
      header: "Actions",
      render: (v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setEditingUser(row); setShowEditModal(true); }}
            className="p-1.5 rounded-lg text-[#e06464] hover:bg-[#fbc6b9]/30 transition"
            title="Edit"
          ><Edit size={14} /></button>
          {row.status === "approved" && row.uid !== profile?.uid && (
            <button
              onClick={() => setDeactivateConfirm(row)}
              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
              title="Deactivate"
            ><UserMinus size={14} /></button>
          )}
          {row.status === "inactive" && (
            <button
              onClick={() => setActivateConfirm(row)}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
              title="Activate"
            ><UserCheck size={14} /></button>
          )}
          {row.uid !== profile?.uid && (
            <button
              onClick={() => setDeleteConfirm(row)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
              title="Delete"
            ><Trash2 size={14} /></button>
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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">User Management</h1>
                <p className="mt-2 text-sm text-[#8b7774]">Manage all system users and their access.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#e06464] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d65757] transition">
                  <Plus size={15} /> Add User
                </button>
              </div>
            </div>

            {error && <ErrorState message={error} onRetry={fetchData} className="mb-5" />}

            <div className="mb-5 flex flex-wrap gap-3">
              <SearchInput value={search} onChange={setSearch} placeholder="Search users..." className="flex-1 min-w-[200px]" />
              <FilterSelect value={roleFilter} onChange={setRoleFilter} options={[
                { value: "", label: "All Roles" },
                { value: "admin", label: "Admin" },
                { value: "hod", label: "HOD" },
                { value: "teacher", label: "Teacher" },
                { value: "student", label: "Student" },
              ]} placeholder="Filter by Role" className="w-40" />
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[
                { value: "", label: "All Status" },
                { value: "approved", label: "Approved" },
                { value: "pending", label: "Pending" },
                { value: "rejected", label: "Rejected" },
                { value: "inactive", label: "Inactive" },
              ]} placeholder="Filter by Status" className="w-40" />
              <FilterSelect value={deptFilter} onChange={setDeptFilter} options={[
                { value: "", label: "All Departments" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]} placeholder="Filter by Dept" className="w-48" />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[#8b7774]">{filteredUsers.length} of {users.length} users</p>
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredUsers.length === 0 ? (
              <EmptyState icon={Users} title={search ? "No users found" : "No users yet"} description={search ? "Try a different search term." : "Create your first user to get started."} />
            ) : (
              <DataTable columns={columns} data={filteredUsers} rowKey="uid" searchable={false} />
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <InputField label="Full Name" name="name" required placeholder="Enter full name" />
          <InputField label="Email" name="email" type="email" required placeholder="user@college.com" />
          <InputField label="Password" name="password" type="password" required placeholder="Enter password" />
          <SelectField label="Role" name="role" required options={[
            { value: "admin", label: "Admin" },
            { value: "hod", label: "HOD" },
            { value: "teacher", label: "Teacher" },
            { value: "student", label: "Student" },
          ]} />
          <InputField label="Department" name="department" placeholder="Department name" />
          <SelectField label="Department ID" name="departmentId" options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="Select department" />
          <InputField label="Phone" name="phone" placeholder="Phone number" />
          <FormActions>
            <CancelButton onClick={() => setShowCreateModal(false)} />
            <SubmitButton loading={creating}>Create User</SubmitButton>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingUser(null); }} title="Edit User">
        {editingUser && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <InputField label="Full Name" name="name" required defaultValue={editingUser.name} />
            <SelectField label="Role" name="role" required defaultValue={editingUser.role} options={[
              { value: "admin", label: "Admin" },
              { value: "hod", label: "HOD" },
              { value: "teacher", label: "Teacher" },
              { value: "student", label: "Student" },
            ]} />
            <InputField label="Department" name="department" defaultValue={editingUser.department} />
            <SelectField label="Department ID" name="departmentId" defaultValue={editingUser.departmentId} options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="Select department" />
            <InputField label="Phone" name="phone" defaultValue={editingUser.phone} />
            <SelectField label="Status" name="status" required defaultValue={editingUser.status} options={[
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Rejected" },
              { value: "inactive", label: "Inactive" },
            ]} />
            <FormActions>
              <CancelButton onClick={() => { setShowEditModal(false); setEditingUser(null); }} />
              <SubmitButton loading={creating}>Save Changes</SubmitButton>
            </FormActions>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!activateConfirm}
        onClose={() => setActivateConfirm(null)}
        onConfirm={() => handleActivate(activateConfirm.uid)}
        title="Activate User"
        message={`Activate ${activateConfirm?.name || "this user"}? They will be able to access the system.`}
        confirmText="Activate"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={!!deactivateConfirm}
        onClose={() => setDeactivateConfirm(null)}
        onConfirm={() => handleDeactivate(deactivateConfirm.uid)}
        title="Deactivate User"
        message={`Deactivate ${deactivateConfirm?.name || "this user"}? They will lose access to the system.`}
        confirmText="Deactivate"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm.uid)}
        title="Delete User"
        message={`Permanently delete ${deleteConfirm?.name || "this user"}? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export default AdminUsers;