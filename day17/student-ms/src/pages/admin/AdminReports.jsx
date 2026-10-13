import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  RefreshCw,
  Loader2,
  Download,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  CalendarCheck,
  FileText,
  Building2,
  TrendingUp,
  PieChart,
  BarChart3,
} from "lucide-react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  StatCard,
  LoadingState,
  Panel,
  DepartmentBadge,
  ProgressItem,
} from "../../components/common";

function AdminReports() {
  const { profile } = useSelector((state) => state.auth);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState({
    departments: [],
    studentsByDept: {},
    teachersByDept: {},
    coursesByDept: {},
    attendanceByDept: {},
    marksByDept: {},
    attendanceRate: 0,
    passRate: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalDepartments: 0,
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        deptsSnap,
        studentsSnap,
        teachersSnap,
        coursesSnap,
        attendanceSnap,
        marksSnap,
      ] = await Promise.all([
        getDocs(collection(db, "departments")),
        getDocs(query(collection(db, "students"), where("status", "==", "active"))),
        getDocs(query(collection(db, "teachers"), where("status", "==", "active"))),
        getDocs(query(collection(db, "courses"), where("status", "==", "active"))),
        getDocs(collection(db, "attendance")),
        getDocs(collection(db, "marks")),
      ]);

      const departments = deptsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const students = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const teachers = teachersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const courses = coursesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const attendance = attendanceSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const marks = marksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Calculate per-department stats
      const studentsByDept = {};
      const teachersByDept = {};
      const coursesByDept = {};
      const attendanceByDept = {};
      const marksByDept = {};

      departments.forEach((dept) => {
        const deptStudents = students.filter((s) => s.departmentId === dept.id);
        const deptTeachers = teachers.filter((t) => t.departmentId === dept.id);
        const deptCourses = courses.filter((c) => c.departmentId === dept.id);
        const deptAttendance = attendance.filter((a) => a.departmentId === dept.id);
        const deptMarks = marks.filter((m) => m.departmentId === dept.id);

        studentsByDept[dept.id] = deptStudents.length;
        teachersByDept[dept.id] = deptTeachers.length;
        coursesByDept[dept.id] = deptCourses.length;

        // Attendance rate for department
        const presentCount = deptAttendance.filter((a) => a.status === "present" || a.status === "late").length;
        attendanceByDept[dept.id] = deptAttendance.length > 0
          ? Math.round((presentCount / deptAttendance.length) * 100)
          : 0;

        // Pass rate for department
        const passed = deptMarks.filter((m) => (m.marks / m.maxMarks * 100) >= 40).length;
        marksByDept[dept.id] = deptMarks.length > 0
          ? Math.round((passed / deptMarks.length) * 100)
          : 0;
      });

      // Overall stats
      const totalAttendance = attendance.length;
      const totalPresent = attendance.filter((a) => a.status === "present" || a.status === "late").length;
      const overallAttendanceRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

      const totalMarks = marks.length;
      const totalPassed = marks.filter((m) => (m.marks / m.maxMarks * 100) >= 40).length;
      const overallPassRate = totalMarks > 0 ? Math.round((totalPassed / totalMarks) * 100) : 0;

      setReportData({
        departments,
        studentsByDept,
        teachersByDept,
        coursesByDept,
        attendanceByDept,
        marksByDept,
        attendanceRate: overallAttendanceRate,
        passRate: overallPassRate,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalCourses: courses.length,
        totalDepartments: departments.length,
      });
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError("Unable to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const { departments, studentsByDept, teachersByDept, coursesByDept, attendanceByDept, marksByDept, attendanceRate, passRate, totalStudents, totalTeachers, totalCourses, totalDepartments } = reportData;

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
                <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Reports & Analytics</h1>
                <p className="mt-2 text-sm text-[#8b7774]">Institutional academic performance overview.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchReports} disabled={loading} className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-[#eadfd8] bg-[#fffaf7] px-4 py-2.5 text-xs font-semibold text-[#48252a] shadow-sm hover:border-[#fbc6b9] hover:bg-white">
                  <Download size={15} /> Export Report
                </button>
              </div>
            </div>

            {error && <div className="mb-5 rounded-xl border border-[#e06464]/20 bg-[#fbc6b9]/20 px-4 py-3 text-xs text-[#8b3e46]">{error}</div>}

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total Students" value={totalStudents} icon={GraduationCap} accent="#e06464" />
              <StatCard title="Total Teachers" value={totalTeachers} icon={UserCog} accent="#f1745e" />
              <StatCard title="Total Courses" value={totalCourses} icon={BookOpen} accent="#e6a07f" />
              <StatCard title="Departments" value={totalDepartments} icon={Building2} accent="#48252a" />
            </div>

            {/* Key Metrics */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard title="Overall Attendance" value={`${attendanceRate}%`} icon={CalendarCheck} accent="#22c55e" trend={attendanceRate >= 75 ? "Good" : "Needs attention"} />
              <StatCard title="Overall Pass Rate" value={`${passRate}%`} icon={TrendingUp} accent="#48252a" trend={passRate >= 60 ? "Acceptable" : "Below target"} />
            </div>

            {/* Department-wise Breakdown */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <Panel title="Students by Department" icon={GraduationCap} accent="#e06464">
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <ProgressItem
                      key={dept.id}
                      label={`${dept.name} (${dept.code})`}
                      value={studentsByDept[dept.id] || 0}
                    />
                  ))}
                  {departments.length === 0 && (
                    <p className="text-center text-sm text-[#8b7774] py-4">No departments found</p>
                  )}
                </div>
              </Panel>

              <Panel title="Teachers by Department" icon={UserCog} accent="#f1745e">
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <ProgressItem
                      key={dept.id}
                      label={`${dept.name} (${dept.code})`}
                      value={teachersByDept[dept.id] || 0}
                    />
                  ))}
                  {departments.length === 0 && (
                    <p className="text-center text-sm text-[#8b7774] py-4">No departments found</p>
                  )}
                </div>
              </Panel>

              <Panel title="Courses by Department" icon={BookOpen} accent="#e6a07f">
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <ProgressItem
                      key={dept.id}
                      label={`${dept.name} (${dept.code})`}
                      value={coursesByDept[dept.id] || 0}
                    />
                  ))}
                  {departments.length === 0 && (
                    <p className="text-center text-sm text-[#8b7774] py-4">No departments found</p>
                  )}
                </div>
              </Panel>

              <Panel title="Attendance Rate by Department" icon={CalendarCheck} accent="#22c55e">
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <ProgressItem
                      key={dept.id}
                      label={`${dept.name} (${dept.code})`}
                      value={attendanceByDept[dept.id] || 0}
                    />
                  ))}
                  {departments.length === 0 && (
                    <p className="text-center text-sm text-[#8b7774] py-4">No departments found</p>
                  )}
                </div>
              </Panel>

              <Panel title="Pass Rate by Department" icon={TrendingUp} accent="#48252a">
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <ProgressItem
                      key={dept.id}
                      label={`${dept.name} (${dept.code})`}
                      value={marksByDept[dept.id] || 0}
                    />
                  ))}
                  {departments.length === 0 && (
                    <p className="text-center text-sm text-[#8b7774] py-4">No departments found</p>
                  )}
                </div>
              </Panel>

              <Panel title="Department Summary Table" icon={Building2} accent="#e06464">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#eadfd8] bg-[#f8f2ee]">
                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">Department</th>
                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">Students</th>
                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">Teachers</th>
                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">Courses</th>
                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">Attendance</th>
                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-[#8b7774]">Pass Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((dept) => (
                        <tr key={dept.id} className="border-b border-[#eadfd8] hover:bg-[#f8f2ee]/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <DepartmentBadge department={dept.name} />
                              <span className="text-xs text-[#b29d96]">({dept.code})</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-[#48252a]">{studentsByDept[dept.id] || 0}</td>
                          <td className="px-4 py-3 text-right text-sm text-[#8b7774]">{teachersByDept[dept.id] || 0}</td>
                          <td className="px-4 py-3 text-right text-sm text-[#8b7774]">{coursesByDept[dept.id] || 0}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-[#8b7774]">
                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${attendanceByDept[dept.id] >= 75 ? "bg-emerald-50 text-emerald-600" : attendanceByDept[dept.id] >= 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                              {attendanceByDept[dept.id] || 0}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-[#8b7774]">
                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${marksByDept[dept.id] >= 60 ? "bg-emerald-50 text-emerald-600" : marksByDept[dept.id] >= 40 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                              {marksByDept[dept.id] || 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {departments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#8b7774]">No departments found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>

            {loading && <LoadingState />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminReports;