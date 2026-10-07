import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminInvitations from "../pages/admin/AdminInvitations";

import RoleDashboard from "../pages/RoleDashboard";

import ProtectedRoute from "../components/ProtectedRoute";

function Placeholder({ title }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <div
          className="
          w-16
          h-16
          mx-auto
          rounded-2xl
          bg-blue-50
          text-blue-600
          flex
          items-center
          justify-center
          text-2xl
          font-bold
        "
        >
          {title.charAt(0)}
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">{title}</h1>

        <p className="mt-2 text-sm text-slate-500">
          This module will be connected to the database next.
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================
            PUBLIC
        ===================================== */}

        <Route path="/" element={<Login />} />

        {/* =====================================
            ADMIN
        ===================================== */}

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/invitations" element={<AdminInvitations />} />

          <Route path="/admin/users" element={<Placeholder title="Users" />} />

          <Route
            path="/admin/requests"
            element={<Placeholder title="Registration Requests" />}
          />

          <Route
            path="/admin/departments"
            element={<Placeholder title="Departments" />}
          />

          <Route
            path="/admin/students"
            element={<Placeholder title="Students" />}
          />

          <Route
            path="/admin/teachers"
            element={<Placeholder title="Teachers" />}
          />

          <Route
            path="/admin/courses"
            element={<Placeholder title="Courses" />}
          />

          <Route
            path="/admin/attendance"
            element={<Placeholder title="Attendance" />}
          />

          <Route path="/admin/marks" element={<Placeholder title="Marks" />} />

          <Route
            path="/admin/reports"
            element={<Placeholder title="Reports" />}
          />
        </Route>

        {/* =====================================
            STUDENT
        ===================================== */}

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<RoleDashboard />} />

          <Route
            path="/student/profile"
            element={<Placeholder title="My Profile" />}
          />

          <Route
            path="/student/courses"
            element={<Placeholder title="My Courses" />}
          />

          <Route
            path="/student/attendance"
            element={<Placeholder title="Attendance" />}
          />

          <Route
            path="/student/marks"
            element={<Placeholder title="Marks" />}
          />

          <Route
            path="/student/settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>

        {/* =====================================
            TEACHER
        ===================================== */}

        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher" element={<RoleDashboard />} />

          <Route
            path="/teacher/profile"
            element={<Placeholder title="My Profile" />}
          />

          <Route
            path="/teacher/courses"
            element={<Placeholder title="My Courses" />}
          />

          <Route
            path="/teacher/students"
            element={<Placeholder title="Students" />}
          />

          <Route
            path="/teacher/attendance"
            element={<Placeholder title="Attendance" />}
          />

          <Route
            path="/teacher/marks"
            element={<Placeholder title="Marks" />}
          />

          <Route
            path="/teacher/settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>

        {/* =====================================
            HOD
        ===================================== */}

        <Route element={<ProtectedRoute allowedRoles={["hod"]} />}>
          <Route path="/hod" element={<RoleDashboard />} />

          <Route
            path="/hod/profile"
            element={<Placeholder title="My Profile" />}
          />

          <Route
            path="/hod/students"
            element={<Placeholder title="Students" />}
          />

          <Route
            path="/hod/teachers"
            element={<Placeholder title="Teachers" />}
          />

          <Route
            path="/hod/courses"
            element={<Placeholder title="Courses" />}
          />

          <Route
            path="/hod/attendance"
            element={<Placeholder title="Attendance" />}
          />

          <Route
            path="/hod/reports"
            element={<Placeholder title="Reports" />}
          />

          <Route
            path="/hod/settings"
            element={<Placeholder title="Settings" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
