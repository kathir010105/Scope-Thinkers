import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../../firebase/firebase";

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Registration Requests",
    path: "/admin/requests",
    icon: UserPlus,
  },
  {
    label: "Invitations",
    path: "/admin/invitations",
    icon: UserPlus,
  },
  {
    label: "Departments",
    path: "/admin/departments",
    icon: Building2,
  },
  {
    label: "Students",
    path: "/admin/students",
    icon: GraduationCap,
  },
  {
    label: "Teachers",
    path: "/admin/teachers",
    icon: Users,
  },
  {
    label: "Courses",
    path: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Attendance",
    path: "/admin/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Marks",
    path: "/admin/marks",
    icon: FileText,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: BarChart3,
  },
];

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/", { replace: true });
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          lg:static
          z-50
          top-0
          left-0
          h-screen
          w-72
          bg-white
          border-r
          border-slate-200
          flex
          flex-col
          transition-transform
          duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Student<span className="text-blue-600">MS</span>
            </h1>

            <p className="text-xs text-slate-500 mt-1">Management System</p>
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Administration
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.path === "/admin"
                  ? currentPath === "/admin"
                  : currentPath.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-lg
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon size={19} />

                  <span className="text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-200 p-4">
          {/* Settings */}
          <button
            onClick={() => handleNavigation("/admin/settings")}
            className={`
              w-full
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-lg
              text-sm
              font-medium
              transition
              ${
                currentPath.startsWith("/admin/settings")
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            <Settings size={19} />
            Settings
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="
              w-full
              mt-1
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-lg
              text-sm
              font-medium
              text-red-600
              hover:bg-red-50
              transition
            "
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
