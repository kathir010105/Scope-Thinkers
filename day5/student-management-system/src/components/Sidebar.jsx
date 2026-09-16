import React from "react";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  UserRound,
  Building2,
  Settings,
} from "lucide-react";

class Sidebar extends React.Component {
  render() {
    return (
      <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">
            Student<span className="text-blue-400">MS</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3 px-3">
            Main Menu
          </p>

          <div className="space-y-1">
            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            {/* Students */}
            <NavLink
              to="/students"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Users size={20} />
              <span>Students</span>
            </NavLink>

            {/* Courses */}
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <BookOpen size={20} />
              <span>Courses</span>
            </NavLink>

            {/* Attendance */}
            <NavLink
              to="/attendance"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <ClipboardCheck size={20} />
              <span>Attendance</span>
            </NavLink>

            {/* Marks */}
            <NavLink
              to="/marks"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <BarChart3 size={20} />
              <span>Marks</span>
            </NavLink>

            {/* Teachers */}
            <NavLink
              to="/teachers"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <UserRound size={20} />
              <span>Teachers</span>
            </NavLink>

            {/* Departments */}
            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Building2 size={20} />
              <span>Departments</span>
            </NavLink>
          </div>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-slate-700">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    );
  }
}

export default Sidebar;
