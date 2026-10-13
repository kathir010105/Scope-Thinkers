import { useState, useEffect } from "react";
import { Bell, X, Check, Loader2 } from "lucide-react";
import { notificationsService } from "../../services/firestore";
import { useSelector } from "react-redux";

export function NotificationBell() {
  const { profile } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const data = await notificationsService.getForUser(profile.uid, profile.role, profile.departmentId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.readBy.includes(profile.uid)).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile]);

  const handleMarkAsRead = async (notificationId) => {
    if (!profile) return;
    try {
      await notificationsService.markAsRead(notificationId, profile.uid);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, readBy: [...n.readBy, profile.uid] } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!profile) return;
    try {
      await notificationsService.markAllAsRead(profile.uid, profile.role, profile.departmentId);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readBy: [...n.readBy, profile.uid] }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#8b7774] transition hover:bg-[#fbc6b9]/30 hover:text-[#48252a]"
      >
        <Bell size={19} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#e06464]" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {isOpen && (
        <div className="fixed right-4 top-16 z-50 w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl border border-[#eadfd8] shadow-xl overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#eadfd8] bg-[#fffaf7]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbc6b9]/50 text-[#e06464]">
                <Bell size={18} />
              </div>
              <h3 className="text-sm font-semibold text-[#48252a]">Notifications</h3>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-[#e06464] hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#f8f2ee] transition"
              >
                <X size={16} className="text-[#8b7774]" />
              </button>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 size={24} className="mx-auto animate-spin text-[#e06464]" />
                <p className="mt-2 text-sm text-[#8b7774]">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-[#b29d96]" />
                <p className="mt-3 text-sm text-[#8b7774]">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#eadfd8]">
                {notifications.map((notification) => {
                  const isUnread = !notification.readBy.includes(profile?.uid);
                  return (
                    <button
                      key={notification.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isUnread) handleMarkAsRead(notification.id);
                      }}
                      className={`w-full p-4 text-left transition ${isUnread ? "bg-[#fffaf7]" : "bg-white"} hover:bg-[#f8f2ee]/50`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isUnread ? "bg-[#fbc6b9]/50" : "bg-[#f8f2ee]"
                          } text-[#e06464]`}
                        >
                          <Bell size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold text-[#48252a] ${isUnread ? "" : "font-medium"}`}>
                            {notification.title}
                          </p>
                          <p className="mt-1 text-[10px] text-[#8b7774] line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-[10px] text-[#b29d96]">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {isUnread && (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e06464] text-white">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}