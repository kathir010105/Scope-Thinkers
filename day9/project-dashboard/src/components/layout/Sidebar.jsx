import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Bell,
  Settings,
  Code2,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    label: "My Tasks",
    path: "/my-tasks",
    icon: CheckSquare,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#080c0a]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
            <Code2 size={20} />
          </div>

          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white">
              DevSpace
            </h1>
            <p className="text-[10px] text-white/35">Project Workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
          Workspace
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[#22c55e]/10 text-[#22c55e]"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />

                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <ChevronRight size={14} className="text-[#22c55e]/70" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom workspace info */}
      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span className="text-xs font-medium text-white/70">
              Workspace active
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-white/35">
            Your projects, tasks and team activity are synced with Supabase.
          </p>
        </div>
      </div>
    </aside>
  );
}
