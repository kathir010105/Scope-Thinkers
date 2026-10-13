import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  CalendarCheck,
  FileText,
  BarChart3,
  Building2,
  Settings,
  LogOut,
  School,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

import { auth } from "../../firebase/firebase";

function HODSidebar({ expanded, setExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/hod",
    },
    {
      label: "Students",
      icon: Users,
      path: "/hod/students",
    },
    {
      label: "Teachers",
      icon: UserCog,
      path: "/hod/teachers",
    },
    {
      label: "Courses",
      icon: BookOpen,
      path: "/hod/courses",
    },
    {
      label: "Attendance",
      icon: CalendarCheck,
      path: "/hod/attendance",
    },
    {
      label: "Marks",
      icon: FileText,
      path: "/hod/marks",
    },
    {
      label: "Reports",
      icon: BarChart3,
      path: "/hod/reports",
    },
    {
      label: "Department",
      icon: Building2,
      path: "/hod/department",
    },
  ];

  const isActive = (path) => {
    if (path === "/hod") {
      return location.pathname === "/hod";
    }

    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col bg-[#48252A] transition-all duration-300 ${
        expanded ? "w-[240px]" : "w-[90px]"
      }`}
    >
      {/* Logo */}

      <div
        className={`relative flex h-[90px] shrink-0 items-center bg-[#E06464] text-white ${
          expanded ? "justify-start px-6" : "justify-center"
        }`}
      >
        <div className={`flex items-center ${expanded ? "gap-3" : "flex-col"}`}>
          <School size={28} />

          {expanded ? (
            <div>
              <p className="text-sm font-semibold">Student</p>
              <p className="text-sm font-semibold">Management</p>
            </div>
          ) : (
            <span className="mt-1 text-[9px] font-semibold">SMS</span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute -right-3 top-8 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[#48252A] shadow"
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Menu */}

      <nav className="flex-1 overflow-y-auto py-5">
        {expanded && (
          <p className="mb-3 px-5 text-[10px] font-semibold uppercase tracking-wider text-[#FBC6B9]/70">
            Department
          </p>
        )}

        <div className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={!expanded ? item.label : undefined}
                className={`group relative flex h-11 w-full items-center rounded-md transition ${
                  expanded ? "justify-start gap-4 px-4" : "justify-center"
                } ${
                  active
                    ? "bg-[#E06464] text-white"
                    : "text-[#FBC6B9] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={20} strokeWidth={1.8} className="shrink-0" />

                {expanded && (
                  <span className="truncate text-sm">{item.label}</span>
                )}

                {!expanded && (
                  <span className="pointer-events-none absolute left-[78px] z-50 hidden whitespace-nowrap rounded-md bg-[#48252A] px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}

      <div className="border-t border-white/10 p-2">
        <button
          onClick={() => navigate("/hod/settings")}
          title={!expanded ? "Settings" : undefined}
          className={`flex h-11 w-full items-center rounded-md text-[#FBC6B9] hover:bg-white/10 hover:text-white ${
            expanded ? "justify-start gap-4 px-4" : "justify-center"
          }`}
        >
          <Settings size={20} />

          {expanded && <span className="text-sm">Settings</span>}
        </button>

        <button
          onClick={handleLogout}
          title={!expanded ? "Logout" : undefined}
          className={`flex h-11 w-full items-center rounded-md text-[#FBC6B9] hover:bg-white/10 hover:text-white ${
            expanded ? "justify-start gap-4 px-4" : "justify-center"
          }`}
        >
          <LogOut size={20} />

          {expanded && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default HODSidebar;
