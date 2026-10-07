import {
  LayoutDashboard,
  User,
  BookOpen,
  ClipboardCheck,
  FileText,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

import { auth } from "../../firebase/firebase";

function UserSidebar({ open, onClose }) {
  const { profile } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const location = useLocation();

  const role = profile?.role;

  const roleTitle = {
    student: "Student",
    teacher: "Teacher",
    hod: "HOD",
  };

  const dashboardPath = `/${role}`;

  const studentLinks = [
    {
      label: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      path: "/student/profile",
      icon: User,
    },
    {
      label: "My Courses",
      path: "/student/courses",
      icon: BookOpen,
    },
    {
      label: "Attendance",
      path: "/student/attendance",
      icon: ClipboardCheck,
    },
    {
      label: "Marks",
      path: "/student/marks",
      icon: FileText,
    },
  ];

  const teacherLinks = [
    {
      label: "Dashboard",
      path: "/teacher",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      path: "/teacher/profile",
      icon: User,
    },
    {
      label: "My Courses",
      path: "/teacher/courses",
      icon: BookOpen,
    },
    {
      label: "Students",
      path: "/teacher/students",
      icon: Users,
    },
    {
      label: "Attendance",
      path: "/teacher/attendance",
      icon: ClipboardCheck,
    },
    {
      label: "Marks",
      path: "/teacher/marks",
      icon: FileText,
    },
  ];

  const hodLinks = [
    {
      label: "Dashboard",
      path: "/hod",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      path: "/hod/profile",
      icon: User,
    },
    {
      label: "Students",
      path: "/hod/students",
      icon: GraduationCap,
    },
    {
      label: "Teachers",
      path: "/hod/teachers",
      icon: Users,
    },
    {
      label: "Courses",
      path: "/hod/courses",
      icon: BookOpen,
    },
    {
      label: "Attendance",
      path: "/hod/attendance",
      icon: ClipboardCheck,
    },
    {
      label: "Reports",
      path: "/hod/reports",
      icon: BarChart3,
    },
  ];

  const links =
    role === "student"
      ? studentLinks
      : role === "teacher"
        ? teacherLinks
        : hodLinks;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed
          z-50
          top-0
          left-0
          h-screen
          w-64
          bg-white
          border-r
          border-slate-200
          flex
          flex-col
          transition-transform
          duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-blue-600">StudentMS</h1>

            <p className="text-[10px] text-slate-400">Management System</p>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role */}
        <div className="px-5 py-4">
          <div className="px-3 py-2 bg-blue-50 rounded-lg">
            <p className="text-[10px] uppercase tracking-wider text-blue-500 font-semibold">
              Logged in as
            </p>

            <p className="mt-1 text-sm font-semibold text-blue-700 capitalize">
              {roleTitle[role] || role}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;

            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-lg
                  text-sm
                  transition
                  ${
                    active
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                <Icon size={18} />

                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => navigate(`/${role}/settings`)}
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-lg
              text-sm
              text-slate-600
              hover:bg-slate-50
            "
          >
            <Settings size={18} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-lg
              text-sm
              text-red-500
              hover:bg-red-50
              mt-1
            "
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default UserSidebar;
