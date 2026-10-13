import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";

import AdminDashboard from "../pages/admin/AdminDashboard";
import HODDashboard from "../pages/hod/HODDashboard";
import RoleDashboard from "../pages/RoleDashboard";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherStudents from "../pages/teacher/TeacherStudents";
import ProtectedRoute from "../components/ProtectedRoute";
import TeacherCourses from "../pages/teacher/TeacherCourses";

/*
|--------------------------------------------------------------------------
| Placeholder Page
|--------------------------------------------------------------------------
| Used temporarily for modules that we haven't implemented yet.
*/

function Placeholder({ title }) {
  return (
    <div className="min-h-[400px] rounded-2xl border border-[#E6D0AC]/50 bg-white p-8 shadow-sm">
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-semibold text-[#48252A]">{title}</h1>

        <p className="mt-2 text-sm text-slate-400">
          This module will be implemented next.
        </p>
      </div>

      <div className="flex min-h-[250px] items-center justify-center">
        <p className="text-sm text-slate-400">Coming soon</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================
            PUBLIC
        ================================================== */}

        <Route path="/" element={<Login />} />

        {/* ==================================================
            ADMIN
        ================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          {/* Dashboard */}

          <Route path="/admin" element={<AdminDashboard />} />

          {/* Users */}

          <Route path="/admin/users" element={<Placeholder title="Users" />} />

          {/* Registration Requests */}

          <Route
            path="/admin/registration-requests"
            element={<Placeholder title="Registration Requests" />}
          />

          {/* Invitations */}

          <Route
            path="/admin/invitations"
            element={<Placeholder title="Invitations" />}
          />

          {/* Departments */}

          <Route
            path="/admin/departments"
            element={<Placeholder title="Departments" />}
          />

          {/* Students */}

          <Route
            path="/admin/students"
            element={<Placeholder title="Students" />}
          />

          {/* Teachers */}

          <Route
            path="/admin/teachers"
            element={<Placeholder title="Teachers" />}
          />

          {/* Courses */}

          <Route
            path="/admin/courses"
            element={<Placeholder title="Courses" />}
          />

          {/* Attendance */}

          <Route
            path="/admin/attendance"
            element={<Placeholder title="Attendance" />}
          />

          {/* Marks */}

          <Route path="/admin/marks" element={<Placeholder title="Marks" />} />

          {/* Reports */}

          <Route
            path="/admin/reports"
            element={<Placeholder title="Reports" />}
          />

          {/* Settings */}

          <Route
            path="/admin/settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>

        {/* ==================================================
            HOD
        ================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["hod"]} />}>
          {/* Dashboard */}

          <Route path="/hod" element={<HODDashboard />} />

          {/* Students */}

          <Route
            path="/hod/students"
            element={<Placeholder title="Department Students" />}
          />

          {/* Teachers */}

          <Route
            path="/hod/teachers"
            element={<Placeholder title="Department Teachers" />}
          />

          {/* Courses */}

          <Route
            path="/hod/courses"
            element={<Placeholder title="Department Courses" />}
          />

          {/* Attendance */}

          <Route
            path="/hod/attendance"
            element={<Placeholder title="Department Attendance" />}
          />

          {/* Marks */}

          <Route
            path="/hod/marks"
            element={<Placeholder title="Department Marks" />}
          />

          {/* Reports */}

          <Route
            path="/hod/reports"
            element={<Placeholder title="Department Reports" />}
          />

          {/* Department */}

          <Route
            path="/hod/department"
            element={<Placeholder title="Department" />}
          />

          {/* Settings */}

          <Route
            path="/hod/settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>

        {/* ==================================================
            TEACHER
        ================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />

          <Route path="/teacher/students" element={<TeacherStudents />} />

          <Route
            path="/teacher/profile"
            element={<Placeholder title="My Profile" />}
          />

          <Route
            path="/teacher/classes"
            element={<Placeholder title="My Classes" />}
          />

          <Route path="/teacher/courses" element={<TeacherCourses />} />

          <Route
            path="/teacher/attendance"
            element={<Placeholder title="Attendance" />}
          />

          <Route
            path="/teacher/marks"
            element={<Placeholder title="Marks" />}
          />

          <Route
            path="/teacher/reports"
            element={<Placeholder title="Reports" />}
          />

          <Route
            path="/teacher/settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>

        {/* ==================================================
            STUDENT
        ================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          {/* Dashboard */}

          <Route path="/student" element={<RoleDashboard />} />

          {/* Profile */}

          <Route
            path="/student/profile"
            element={<Placeholder title="My Profile" />}
          />

          {/* Courses */}

          <Route
            path="/student/courses"
            element={<Placeholder title="My Courses" />}
          />

          {/* Attendance */}

          <Route
            path="/student/attendance"
            element={<Placeholder title="My Attendance" />}
          />

          {/* Marks */}

          <Route
            path="/student/marks"
            element={<Placeholder title="My Marks" />}
          />

          {/* Examinations */}

          <Route
            path="/student/examinations"
            element={<Placeholder title="Examinations" />}
          />

          {/* Notifications */}

          <Route
            path="/student/notifications"
            element={<Placeholder title="Notifications" />}
          />

          {/* Settings */}

          <Route
            path="/student/settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>

        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
