import { Menu, Bell, ChevronDown } from "lucide-react";

import { useSelector } from "react-redux";

function AdminHeader({ onMenuClick }) {
  const { profile } = useSelector((state) => state.auth);

  const adminName = profile?.name || "Administrator";

  const firstLetter = adminName.charAt(0).toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="
            lg:hidden
            p-2
            rounded-lg
            hover:bg-slate-100
            transition
          "
        >
          <Menu size={22} className="text-slate-700" />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Administration
          </h2>

          <p className="text-xs text-slate-500 hidden sm:block">
            Manage your institution
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          className="
            relative
            p-2.5
            rounded-lg
            hover:bg-slate-100
            transition
          "
        >
          <Bell size={20} className="text-slate-600" />

          {/* Notification dot */}
          <span
            className="
              absolute
              top-2
              right-2
              w-2
              h-2
              bg-red-500
              rounded-full
            "
          />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* Admin profile */}
        <div className="flex items-center gap-3">
          {/* Name */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-900">{adminName}</p>

            <p className="text-xs text-slate-500">Administrator</p>
          </div>

          {/* Avatar */}
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-blue-100
              text-blue-600
              flex
              items-center
              justify-center
              font-semibold
            "
          >
            {firstLetter}
          </div>

          <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
