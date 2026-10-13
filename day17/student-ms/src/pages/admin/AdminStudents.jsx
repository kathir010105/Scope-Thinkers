import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  GraduationCap,
  Edit,
  Trash2,
  MoreVertical,
  UserCheck,
  UserMinus,
  Building2,
  Mail,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
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
  NumberField,
  SubmitButton,
  CancelButton,
  StatCard,
  StatusBadge,
  DepartmentBadge,
} from "../../components/common";

function AdminStudents() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activateConfirm, setActivateConfirm] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsSnap, deptsSnap] = await Promise.all([
        getDocs(query(collection(db, "students"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "departments")),
      ]);

      const studentsData = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const deptsData = deptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setStudents(studentsData);
      setFilteredStudents(studentsData);
      setDepartments(deptsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...students];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (s) =>
          (s.name?.toLowerCase().includes(s)) ||
          (s.email?.toLowerCase().includes(s)) ||
          (s.rollNo?.toLowerCase().includes(s))
      );
    }
    if (deptFilter) result = result.filter((s) => s.departmentId === deptFilter);
    if (yearFilter) result = result.filter((s) => s.year === parseInt(yearFilter));
    if (semesterFilter) result = result.filter((s) => s.semester === parseInt(semesterFilter));
    setFilteredStudents(result);
  }, [students, search, deptFilter, yearFilter, semesterFilter]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setCreating(true);
      const uid = `STU-${Date.now()}`;
      await updateDoc(doc(db, "students", uid), {
        ...e.target,
        uid,
        rollNo: e.target.rollNo.value.trim().toUpperCase(),
        department: departments.find(d => d.id === e.target.departmentId.value)?.name || "",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setShowCreateModal(false);
      e.target.reset();
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to create student");
    } finally {
      setCreating(false);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setError("");
    try {
      setCreating(true);
      await updateDoc(doc(db, "students", editingStudent.id), {
        name: e.target.name.value,
        rollNo: e.target.rollNo.value.trim().toUpperCase(),
        email: e.target.email.value,
        departmentId: e.target.departmentId.value,
        department: departments.find(d => d.id === e.target.departmentId.value)?.name || "",
        year: parseInt(e.target.year.value),
        semester: parseInt(e.target.semester.value),
        section: e.target.section.value,
        phone: e.target.phone.value,
        status: e.target.status.value,
        updatedAt: new Date().toISOString(),
      });
      setShowEditModal(false);
      setEditingStudent(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to update student");
    } finally {
      setCreating(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await updateDoc(doc(db, "students", id), { status: "active", updatedAt: new Date().toISOString() });
      setActivateConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to activate");
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await updateDoc(doc(db, "students", id), { status: "inactive", updatedAt: new Date().toISOString() });
      setDeactivateConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to deactivate");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "students", id));
      setDeleteConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const columns = [
    { key: "name", header: "Student", render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9] text-[#48252a]">
          <GraduationCap size={17} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#48252a]">{row.name || "Unnamed"}</p>
          <p className="text-[10px] text-[#b29d96]">{row.id}</p>
        </div>
      </div>
    )},
    { key: "rollNo", header: "Roll No", render: (v) => <span className="text-xs font-medium text-[#48252a]">{v}</span> },
    { key: "email", header: "Email", render: (v) => <span className="text-xs text-[#8b7774] flex items-center gap-1"><Mail size={12} />{v}</span> },
    { key: "department", header: "Department", render: (v) => <DepartmentBadge department={v || "—"} /> },
    { key: "year", header: "Year", render: (v) => <span className="text-xs text-[#8b7774]">Year {v}</span> },
    { key: "semester", header: "Semester", render: (v) => <span className="text-xs text-[#8b7774]">Sem {v}</span> },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v} /> },
    {
      key: "actions",
      header: "Actions",
      render: (v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setEditingStudent(row); setShowEditModal(true); }}
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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Students</h1>
                <p className="mt-2 text-sm text-[#8b7774]">Manage student academic profiles.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#e06464] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d65757] transition">
                  <Plus size={15} /> Add Student
                </button>
              </div>
            </div>

            {error && <ErrorState message={error} onRetry={fetchData} className="mb-5" />}

            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>
              <FilterSelect value={deptFilter} onChange={setDeptFilter} options={[
                { value: "", label: "All Departments" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]} placeholder="Department" className="w-48" />
              <FilterSelect value={yearFilter} onChange={setYearFilter} options={[
                { value: "", label: "All Years" },
                { value: "1", label: "Year 1" },
                { value: "2", label: "Year 2" },
                { value: "3", label: "Year 3" },
                { value: "4", label: "Year 4" },
              ]} placeholder="Year" className="w-32" />
              <FilterSelect value={semesterFilter} onChange={setSemesterFilter} options={[
                { value: "", label: "All Semesters" },
                { value: "1", label: "Sem 1" },
                { value: "2", label: "Sem 2" },
                { value: "3", label: "Sem 3" },
                { value: "4", label: "Sem 4" },
                { value: "5", label: "Sem 5" },
                { value: "6", label: "Sem 6" },
                { value: "7", label: "Sem 7" },
                { value: "8", label: "Sem 8" },
              ]} placeholder="Semester" className="w-32" />
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredStudents.length === 0 ? (
              <EmptyState icon={GraduationCap} title={search ? "No students found" : "No student records"} description={search ? "Try a different search term." : "Add student academic profiles to get started."} />
            ) : (
              <DataTable columns={columns} data={filteredStudents} rowKey="id" searchable={false} />
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add Student Profile">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <InputField label="Full Name" name="name" required placeholder="Student name" />
          <InputField label="Roll Number" name="rollNo" required placeholder="e.g. CS2024001" />
          <InputField label="Email" name="email" type="email" required placeholder="student@college.com" />
          <SelectField label="Department" name="departmentId" required options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="Select department" />
          <NumberField label="Year" name="year" required min={1} max={4} defaultValue={1} />
          <NumberField label="Semester" name="semester" required min={1} max={8} defaultValue={1} />
          <InputField label="Section" name="section" placeholder="e.g. A" />
          <InputField label="Phone" name="phone" placeholder="Phone number" />
          <FormActions>
            <CancelButton onClick={() => setShowCreateModal(false)} />
            <SubmitButton loading={creating}>Create Student</SubmitButton>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingStudent(null); }} title="Edit Student Profile">
        {editingStudent && (
          <form onSubmit={handleEditStudent} className="space-y-4">
            <InputField label="Full Name" name="name" required defaultValue={editingStudent.name} />
            <InputField label="Roll Number" name="rollNo" required defaultValue={editingStudent.rollNo} />
            <InputField label="Email" name="email" type="email" required defaultValue={editingStudent.email} />
            <SelectField label="Department" name="departmentId" required defaultValue={editingStudent.departmentId} options={departments.map((d) => ({ value: d.id, label: d.name }))} />
            <NumberField label="Year" name="year" required min={1} max={4} defaultValue={editingStudent.year} />
            <NumberField label="Semester" name="semester" required min={1} max={8} defaultValue={editingStudent.semester} />
            <InputField label="Section" name="section" defaultValue={editingStudent.section} />
            <InputField label="Phone" name="phone" defaultValue={editingStudent.phone} />
            <SelectField label="Status" name="status" required defaultValue={editingStudent.status} options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]} />
            <FormActions>
              <CancelButton onClick={() => { setShowEditModal(false); setEditingStudent(null); }} />
              <SubmitButton loading={creating}>Save Changes</SubmitButton>
            </FormActions>
          </form>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!activateConfirm} onClose={() => setActivateConfirm(null)} onConfirm={() => handleActivate(activateConfirm.id)} title="Activate Student" message={`Activate ${activateConfirm?.name || "this student"}?`} confirmText="Activate" variant="primary" />
      <ConfirmDialog isOpen={!!deactivateConfirm} onClose={() => setDeactivateConfirm(null)} onConfirm={() => handleDeactivate(deactivateConfirm.id)} title="Deactivate Student" message={`Deactivate ${deactivateConfirm?.name || "this student"}?`} confirmText="Deactivate" variant="warning" />
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => handleDelete(deleteConfirm.id)} title="Delete Student" message={`Permanently delete ${deleteConfirm?.name || "this student"}? This cannot be undone.`} confirmText="Delete" variant="danger" />
    </div>
  );
}

export default AdminStudents;