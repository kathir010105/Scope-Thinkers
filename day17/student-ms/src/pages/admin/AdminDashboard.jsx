import { useState } from "react";

import {
  Users,
  UserPlus,
  GraduationCap,
  Building2,
  ArrowUpRight,
  Clock,
} from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

const stats = [
  {
    title: "Total Users",
    value: "0",
    description: "All registered users",
    icon: Users,
  },
  {
    title: "Pending Requests",
    value: "0",
    description: "Awaiting approval",
    icon: UserPlus,
  },
  {
    title: "Students",
    value: "0",
    description: "Registered students",
    icon: GraduationCap,
  },
  {
    title: "Departments",
    value: "0",
    description: "Active departments",
    icon: Building2,
  },
];

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

            <p className="mt-1 text-sm text-slate-500">
              Overview of your student management system.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="
                    bg-white
                    border
                    border-slate-200
                    rounded-xl
                    p-5
                    hover:shadow-sm
                    transition
                  "
                >
                  <div className="flex items-start justify-between">
                    {/* Information */}
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>

                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {stat.description}
                      </p>
                    </div>

                    {/* Icon */}
                    <div
                      className="
                        w-11
                        h-11
                        rounded-lg
                        bg-blue-50
                        text-blue-600
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            {/* Registration requests */}
            <div
              className="
                xl:col-span-2
                bg-white
                border
                border-slate-200
                rounded-xl
              "
            >
              {/* Header */}
              <div
                className="
                  p-5
                  border-b
                  border-slate-200
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Registration Requests
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Users waiting for administrator approval.
                  </p>
                </div>

                <button
                  className="
                    flex
                    items-center
                    gap-1
                    text-sm
                    font-medium
                    text-blue-600
                    hover:text-blue-700
                  "
                >
                  View all
                  <ArrowUpRight size={16} />
                </button>
              </div>

              {/* Empty state */}
              <div className="p-5">
                <div
                  className="
                    py-12
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <div
                    className="
                      w-12
                      h-12
                      rounded-full
                      bg-slate-100
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Clock size={22} className="text-slate-400" />
                  </div>

                  <h3 className="mt-4 font-medium text-slate-700">
                    No pending requests
                  </h3>

                  <p className="mt-1 text-sm text-slate-400 max-w-sm">
                    New registration requests will appear here when invited
                    users complete their registration.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div
              className="
                bg-white
                border
                border-slate-200
                rounded-xl
              "
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Quick Actions</h2>

                <p className="text-sm text-slate-500 mt-1">
                  Common administrative tasks.
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-2">
                {/* Invite user */}
                <button
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-lg
                    hover:bg-blue-50
                    text-left
                    transition
                  "
                >
                  <div
                    className="
                      w-9
                      h-9
                      rounded-lg
                      bg-blue-50
                      text-blue-600
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <UserPlus size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Invite User
                    </p>

                    <p className="text-xs text-slate-500">
                      Create a registration invitation
                    </p>
                  </div>
                </button>

                {/* Add department */}
                <button
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-lg
                    hover:bg-blue-50
                    text-left
                    transition
                  "
                >
                  <div
                    className="
                      w-9
                      h-9
                      rounded-lg
                      bg-blue-50
                      text-blue-600
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Building2 size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Add Department
                    </p>

                    <p className="text-xs text-slate-500">
                      Create a new department
                    </p>
                  </div>
                </button>

                {/* Manage users */}
                <button
                  className="
                    w-full
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-lg
                    hover:bg-blue-50
                    text-left
                    transition
                  "
                >
                  <div
                    className="
                      w-9
                      h-9
                      rounded-lg
                      bg-blue-50
                      text-blue-600
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Users size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Manage Users
                    </p>

                    <p className="text-xs text-slate-500">
                      View and manage system users
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
