import { useEffect, useState } from "react";

import {
  Plus,
  Copy,
  Check,
  Link,
  Clock,
  UserPlus,
  X,
  ShieldCheck,
  Ban,
  RefreshCw,
} from "lucide-react";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { useSelector } from "react-redux";

import { db } from "../../firebase/firebase";

function AdminInvitations() {
  const { user } = useSelector((state) => state.auth);

  const [invitations, setInvitations] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [copiedId, setCopiedId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  });

  // ==========================================
  // LOAD INVITATIONS
  // ==========================================

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError("");

      const invitationsQuery = query(
        collection(db, "invitations"),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(invitationsQuery);

      const invitationData = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setInvitations(invitationData);
    } catch (err) {
      console.error("Failed to load invitations:", err);

      setError("Unable to load invitations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  // ==========================================
  // FORM HANDLING
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // GENERATE SECURE TOKEN
  // ==========================================

  const generateToken = () => {
    const bytes = new Uint8Array(32);

    window.crypto.getRandomValues(bytes);

    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  // ==========================================
  // CREATE INVITATION
  // ==========================================

  const handleCreateInvitation = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.role ||
      !formData.department.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setCreating(true);

      const token = generateToken();

      const expiresDate = new Date();

      // Invitation expires after 48 hours
      expiresDate.setHours(expiresDate.getHours() + 48);

      await addDoc(collection(db, "invitations"), {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),

        role: formData.role,

        department: formData.department.trim(),

        token,

        status: "pending",

        createdBy: user.uid,

        createdAt: serverTimestamp(),

        expiresAt: Timestamp.fromDate(expiresDate),
      });

      setSuccess("Invitation created successfully.");

      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
      });

      setShowForm(false);

      await loadInvitations();
    } catch (err) {
      console.error("Failed to create invitation:", err);

      setError("Failed to create invitation. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // COPY INVITATION LINK
  // ==========================================

  const copyInvitationLink = async (invitation) => {
    const link = `${window.location.origin}/register?token=${invitation.token}`;

    try {
      await navigator.clipboard.writeText(link);

      setCopiedId(invitation.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy invitation link:", err);

      setError("Could not copy the invitation link.");
    }
  };

  // ==========================================
  // REVOKE INVITATION
  // ==========================================

  const revokeInvitation = async (invitationId) => {
    try {
      await updateDoc(doc(db, "invitations", invitationId), {
        status: "revoked",
      });

      await loadInvitations();
    } catch (err) {
      console.error("Failed to revoke invitation:", err);

      setError("Failed to revoke invitation.");
    }
  };

  // ==========================================
  // STATUS
  // ==========================================

  const getInvitationStatus = (invitation) => {
    if (invitation.status === "revoked") {
      return {
        label: "Revoked",
        className: "bg-red-50 text-red-600",
      };
    }

    if (invitation.status === "used") {
      return {
        label: "Used",
        className: "bg-green-50 text-green-600",
      };
    }

    if (
      invitation.expiresAt?.toDate &&
      invitation.expiresAt.toDate() < new Date()
    ) {
      return {
        label: "Expired",
        className: "bg-slate-100 text-slate-500",
      };
    }

    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-600",
    };
  };

  // ==========================================
  // DATE FORMATTER
  // ==========================================

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) {
      return "—";
    }

    return timestamp.toDate().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Invitations</h1>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage registration invitations.
              </p>
            </div>

            <button
              onClick={() => {
                setShowForm(true);
                setError("");
                setSuccess("");
              }}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                bg-blue-600
                text-white
                rounded-lg
                text-sm
                font-medium
                hover:bg-blue-700
                transition
              "
            >
              <Plus size={18} />
              Create Invitation
            </button>
          </div>
        </div>
      </div>

      {/* ======================================
          CONTENT
      ====================================== */}

      <main className="p-6">
        {/* Success */}
        {success && (
          <div
            className="
              mb-5
              p-4
              bg-green-50
              border
              border-green-200
              rounded-lg
              text-sm
              text-green-700
              flex
              items-center
              gap-2
            "
          >
            <Check size={18} />

            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="
              mb-5
              p-4
              bg-red-50
              border
              border-red-200
              rounded-lg
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* ======================================
            STATISTICS
        ====================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Invitations</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {invitations.length}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Link size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {
                    invitations.filter(
                      (item) =>
                        item.status === "pending" &&
                        (!item.expiresAt?.toDate ||
                          item.expiresAt.toDate() > new Date()),
                    ).length
                  }
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Used</p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {invitations.filter((item) => item.status === "used").length}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            INVITATIONS TABLE
        ====================================== */}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Invitation History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                All registration invitations created by administrators.
              </p>
            </div>

            <button
              onClick={loadInvitations}
              className="
                p-2
                rounded-lg
                hover:bg-slate-100
                text-slate-500
                transition
              "
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="text-center">
                <div
                  className="
                    w-9
                    h-9
                    border-4
                    border-blue-100
                    border-t-blue-600
                    rounded-full
                    animate-spin
                    mx-auto
                  "
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading invitations...
                </p>
              </div>
            </div>
          ) : invitations.length === 0 ? (
            <div className="py-16 text-center">
              <div
                className="
                  w-14
                  h-14
                  mx-auto
                  rounded-full
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                "
              >
                <UserPlus size={24} className="text-slate-400" />
              </div>

              <h3 className="mt-4 font-medium text-slate-700">
                No invitations yet
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Create your first invitation to register a user.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Department
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Expires
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invitations.map((invitation) => {
                    const status = getInvitationStatus(invitation);

                    const canCopy =
                      invitation.status === "pending" &&
                      (!invitation.expiresAt?.toDate ||
                        invitation.expiresAt.toDate() > new Date());

                    return (
                      <tr
                        key={invitation.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                      >
                        {/* User */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {invitation.name}
                            </p>

                            <p className="text-xs text-slate-500 mt-0.5">
                              {invitation.email}
                            </p>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-700 capitalize">
                            {invitation.role}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-700">
                            {invitation.department}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-500">
                            {formatDate(invitation.createdAt)}
                          </span>
                        </td>

                        {/* Expires */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-500">
                            {formatDate(invitation.expiresAt)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex
                              px-2.5
                              py-1
                              rounded-full
                              text-xs
                              font-medium
                              ${status.className}
                            `}
                          >
                            {status.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {canCopy && (
                              <button
                                onClick={() => copyInvitationLink(invitation)}
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  px-3
                                  py-1.5
                                  rounded-lg
                                  bg-blue-50
                                  text-blue-600
                                  hover:bg-blue-100
                                  text-xs
                                  font-medium
                                  transition
                                "
                              >
                                {copiedId === invitation.id ? (
                                  <>
                                    <Check size={14} />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    Copy Link
                                  </>
                                )}
                              </button>
                            )}

                            {invitation.status === "pending" && (
                              <button
                                onClick={() => revokeInvitation(invitation.id)}
                                className="
                                  p-2
                                  rounded-lg
                                  text-red-500
                                  hover:bg-red-50
                                  transition
                                "
                                title="Revoke invitation"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ======================================
          CREATE INVITATION MODAL
      ====================================== */}

      {showForm && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/40
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-lg
              bg-white
              rounded-2xl
              shadow-xl
              overflow-hidden
            "
          >
            {/* Modal header */}
            <div
              className="
                px-6
                py-5
                border-b
                border-slate-200
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Invitation
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Invite a new user to the system.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="
                  p-2
                  rounded-lg
                  hover:bg-slate-100
                  transition
                "
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateInvitation} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="
                    w-full
                    px-3.5
                    py-2.5
                    border
                    border-slate-300
                    rounded-lg
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-500
                  "
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@college.com"
                  className="
                    w-full
                    px-3.5
                    py-2.5
                    border
                    border-slate-300
                    rounded-lg
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-500
                  "
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="
                    w-full
                    px-3.5
                    py-2.5
                    border
                    border-slate-300
                    rounded-lg
                    text-sm
                    outline-none
                    bg-white
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-500
                  "
                >
                  <option value="">Select role</option>

                  <option value="hod">HOD</option>

                  <option value="teacher">Teacher</option>

                  <option value="student">Student</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="
                    w-full
                    px-3.5
                    py-2.5
                    border
                    border-slate-300
                    rounded-lg
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-blue-100
                    focus:border-blue-500
                  "
                />
              </div>

              {/* Information */}
              <div
                className="
                  p-3.5
                  bg-blue-50
                  border
                  border-blue-100
                  rounded-lg
                  text-xs
                  text-blue-700
                "
              >
                The invitation will remain valid for
                <strong> 48 hours</strong>. The invited user will receive a
                private registration link.
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="
                    px-4
                    py-2.5
                    rounded-lg
                    border
                    border-slate-300
                    text-sm
                    font-medium
                    text-slate-700
                    hover:bg-slate-50
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="
                    px-4
                    py-2.5
                    rounded-lg
                    bg-blue-600
                    text-white
                    text-sm
                    font-medium
                    hover:bg-blue-700
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    transition
                  "
                >
                  {creating ? "Creating..." : "Create Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInvitations;
