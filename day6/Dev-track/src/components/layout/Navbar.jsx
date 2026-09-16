import React from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Command,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Navbar() {
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: CheckSquare,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <span className="text-lg font-bold text-white">D</span>
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              DevTrack
            </h1>

            <p className="text-[11px] font-medium text-slate-400">
              Build. Track. Ship.
            </p>
          </div>
        </NavLink>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={17} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 transition hover:border-slate-300 hover:bg-white lg:flex">
            <Search size={17} />

            <span className="text-xs">Search anything...</span>

            <span className="ml-5 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
              <Command size={10} />K
            </span>
          </button>

          {/* Mobile search */}
          <button className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden">
            <Search size={18} />
          </button>

          {/* Notification */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <Bell size={19} />

            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Profile */}
          <button className="ml-1 flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              K
            </div>

            <div className="hidden text-left lg:block">
              <p className="text-xs font-semibold text-slate-800">Kathirvel</p>

              <p className="text-[11px] text-slate-400">Developer</p>
            </div>

            <ChevronDown size={15} className="hidden text-slate-400 lg:block" />
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="border-t border-slate-100 px-6 py-2 md:hidden">
        <nav className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                    isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-500"
                  }`
                }
              >
                <Icon size={15} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
