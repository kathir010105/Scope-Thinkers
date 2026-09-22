import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import GlobalSearch from "../search/GlobalSearch";

import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

export default function Topbar() {
  const { user } = useAuth();

  const { unreadCount } = useNotifications();

  const navigate = useNavigate();

  const email = user?.email || "User";

  const initials = email.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#080c0a]/95 px-6 backdrop-blur">
      {/* ================================================= */}
      {/* GLOBAL SEARCH */}
      {/* ================================================= */}

      <div className="flex min-w-0 flex-1 items-center">
        <GlobalSearch />
      </div>

      {/* ================================================= */}
      {/* RIGHT SIDE */}
      {/* ================================================= */}

      <div className="ml-6 flex shrink-0 items-center gap-5">
        {/* Notification */}

        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <Bell size={18} />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#22c55e] px-1 text-[9px] font-bold text-black">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}

        <div className="h-6 w-px bg-white/10" />

        {/* User */}

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22c55e]/10 text-sm font-medium text-[#22c55e]">
            {initials}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[180px] truncate text-sm font-medium text-white">
              {email}
            </p>

            <p className="text-[11px] text-white/35">Member</p>
          </div>
        </div>
      </div>
    </header>
  );
}
