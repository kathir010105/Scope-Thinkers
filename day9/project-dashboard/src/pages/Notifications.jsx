import { Bell, CheckCheck, Loader2 } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useNotifications } from "../context/NotificationContext";

export default function Notifications() {
  const navigate = useNavigate();

  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } =
    useNotifications();

  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleNotificationClick(notification) {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.task_id) {
      navigate(`/projects/${notification.project_id}`);
    } else if (notification.project_id) {
      navigate(`/projects/${notification.project_id}`);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-[#22c55e]" />

            <span className="text-xs text-white/30">Workspace</span>
          </div>

          <h1 className="mt-1 text-xl font-semibold text-white">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-white/35">
            Stay updated with project activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#22c55e]" />
        </div>
      ) : notifications.length === 0 ? (
        /* Empty */
        <div className="rounded-xl border border-white/10 bg-[#0b100d] py-16 text-center">
          <Bell size={30} className="mx-auto text-white/15" />

          <p className="mt-4 text-sm text-white/40">No notifications yet.</p>

          <p className="mt-1 text-xs text-white/20">
            Project activity will appear here.
          </p>
        </div>
      ) : (
        /* Notifications */
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b100d]">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className={`flex w-full items-start gap-4 border-b border-white/5 p-4 text-left transition last:border-b-0 hover:bg-white/[0.03] ${
                !notification.is_read ? "bg-[#22c55e]/[0.03]" : ""
              }`}
            >
              {/* Indicator */}
              <div className="relative mt-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e]">
                  <Bell size={16} />
                </div>

                {!notification.is_read && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <p
                    className={`text-sm ${
                      notification.is_read
                        ? "text-white/60"
                        : "font-medium text-white"
                    }`}
                  >
                    {notification.title}
                  </p>

                  <span className="shrink-0 text-[10px] text-white/20">
                    {formatDate(notification.created_at)}
                  </span>
                </div>

                {notification.message && (
                  <p className="mt-1 text-xs leading-5 text-white/35">
                    {notification.message}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
