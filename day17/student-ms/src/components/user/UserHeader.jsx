import { Menu, Bell, ChevronDown } from "lucide-react";

import { useSelector } from "react-redux";

function UserHeader({ onMenuClick }) {
  const { profile } = useSelector((state) => state.auth);

  const name = profile?.name || "User";

  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="
            lg:hidden
            p-2
            rounded-lg
            hover:bg-slate-100
          "
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="font-semibold text-slate-900">
            Student Management System
          </h2>

          <p className="text-xs text-slate-400 hidden sm:block">
            Academic Management Portal
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 rounded-lg hover:bg-slate-100">
          <Bell size={20} className="text-slate-600" />

          <span
            className="
            absolute
            top-2
            right-2
            w-2
            h-2
            rounded-full
            bg-red-500
          "
          />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-900">{name}</p>

            <p className="text-xs text-slate-400 capitalize">{profile?.role}</p>
          </div>

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

export default UserHeader;
