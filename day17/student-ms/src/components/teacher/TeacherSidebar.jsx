import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

function TeacherSidebar({ expanded, setExpanded }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/teacher",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      path: "/teacher/profile",
      icon: UserCircle,
    },
    {
      label: "My Classes",
      path: "/teacher/classes",
      icon: ClipboardList,
    },
    {
      label: "My Students",
      path: "/teacher/students",
      icon: Users,
    },
    {
      label: "My Courses",
      path: "/teacher/courses",
      icon: BookOpen,
    },
    {
      label: "Attendance",
      path: "/teacher/attendance",
      icon: CalendarCheck,
    },
    {
      label: "Marks",
      path: "/teacher/marks",
      icon: ClipboardList,
    },
    {
      label: "Reports",
      path: "/teacher/reports",
      icon: BarChart3,
    },
  ];

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
      className={`sticky top-0 flex h-screen shrink-0 flex-col bg-[#48252a] text-white transition-all duration-300 ${
        expanded ? "w-[240px]" : "w-[62px]"
      }`}
    >
      {/* LOGO */}

      <div className="flex h-[62px] items-center border-b border-white/10">
        <div className="flex w-full items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e06464] text-white">
            <BookOpen size={18} />
          </div>

          {expanded && (
            <div className="ml-3 overflow-hidden">
              <p className="whitespace-nowrap text-sm font-semibold">
                Student MS
              </p>

              <p className="whitespace-nowrap text-[9px] text-[#e6d0ac]">
                Teacher Panel
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TOGGLE */}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-[#eadfd8] bg-white text-[#48252a] shadow-sm transition hover:bg-[#fbc6b9]"
      >
        <ChevronRight
          size={14}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* NAVIGATION */}

      <nav className="flex-1 space-y-1 px-2 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/teacher"}
              title={!expanded ? item.label : undefined}
              className={({ isActive }) =>
                `group flex h-10 items-center rounded-xl transition ${
                  isActive
                    ? "bg-[#e06464] text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <div className="flex w-[46px] shrink-0 items-center justify-center">
                <Icon size={17} strokeWidth={1.8} />
              </div>

              {expanded && (
                <span className="whitespace-nowrap text-xs font-medium">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* BOTTOM */}

      <div className="space-y-1 border-t border-white/10 px-2 py-3">
        <NavLink
          to="/teacher/settings"
          title={!expanded ? "Settings" : undefined}
          className={({ isActive }) =>
            `flex h-10 items-center rounded-xl transition ${
              isActive
                ? "bg-[#e06464] text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <div className="flex w-[46px] shrink-0 items-center justify-center">
            <Settings size={17} />
          </div>

          {expanded && <span className="text-xs font-medium">Settings</span>}
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          title={!expanded ? "Logout" : undefined}
          className="flex h-10 w-full items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <div className="flex w-[46px] shrink-0 items-center justify-center">
            <LogOut size={17} />
          </div>

          {expanded && <span className="text-xs font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default TeacherSidebar;
