import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CalendarCheck,
  Calendar,
  Download,
  MoreVertical,
  Building2,
  BookOpen,
  GraduationCap,
  User,
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
  Modal,
  FormField,
  InputField,
  SelectField,
  DateField,
  SubmitButton,
  CancelButton,
  StatCard,
  StatusBadge,
  DepartmentBadge,
} from "../../components/common";

function AdminAttendance() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [attendanceSnap, deptsSnap, coursesSnap, studentsSnap] = await Promise.all([
        getDocs(query(collection(db, "attendance"), orderBy("date", "desc"))),
        getDocs(collection(db, "departments")),
        getDocs(collection(db, "courses")),
        getDocs(query(collection(db, "students"), where("status", "==", "active"))),
      ]);

      const attendanceData = attendanceSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const deptsData = deptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const coursesData = coursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const studentsData = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setRecords(attendanceData);
      setFilteredRecords(attendanceData);
      setDepartments(deptsData);
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Failed to load attendance:", err);
      setError("Unable to load attendance records.");
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
          (r.courseName?.toLowerCase().includes(s))
      );
    }
    if (dateFilter) result = result.filter((r) => r.date?.split("T")[0] === dateFilter);
    if (deptFilter) result = result.filter((r) => r.departmentId === deptFilter);
    if (courseFilter) result = result.filter((r) => r.courseId === courseFilter);
    if (studentFilter) result = result.filter((r) => r.studentId === studentFilter);
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    setFilteredRecords(result);
  }, [records, search, dateFilter, deptFilter, courseFilter, studentFilter, statusFilter]);

  // Calculate attendance stats
  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

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
    { key: "teacherName", header: "Recorded By", render: (v) => <span className="text-xs text-[#8b7774]">{v || "—"}</span> },
    { key: "status", header: "Status", render: (v) => (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${
        v === "present" ? "bg-emerald-50 text-emerald-600" :
        v === "absent" ? "bg-red-50 text-red-600" :
        v === "late" ? "bg-amber-50 text-amber-600" :
        "bg-slate-100 text-slate-500"
      }`}>
        {v?.charAt(0).toUpperCase() + v?.slice(1)}
      </span>
    )},
    { key: "actions", header: "Actions", render: (v, row) => (
      <span className="text-xs text-[#8b7774]">View</span>
    )},
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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Attendance Records</h1>
                <p className="mt-2 text-sm text-[#8b7774]">View and manage all attendance records across the institution.</p>
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
              <StatCard title="Total Records" value={totalRecords} icon={CalendarCheck} accent="#e06464" />
              <StatCard title="Present" value={presentCount} icon={CalendarCheck} accent="#22c55e" />
              <StatCard title="Absent" value={absentCount} icon={Calendar} accent="#ef4444" />
              <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={CalendarCheck} accent="#48252a" />
            </div>

            <div className="mb-5 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b29d96]" />
                <input
                  type="text"
                  placeholder="Search attendance..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#eadfd8] bg-[#fffaf7] py-3 pl-11 pr-4 text-sm text-[#48252a] outline-none placeholder:text-[#b29d96] focus:border-[#e06464]"
                />
              </div>
              <DateField label="" value={dateFilter} onChange={setDateFilter} placeholder="Filter by date" className="w-48" />
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
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={[
                { value: "", label: "All Status" },
                { value: "present", label: "Present" },
                { value: "absent", label: "Absent" },
                { value: "late", label: "Late" },
              ]} placeholder="Status" className="w-36" />
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredRecords.length === 0 ? (
              <EmptyState icon={CalendarCheck} title={search ? "No records found" : "No attendance records"} description={search ? "Try a different search term." : "Attendance records will appear here."} />
            ) : (
              <DataTable columns={columns} data={filteredRecords} rowKey="id" searchable={false} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminAttendance;