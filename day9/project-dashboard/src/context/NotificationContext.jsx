import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
   * Load initial notifications.
   */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    loadNotifications();
  }, [user]);

  async function loadNotifications() {
    try {
      setLoading(true);

      const data = await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error("Notification loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Realtime subscription.
   */
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new;

          setNotifications((current) => [newNotification, ...current]);
        },
      )
      .subscribe((status) => {
        console.log("Notification realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /*
   * Unread count.
   */
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  /*
   * Mark one as read.
   */
  async function markAsRead(notificationId) {
    try {
      await markNotificationRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  }

  /*
   * Mark everything as read.
   */
  async function markAllAsRead() {
    try {
      await markAllNotificationsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        reloadNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
