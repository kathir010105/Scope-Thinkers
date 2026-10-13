import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserPlus,
  Building2,
  GraduationCap,
  UserCog,
  BookOpen,
  CalendarCheck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  School,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate, useLocation } from "react-router-dom";

function AdminSidebar({ expanded, setExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Users", icon: Users, path: "/admin/users" },
    {
      label: "Registration Requests",
      icon: ClipboardList,
      path: "/admin/requests",
    },
    { label: "Invitations", icon: UserPlus, path: "/admin/invitations" },
    { label: "Departments", icon: Building2, path: "/admin/departments" },
    { label: "Students", icon: GraduationCap, path: "/admin/students" },
    { label: "Teachers", icon: UserCog, path: "/admin/teachers" },
    { label: "Courses", icon: BookOpen, path: "/admin/courses" },
    { label: "Attendance", icon: CalendarCheck, path: "/admin/attendance" },
    { label: "Marks", icon: FileText, path: "/admin/marks" },
    { label: "Reports", icon: BarChart3, path: "/admin/reports" },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#48252a] text-white transition-[width] duration-300 ${
        expanded ? "w-[238px]" : "w-[76px]"
      }`}
    >
      <div className="relative flex h-[78px] shrink-0 items-center border-b border-white/10 bg-[#48252a]">
        <div
          className={`flex items-center ${expanded ? "gap-3 px-5" : "w-full justify-center"}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e06464] text-white shadow-sm">
            <School size={21} strokeWidth={1.8} />
          </div>

          {expanded && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                Student Management
              </p>
              <p className="mt-0.5 text-[10px] text-[#fbc6b9]">
                Administration
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className="absolute -right-3 top-[25px] z-50 flex h-7 w-7 items-center justify-center rounded-full border border-[#eadfd8] bg-white text-[#48252a] shadow-md transition hover:scale-105"
        >
          {expanded ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-5">
        {expanded && (
          <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#e6d0ac]/70">
            Administration
          </p>
        )}

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                type="button"
                title={!expanded ? item.label : undefined}
                onClick={() => navigate(item.path)}
                className={`group relative flex h-11 w-full items-center rounded-xl transition-all duration-200 ${
                  expanded ? "justify-start gap-3 px-3" : "justify-center"
                } ${
                  active
                    ? "bg-[#e06464] text-white shadow-sm"
                    : "text-[#f8e8e3]/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={1.8} className="shrink-0" />
                {expanded && (
                  <span className="truncate text-[12px] font-medium">
                    {item.label}
                  </span>
                )}

                {!expanded && (
                  <span className="pointer-events-none absolute left-[67px] z-[100] hidden whitespace-nowrap rounded-lg bg-[#48252a] px-3 py-2 text-[11px] text-white shadow-xl group-hover:block">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={() => navigate("/admin/settings")}
          title={!expanded ? "Settings" : undefined}
          className={`group relative flex h-11 w-full items-center rounded-xl text-[#f8e8e3]/70 transition hover:bg-white/8 hover:text-white ${
            expanded ? "justify-start gap-3 px-3" : "justify-center"
          }`}
        >
          <Settings size={19} strokeWidth={1.8} />
          {expanded && (
            <span className="text-[12px] font-medium">Settings</span>
          )}
          {!expanded && (
            <span className="pointer-events-none absolute left-[67px] z-[100] hidden whitespace-nowrap rounded-lg bg-[#48252a] px-3 py-2 text-[11px] text-white shadow-xl group-hover:block">
              Settings
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          title={!expanded ? "Logout" : undefined}
          className={`group relative flex h-11 w-full items-center rounded-xl text-[#fbc6b9] transition hover:bg-[#e06464]/15 hover:text-white ${
            expanded ? "justify-start gap-3 px-3" : "justify-center"
          }`}
        >
          <LogOut size={19} strokeWidth={1.8} />
          {expanded && <span className="text-[12px] font-medium">Logout</span>}
          {!expanded && (
            <span className="pointer-events-none absolute left-[67px] z-[100] hidden whitespace-nowrap rounded-lg bg-[#48252a] px-3 py-2 text-[11px] text-white shadow-xl group-hover:block">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
