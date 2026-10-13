import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  UserCog,
  Edit,
  Trash2,
  MoreVertical,
  UserCheck,
  UserMinus,
  Building2,
  Mail,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { apiAdminUsers } from "../../services/api";
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
} from "../../components/common";

function AdminTeachers() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activateConfirm, setActivateConfirm] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [teachersSnap, deptsSnap] = await Promise.all([
        getDocs(query(collection(db, "teachers"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "departments")),
      ]);

      const teachersData = teachersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const deptsData = deptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setTeachers(teachersData);
      setFilteredTeachers(teachersData);
      setDepartments(deptsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Unable to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...teachers];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.name?.toLowerCase().includes(s)) ||
          (t.email?.toLowerCase().includes(s)) ||
          (t.employeeId?.toLowerCase().includes(s))
      );
    }
    if (deptFilter) result = result.filter((t) => t.departmentId === deptFilter);
    setFilteredTeachers(result);
  }, [teachers, search, deptFilter]);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setCreating(true);
      const uid = `TCH-${Date.now()}`;
      await updateDoc(doc(db, "teachers", uid), {
        uid,
        name: e.target.name.value,
        email: e.target.email.value,
        employeeId: e.target.employeeId.value.trim().toUpperCase(),
        departmentId: e.target.departmentId.value,
        department: departments.find(d => d.id === e.target.departmentId.value)?.name || "",
        designation: e.target.designation.value,
        phone: e.target.phone.value || "",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setShowCreateModal(false);
      e.target.reset();
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to create teacher");
    } finally {
      setCreating(false);
    }
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setError("");
    try {
      setCreating(true);
      await updateDoc(doc(db, "teachers", editingTeacher.id), {
        name: e.target.name.value,
        email: e.target.email.value,
        employeeId: e.target.employeeId.value.trim().toUpperCase(),
        departmentId: e.target.departmentId.value,
        department: departments.find(d => d.id === e.target.departmentId.value)?.name || "",
        designation: e.target.designation.value,
        phone: e.target.phone.value || "",
        status: e.target.status.value,
        updatedAt: new Date().toISOString(),
      });
      setShowEditModal(false);
      setEditingTeacher(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to update teacher");
    } finally {
      setCreating(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await updateDoc(doc(db, "teachers", id), { status: "active", updatedAt: new Date().toISOString() });
      setActivateConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to activate");
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await updateDoc(doc(db, "teachers", id), { status: "inactive", updatedAt: new Date().toISOString() });
      setDeactivateConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to deactivate");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "teachers", id));
      setDeleteConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const columns = [
    { key: "name", header: "Teacher", render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9] text-[#48252a]">
          <UserCog size={17} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#48252a]">{row.name || "Unnamed"}</p>
          <p className="text-[10px] text-[#b29d96]">{row.id}</p>
        </div>
      </div>
    )},
    { key: "employeeId", header: "Employee ID", render: (v) => <span className="text-xs font-medium text-[#48252a]">{v}</span> },
    { key: "email", header: "Email", render: (v) => <span className="text-xs text-[#8b7774] flex items-center gap-1"><Mail size={12} />{v}</span> },
    { key: "department", header: "Department", render: (v) => <DepartmentBadge department={v || "—"} /> },
    { key: "designation", header: "Designation", render: (v) => <span className="text-xs text-[#8b7774]">{v || "—"}</span> },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v} /> },
    {
      key: "actions",
      header: "Actions",
      render: (v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setEditingTeacher(row); setShowEditModal(true); }}
            className="p-1.5 rounded-lg text-[#e06464] hover:bg-[#fbc6b9]/30 transition"
            title="Edit"
          ><Edit size={14} /></button>
          {row.status === "active" && (
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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Teachers</h1>
                <p className="mt-2 text-sm text-[#8b7774]">Manage teacher academic profiles.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#e06464] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d65757] transition">
                  <Plus size={15} /> Add Teacher
                </button>
              </div>
            </div>

            {error && <ErrorState message={error} onRetry={fetchData} className="mb-5" />}

            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>
              <FilterSelect value={deptFilter} onChange={setDeptFilter} options={[
                { value: "", label: "All Departments" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]} placeholder="Department" className="w-48" />
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredTeachers.length === 0 ? (
              <EmptyState icon={UserCog} title={search ? "No teachers found" : "No teacher records"} description={search ? "Try a different search term." : "Add teacher academic profiles to get started."} />
            ) : (
              <DataTable columns={columns} data={filteredTeachers} rowKey="id" searchable={false} />
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add Teacher Profile">
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <InputField label="Full Name" name="name" required placeholder="Teacher name" />
          <InputField label="Email" name="email" type="email" required placeholder="teacher@college.com" />
          <InputField label="Employee ID" name="employeeId" required placeholder="e.g. EMP001" />
          <SelectField label="Department" name="departmentId" required options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="Select department" />
          <InputField label="Designation" name="designation" required placeholder="e.g. Assistant Professor" />
          <InputField label="Phone" name="phone" placeholder="Phone number" />
          <FormActions>
            <CancelButton onClick={() => setShowCreateModal(false)} />
            <SubmitButton loading={creating}>Create Teacher</SubmitButton>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingTeacher(null); }} title="Edit Teacher Profile">
        {editingTeacher && (
          <form onSubmit={handleEditTeacher} className="space-y-4">
            <InputField label="Full Name" name="name" required defaultValue={editingTeacher.name} />
            <InputField label="Email" name="email" type="email" required defaultValue={editingTeacher.email} />
            <InputField label="Employee ID" name="employeeId" required defaultValue={editingTeacher.employeeId} />
            <SelectField label="Department" name="departmentId" required defaultValue={editingTeacher.departmentId} options={departments.map((d) => ({ value: d.id, label: d.name }))} />
            <InputField label="Designation" name="designation" required defaultValue={editingTeacher.designation} />
            <InputField label="Phone" name="phone" defaultValue={editingTeacher.phone} />
            <SelectField label="Status" name="status" required defaultValue={editingTeacher.status} options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]} />
            <FormActions>
              <CancelButton onClick={() => { setShowEditModal(false); setEditingTeacher(null); }} />
              <SubmitButton loading={creating}>Save Changes</SubmitButton>
            </FormActions>
          </form>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!activateConfirm} onClose={() => setActivateConfirm(null)} onConfirm={() => handleActivate(activateConfirm.id)} title="Activate Teacher" message={`Activate ${activateConfirm?.name || "this teacher"}?`} confirmText="Activate" variant="primary" />
      <ConfirmDialog isOpen={!!deactivateConfirm} onClose={() => setDeactivateConfirm(null)} onConfirm={() => handleDeactivate(deactivateConfirm.id)} title="Deactivate Teacher" message={`Deactivate ${deactivateConfirm?.name || "this teacher"}?`} confirmText="Deactivate" variant="warning" />
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => handleDelete(deleteConfirm.id)} title="Delete Teacher" message={`Permanently delete ${deleteConfirm?.name || "this teacher"}? This cannot be undone.`} confirmText="Delete" variant="danger" />
    </div>
  );
}

export default AdminTeachers;