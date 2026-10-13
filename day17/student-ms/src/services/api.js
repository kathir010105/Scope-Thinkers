import { auth } from "../firebase/firebase";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) throw new ApiError("Not authenticated", 401);
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

const request = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || "Request failed", response.status, data);
  }

  return data;
};

// ============================================================
// AUTH
// ============================================================
export const apiAuth = {
  verify: () => request("/auth/verify", { method: "POST" }),
};

// ============================================================
// ADMIN - USERS
// ============================================================
export const apiAdminUsers = {
  list: () => request("/admin/users"),
  create: (userData) => request("/admin/users", { method: "POST", body: JSON.stringify(userData) }),
  update: (uid, data) => request(`/admin/users/${uid}`, { method: "PATCH", body: JSON.stringify(data) }),
  activate: (uid) => request(`/admin/users/${uid}/activate`, { method: "POST" }),
  deactivate: (uid) => request(`/admin/users/${uid}/deactivate`, { method: "POST" }),
};

// ============================================================
// ADMIN - REGISTRATION REQUESTS
// ============================================================
export const apiAdminRegistrationRequests = {
  list: () => request("/admin/registration-requests"),
  approve: (uid) => request(`/admin/registration-requests/${uid}/approve`, { method: "POST" }),
  reject: (uid) => request(`/admin/registration-requests/${uid}/reject`, { method: "POST" }),
};

// ============================================================
// ADMIN - INVITATIONS
// ============================================================
export const apiAdminInvitations = {
  list: () => request("/admin/invitations"),
  create: (data) => request("/admin/invitations", { method: "POST", body: JSON.stringify(data) }),
};

// ============================================================
// INVITATION REDEMPTION (PUBLIC)
// ============================================================
export const apiInvitations = {
  redeem: (data) => fetch(`${API_BASE}/invitations/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.error || "Failed to redeem invitation", res.status, data);
    return data;
  }),
};

export { ApiError };
export default {
  auth: apiAuth,
  admin: {
    users: apiAdminUsers,
    registrationRequests: apiAdminRegistrationRequests,
    invitations: apiAdminInvitations,
  },
  invitations: apiInvitations,
};