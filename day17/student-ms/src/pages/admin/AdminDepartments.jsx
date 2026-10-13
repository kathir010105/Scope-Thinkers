import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  RefreshCw,
  Loader2,
  Building2,
  Edit,
  Trash2,
  Users,
  BookOpen,
  UserCog,
  MoreVertical,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
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
  TextareaField,
  SelectField,
  SubmitButton,
  CancelButton,
  StatCard,
  DepartmentBadge,
} from "../../components/common";

function AdminDepartments() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const snapshot = await getDocs(query(collection(db, "departments"), orderBy("createdAt", "desc")));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDepartments(data);
      setFilteredDepartments(data);
    } catch (err) {
      console.error("Failed to load departments:", err);
      setError("Unable to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    let result = [...departments];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (d) =>
          (d.name?.toLowerCase().includes(s)) ||
          (d.code?.toLowerCase().includes(s))
      );
    }
    setFilteredDepartments(result);
  }, [departments, search]);

  const getDeptStats = async (deptId) => {
    try {
      const [studentsSnap, teachersSnap, coursesSnap] = await Promise.all([
        getDocs(query(collection(db, "students"), where("departmentId", "==", deptId))),
        getDocs(query(collection(db, "teachers"), where("departmentId", "==", deptId))),
        getDocs(query(collection(db, "courses"), where("departmentId", "==", deptId))),
      ]);
      return {
        students: studentsSnap.size,
        teachers: teachersSnap.size,
        courses: coursesSnap.size,
      };
    } catch {
      return { students: 0, teachers: 0, courses: 0 };
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setCreating(true);
      await addDoc(collection(db, "departments"), {
        name: e.target.name.value.trim(),
        code: e.target.code.value.trim().toUpperCase(),
        hodId: e.target.hodId.value || null,
        description: e.target.description.value.trim() || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setShowCreateModal(false);
      e.target.reset();
      await fetchDepartments();
    } catch (err) {
      setError(err.message || "Failed to create department");
    } finally {
      setCreating(false);
    }
  };

  const handleEditDept = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    setError("");
    try {
      setCreating(true);
      await updateDoc(doc(db, "departments", editingDept.id), {
        name: e.target.name.value.trim(),
        code: e.target.code.value.trim().toUpperCase(),
        hodId: e.target.hodId.value || null,
        description: e.target.description.value.trim() || "",
        updatedAt: new Date().toISOString(),
      });
      setShowEditModal(false);
      setEditingDept(null);
      await fetchDepartments();
    } catch (err) {
      setError(err.message || "Failed to update department");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "departments", id));
      setDeleteConfirm(null);
      await fetchDepartments();
    } catch (err) {
      setError(err.message || "Failed to delete department");
    }
  };

  const columns = [
    { key: "code", header: "Code", render: (v) => <span className="text-xs font-semibold text-[#e06464] uppercase">{v}</span> },
    { key: "name", header: "Department", render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9]/50 text-[#e06464]">
          <Building2 size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#48252a]">{row.name}</p>
          <p className="text-[10px] text-[#b29d96]">{row.description || "No description"}</p>
        </div>
      </div>
    )},
    { key: "hodId", header: "HOD", render: (v) => <span className="text-xs text-[#8b7774]">{v || "Not assigned"}</span> },
    { key: "createdAt", header: "Created", render: (v) => <span className="text-xs text-[#8b7774]">{v ? new Date(v).toLocaleDateString("en-IN") : "—"}</span> },
    {
      key: "actions",
      header: "Actions",
      render: (v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setEditingDept(row); setShowEditModal(true); }}
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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Departments</h1>
                <p className="mt-2 text-sm text-[#8b7774]">Manage academic departments and their settings.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchDepartments} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#e06464] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d65757] transition">
                  <Plus size={15} /> Add Department
                </button>
              </div>
            </div>

            {error && <ErrorState message={error} onRetry={fetchDepartments} className="mb-5" />}

            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard title="Total Departments" value={departments.length} icon={Building2} accent="#e06464" />
              <StatCard title="Total Students" value={departments.reduce((sum, d) => sum + (d.studentCount || 0), 0)} icon={Users} accent="#f1745e" />
              <StatCard title="Total Courses" value={departments.reduce((sum, d) => sum + (d.courseCount || 0), 0)} icon={BookOpen} accent="#48252a" />
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredDepartments.length === 0 ? (
              <EmptyState icon={Building2} title={search ? "No departments found" : "No departments yet"} description={search ? "Try a different search term." : "Create your first department to get started."} />
            ) : (
              <DataTable columns={columns} data={filteredDepartments} rowKey="id" searchable={false} />
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Department">
        <form onSubmit={handleCreateDept} className="space-y-4">
          <InputField label="Department Name" name="name" required placeholder="e.g. Computer Science and Engineering" />
          <InputField label="Department Code" name="code" required placeholder="e.g. CSE" helpText="Short unique code" />
          <TextareaField label="Description" name="description" placeholder="Brief description" rows={3} />
          <InputField label="HOD User ID (optional)" name="hodId" placeholder="Firebase UID of HOD" />
          <FormActions>
            <CancelButton onClick={() => setShowCreateModal(false)} />
            <SubmitButton loading={creating}>Create Department</SubmitButton>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingDept(null); }} title="Edit Department">
        {editingDept && (
          <form onSubmit={handleEditDept} className="space-y-4">
            <InputField label="Department Name" name="name" required defaultValue={editingDept.name} />
            <InputField label="Department Code" name="code" required defaultValue={editingDept.code} />
            <TextareaField label="Description" name="description" defaultValue={editingDept.description} rows={3} />
            <InputField label="HOD User ID (optional)" name="hodId" defaultValue={editingDept.hodId} placeholder="Firebase UID of HOD" />
            <FormActions>
              <CancelButton onClick={() => { setShowEditModal(false); setEditingDept(null); }} />
              <SubmitButton loading={creating}>Save Changes</SubmitButton>
            </FormActions>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Delete Department"
        message={`Permanently delete ${deleteConfirm?.name || "this department"}? This cannot be undone and may affect related records.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export default AdminDepartments;