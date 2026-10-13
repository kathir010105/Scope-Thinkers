import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  BookOpen,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  UserCog,
  Building2,
  Archive,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
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
  NumberField,
  TextareaField,
  SubmitButton,
  CancelButton,
  StatCard,
  DepartmentBadge,
  StatusBadge,
} from "../../components/common";

function AdminCourses() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [coursesSnap, deptsSnap, teachersSnap] = await Promise.all([
        getDocs(query(collection(db, "courses"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "departments")),
        getDocs(query(collection(db, "teachers"), where("status", "==", "active"))),
      ]);

      const coursesData = coursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const deptsData = deptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const teachersData = teachersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setCourses(coursesData);
      setFilteredCourses(coursesData);
      setDepartments(deptsData);
      setTeachers(teachersData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...courses];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name?.toLowerCase().includes(s)) ||
          (c.code?.toLowerCase().includes(s))
      );
    }
    if (deptFilter) result = result.filter((c) => c.departmentId === deptFilter);
    if (semesterFilter) result = result.filter((c) => c.semester === parseInt(semesterFilter));
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    setFilteredCourses(result);
  }, [courses, search, deptFilter, semesterFilter, statusFilter]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setCreating(true);
      const teacherIds = e.target.teacherIds.value
        ? e.target.teacherIds.value.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      await addDoc(collection(db, "courses"), {
        name: e.target.name.value.trim(),
        code: e.target.code.value.trim().toUpperCase(),
        departmentId: e.target.departmentId.value,
        department: departments.find(d => d.id === e.target.departmentId.value)?.name || "",
        semester: parseInt(e.target.semester.value),
        year: parseInt(e.target.year.value),
        credits: parseInt(e.target.credits.value),
        teacherIds,
        description: e.target.description.value.trim() || "",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setShowCreateModal(false);
      e.target.reset();
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setError("");
    try {
      setCreating(true);
      const teacherIds = e.target.teacherIds.value
        ? e.target.teacherIds.value.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      await updateDoc(doc(db, "courses", editingCourse.id), {
        name: e.target.name.value.trim(),
        code: e.target.code.value.trim().toUpperCase(),
        departmentId: e.target.departmentId.value,
        department: departments.find(d => d.id === e.target.departmentId.value)?.name || "",
        semester: parseInt(e.target.semester.value),
        year: parseInt(e.target.year.value),
        credits: parseInt(e.target.credits.value),
        teacherIds,
        description: e.target.description.value.trim() || "",
        status: e.target.status.value,
        updatedAt: new Date().toISOString(),
      });
      setShowEditModal(false);
      setEditingCourse(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to update course");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "courses", id));
      setDeleteConfirm(null);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const columns = [
    { key: "code", header: "Code", render: (v) => <span className="text-xs font-semibold text-[#e06464] uppercase">{v}</span> },
    { key: "name", header: "Course", render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9]/50 text-[#e06464]">
          <BookOpen size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#48252a]">{row.name}</p>
          <p className="text-[10px] text-[#b29d96]">{row.description || "No description"}</p>
        </div>
      </div>
    )},
    { key: "department", header: "Department", render: (v) => <DepartmentBadge department={v || "—"} /> },
    { key: "semester", header: "Semester", render: (v, row) => <span className="text-xs text-[#8b7774]">Sem {v} / Year {row.year}</span> },
    { key: "credits", header: "Credits", render: (v) => <span className="text-xs text-[#8b7774]">{v}</span> },
    { key: "teacherIds", header: "Teachers", render: (v) => (
      <span className="text-xs text-[#8b7774]">
        {(v && v.length > 0) ? v.map(id => teachers.find(t => t.id === id)?.name || id).join(", ") : "Unassigned"}
      </span>
    )},
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v} /> },
    {
      key: "actions",
      header: "Actions",
      render: (v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setEditingCourse(row); setShowEditModal(true); }}
            className="p-1.5 rounded-lg text-[#e06464] hover:bg-[#fbc6b9]/30 transition"
            title="Edit"
          ><Edit size={14} /></button>
          {row.status === "active" && (
            <button
              onClick={() => setDeleteConfirm(row)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
              title="Archive"
            ><Archive size={14} /></button>
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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Courses</h1>
                <p className="mt-2 text-sm text-[#8b7774]">Manage academic courses and assignments.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#e06464] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d65757] transition">
                  <Plus size={15} /> Add Course
                </button>
              </div>
            </div>

            {error && <ErrorState message={error} onRetry={fetchData} className="mb-5" />}

            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>
              <FilterSelect value={deptFilter} onChange={setDeptFilter} options={[
                { value: "", label: "All Departments" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]} placeholder="Department" className="w-48" />
              <FilterSelect value={semesterFilter} onChange={setSemesterFilter} options={[
                { value: "", label: "All Semesters" },
                { value: "1", label: "Sem 1" }, { value: "2", label: "Sem 2" }, { value: "3", label: "Sem 3" },
                { value: "4", label: "Sem 4" }, { value: "5", label: "Sem 5" }, { value: "6", label: "Sem 6" },
                { value: "7", label: "Sem 7" }, { value: "8", label: "Sem 8" },
              ]} placeholder="Semester" className="w-32" />
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
              ]} placeholder="Status" className="w-32" />
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredCourses.length === 0 ? (
              <EmptyState icon={BookOpen} title={search ? "No courses found" : "No courses yet"} description={search ? "Try a different search term." : "Create your first course to get started."} />
            ) : (
              <DataTable columns={columns} data={filteredCourses} rowKey="id" searchable={false} />
            )}
          </div>
        </main>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Course" size="max-w-2xl">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Course Name" name="name" required placeholder="e.g. Data Structures" />
            <InputField label="Course Code" name="code" required placeholder="e.g. CS301" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Department" name="departmentId" required options={departments.map((d) => ({ value: d.id, label: d.name }))} placeholder="Select department" />
            <NumberField label="Credits" name="credits" required min={1} max={6} defaultValue={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField label="Semester" name="semester" required min={1} max={8} defaultValue={1} />
            <NumberField label="Year" name="year" required min={1} max={4} defaultValue={1} />
          </div>
          <FormField label="Assigned Teachers (comma-separated IDs)" helpText="Enter teacher IDs separated by commas">
            <input
              name="teacherIds"
              value=""
              onChange={(e) => e.target.value}
              placeholder="e.g. TCH-123, TCH-456"
              className="h-12 w-full rounded-xl border border-[#eadfd8] bg-white pl-4 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b99f96] focus:border-[#e06464]"
            />
            <p className="mt-1 text-xs text-[#8b7774]">Available: {teachers.map(t => `${t.id} (${t.name})`).join(", ") || "None"}</p>
          </FormField>
          <TextareaField label="Description" name="description" placeholder="Course description" rows={3} />
          <FormActions>
            <CancelButton onClick={() => setShowCreateModal(false)} />
            <SubmitButton loading={creating}>Create Course</SubmitButton>
          </FormActions>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingCourse(null); }} title="Edit Course" size="max-w-2xl">
        {editingCourse && (
          <form onSubmit={handleEditCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Course Name" name="name" required defaultValue={editingCourse.name} />
              <InputField label="Course Code" name="code" required defaultValue={editingCourse.code} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Department" name="departmentId" required defaultValue={editingCourse.departmentId} options={departments.map((d) => ({ value: d.id, label: d.name }))} />
              <NumberField label="Credits" name="credits" required min={1} max={6} defaultValue={editingCourse.credits} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberField label="Semester" name="semester" required min={1} max={8} defaultValue={editingCourse.semester} />
              <NumberField label="Year" name="year" required min={1} max={4} defaultValue={editingCourse.year} />
            </div>
            <FormField label="Assigned Teachers (comma-separated IDs)">
              <input
                name="teacherIds"
                defaultValue={(editingCourse.teacherIds || []).join(", ")}
                onChange={(e) => e.target.value}
                placeholder="e.g. TCH-123, TCH-456"
                className="h-12 w-full rounded-xl border border-[#eadfd8] bg-white pl-4 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b99f96] focus:border-[#e06464]"
              />
            </FormField>
            <TextareaField label="Description" name="description" defaultValue={editingCourse.description} rows={3} />
            <SelectField label="Status" name="status" required defaultValue={editingCourse.status} options={[
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]} />
            <FormActions>
              <CancelButton onClick={() => { setShowEditModal(false); setEditingCourse(null); }} />
              <SubmitButton loading={creating}>Save Changes</SubmitButton>
            </FormActions>
          </form>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => handleDelete(deleteConfirm.id)} title="Archive Course" message={`Archive ${deleteConfirm?.name || "this course"}? It will no longer be available for new enrollments.`} confirmText="Archive" variant="warning" />
    </div>
  );
}

export default AdminCourses;