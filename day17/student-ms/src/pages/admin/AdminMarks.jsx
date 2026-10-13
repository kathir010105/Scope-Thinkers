import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  FileText,
  Download,
  MoreVertical,
  Building2,
  BookOpen,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  DataTable,
  LoadingState,
  EmptyState,
  ErrorState,
  StatCard,
  DepartmentBadge,
} from "../../components/common";

function AdminMarks() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [examTypes, setExamTypes] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [marksSnap, deptsSnap, coursesSnap, studentsSnap] = await Promise.all([
        getDocs(query(collection(db, "marks"), orderBy("date", "desc"))),
        getDocs(collection(db, "departments")),
        getDocs(collection(db, "courses")),
        getDocs(query(collection(db, "students"), where("status", "==", "active"))),
      ]);

      const marksData = marksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const deptsData = deptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const coursesData = coursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const studentsData = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Extract unique exam types
      const exams = [...new Set(marksData.map((m) => m.examType).filter(Boolean))];

      setRecords(marksData);
      setFilteredRecords(marksData);
      setDepartments(deptsData);
      setCourses(coursesData);
      setStudents(studentsData);
      setExamTypes(exams);
    } catch (err) {
      console.error("Failed to load marks:", err);
      setError("Unable to load marks records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...records];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.studentName?.toLowerCase().includes(s)) ||
          (r.studentId?.toLowerCase().includes(s)) ||
          (r.courseName?.toLowerCase().includes(s)) ||
          (r.examType?.toLowerCase().includes(s))
      );
    }
    if (deptFilter) result = result.filter((r) => r.departmentId === deptFilter);
    if (courseFilter) result = result.filter((r) => r.courseId === courseFilter);
    if (studentFilter) result = result.filter((r) => r.studentId === studentFilter);
    if (examFilter) result = result.filter((r) => r.examType === examFilter);
    setFilteredRecords(result);
  }, [records, search, deptFilter, courseFilter, studentFilter, examFilter]);

  // Calculate marks stats
  const totalRecords = records.length;
  const avgPercentage = totalRecords > 0
    ? Math.round(records.reduce((sum, r) => sum + (r.marks / r.maxMarks * 100), 0) / totalRecords)
    : 0;
  const passCount = records.filter((r) => (r.marks / r.maxMarks * 100) >= 40).length;
  const passRate = totalRecords > 0 ? Math.round((passCount / totalRecords) * 100) : 0;

  const columns = [
    { key: "date", header: "Date", render: (v) => <span className="text-xs text-[#8b7774]">{v ? new Date(v).toLocaleDateString("en-IN") : "—"}</span> },
    { key: "studentName", header: "Student", render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbc6b9] text-[#48252a]">
          <GraduationCap size={17} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#48252a]">{row.studentName || "Unknown"}</p>
          <p className="text-[10px] text-[#b29d96]">{row.studentId?.slice(0, 8)}...</p>
        </div>
      </div>
    )},
    { key: "courseName", header: "Course", render: (v, row) => (
      <div>
        <p className="text-xs font-medium text-[#48252a]">{row.courseName || "Unknown"}</p>
        <p className="text-[10px] text-[#b29d96]">{row.courseCode || row.courseId}</p>
      </div>
    )},
    { key: "department", header: "Department", render: (v) => <DepartmentBadge department={v || "—"} /> },
    { key: "examType", header: "Exam Type", render: (v) => <span className="text-xs font-medium text-[#48252a] capitalize">{v}</span> },
    { key: "marks", header: "Marks", render: (v, row) => (
      <div className="text-right">
        <p className="text-xs font-semibold text-[#48252a]">{v} / {row.maxMarks}</p>
        <p className="text-[10px] text-[#8b7774]">{row.maxMarks > 0 ? Math.round((v / row.maxMarks) * 100) : 0}%</p>
      </div>
    )},
    { key: "teacherName", header: "Entered By", render: (v) => <span className="text-xs text-[#8b7774]">{v || "—"}</span> },
    { key: "actions", header: "Actions", render: (v, row) => <span className="text-xs text-[#8b7774]">View</span> },
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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Marks Records</h1>
                <p className="mt-2 text-sm text-[#8b7774]">View and manage all marks records across the institution.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white">
                  <Download size={15} /> Export
                </button>
              </div>
            </div>

            {error && <ErrorState message={error} onRetry={fetchData} className="mb-5" />}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <StatCard title="Total Records" value={totalRecords} icon={FileText} accent="#e06464" />
              <StatCard title="Average Score" value={`${avgPercentage}%`} icon={TrendingUp} accent="#22c55e" />
              <StatCard title="Pass Rate" value={`${passRate}%`} icon={TrendingUp} accent="#48252a" />
              <StatCard title="Exam Types" value={examTypes.length} icon={FileText} accent="#f1745e" />
            </div>

            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
                <input
                  type="text"
                  placeholder="Search marks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>
              <FilterSelect value={deptFilter} onChange={setDeptFilter} options={[
                { value: "", label: "All Departments" },
                ...departments.map((d) => ({ value: d.id, label: d.name })),
              ]} placeholder="Department" className="w-48" />
              <FilterSelect value={courseFilter} onChange={setCourseFilter} options={[
                { value: "", label: "All Courses" },
                ...courses.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` })),
              ]} placeholder="Course" className="w-56" />
              <FilterSelect value={studentFilter} onChange={setStudentFilter} options={[
                { value: "", label: "All Students" },
                ...students.map((s) => ({ value: s.id, label: `${s.name} (${s.rollNo})` })),
              ]} placeholder="Student" className="w-56" />
              <FilterSelect value={examFilter} onChange={setExamFilter} options={[
                { value: "", label: "All Exam Types" },
                ...examTypes.map((e) => ({ value: e, label: e })),
              ]} placeholder="Exam Type" className="w-40" />
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredRecords.length === 0 ? (
              <EmptyState icon={FileText} title={search ? "No records found" : "No marks records"} description={search ? "Try a different search term." : "Marks records will appear here."} />
            ) : (
              <DataTable columns={columns} data={filteredRecords} rowKey="id" searchable={false} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminMarks;