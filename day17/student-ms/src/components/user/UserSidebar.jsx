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
  ChevronLeft,
  ChevronRight,
  School,
} from "lucide-react";

import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

import { auth } from "../../firebase/firebase";

function UserSidebar({ expanded, setExpanded }) {
  const { profile } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const role = profile?.role;

  const menus = {
    student: [
      { label: "Dashboard", path: "/student", icon: LayoutDashboard },
      { label: "My Profile", path: "/student/profile", icon: User },
      { label: "My Courses", path: "/student/courses", icon: BookOpen },
      {
        label: "Attendance",
        path: "/student/attendance",
        icon: ClipboardCheck,
      },
      { label: "Marks", path: "/student/marks", icon: FileText },
    ],
    teacher: [
      { label: "Dashboard", path: "/teacher", icon: LayoutDashboard },
      { label: "My Profile", path: "/teacher/profile", icon: User },
      { label: "My Courses", path: "/teacher/courses", icon: BookOpen },
      { label: "Students", path: "/teacher/students", icon: Users },
      {
        label: "Attendance",
        path: "/teacher/attendance",
        icon: ClipboardCheck,
      },
      { label: "Marks", path: "/teacher/marks", icon: FileText },
    ],
    hod: [
      { label: "Dashboard", path: "/hod", icon: LayoutDashboard },
      { label: "My Profile", path: "/hod/profile", icon: User },
      { label: "Students", path: "/hod/students", icon: GraduationCap },
      { label: "Teachers", path: "/hod/teachers", icon: Users },
      { label: "Courses", path: "/hod/courses", icon: BookOpen },
      { label: "Attendance", path: "/hod/attendance", icon: ClipboardCheck },
      { label: "Reports", path: "/hod/reports", icon: BarChart3 },
    ],
  };

  const links = menus[role] || [];

  const roleName = {
    student: "Student",
    teacher: "Teacher",
    hod: "Head of Department",
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#48252a] text-white transition-[width] duration-300 ${
        expanded ? "w-[238px]" : "w-[76px]"
      }`}
    >
      <div className="relative flex h-[78px] shrink-0 items-center border-b border-white/10">
        <div
          className={`flex items-center ${expanded ? "gap-3 px-5" : "w-full justify-center"}`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e06464]">
            <School size={21} strokeWidth={1.8} />
          </div>
          {expanded && (
            <div>
              <p className="text-sm font-semibold">Student Management</p>
              <p className="text-[10px] text-[#fbc6b9]">Academic Portal</p>
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

      {expanded && (
        <div className="px-4 py-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#e6d0ac]/70">
              Current Role
            </p>
            <p className="mt-1 text-xs font-medium text-white">
              {roleName[role]}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                type="button"
                title={!expanded ? item.label : undefined}
                onClick={() => navigate(item.path)}
                className={`group relative flex h-11 w-full items-center rounded-xl transition ${
                  expanded ? "justify-start gap-3 px-3" : "justify-center"
                } ${
                  active
                    ? "bg-[#e06464] text-white shadow-sm"
                    : "text-[#f8e8e3]/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={1.8} />
                {expanded && (
                  <span className="text-[12px] font-medium">{item.label}</span>
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
          onClick={() => navigate(`/${role}/settings`)}
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
          onClick={logout}
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

export default UserSidebar;
