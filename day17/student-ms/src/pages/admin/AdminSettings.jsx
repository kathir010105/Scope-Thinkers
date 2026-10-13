import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { auth, db } from "../../firebase/firebase";
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { clearUser } from "../../store/authSlice";
import {
  Card,
  FormField,
  InputField,
  SubmitButton,
  CancelButton,
  LoadingState,
  ErrorState,
  Avatar,
  RoleBadge,
  StatusBadge,
} from "../../components/common";

function AdminSettings() {
  const { profile, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Update Firestore profile
      await updateDoc(doc(db, "users", profile.uid), {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        updatedAt: serverTimestamp(),
      });

      // Update Firebase Auth display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: formData.name.trim() });
      }

      // Update Redux state
      dispatch(setUser({
        user: { ...user, displayName: formData.name.trim() },
        profile: { ...profile, name: formData.name.trim(), phone: formData.phone.trim() },
      }));

      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All password fields are required");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const credential = EmailAuthProvider.credential(auth.currentUser.email, formData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, formData.newPassword);

      setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setSuccess("Password changed successfully");
    } catch (err) {
      console.error("Failed to change password:", err);
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Please log in again to change your password");
      } else {
        setError(err.message || "Failed to change password");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "system", label: "System", icon: Database },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#f8f2ee]">
      <AdminSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] p-5 lg:p-8">
            <div className="mb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e06464]">Administration</p>
              <h1 className="mt-1 text-3xl font-semibold text-[#48252a]">Settings</h1>
              <p className="mt-2 text-sm text-[#8b7774]">Manage your account and system preferences.</p>
            </div>

            {error && <ErrorState message={error} className="mb-5" />}
            {success && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle size={16} /> {success}
              </div>
            )}

            {/* Profile Header */}
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar name={profile?.name || "Admin"} size="h-20 w-20" className="text-2xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-[#48252a]">{profile?.name || "Administrator"}</h2>
                    <RoleBadge role={profile?.role} />
                    <StatusBadge status={profile?.status} />
                  </div>
                  <p className="mt-1 text-sm text-[#8b7774]">{user?.email}</p>
                  <p className="text-xs text-[#b29d96]">UID: {profile?.uid?.slice(0, 12)}...</p>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <div className="mb-6 border-b border-[#eadfd8]">
              <nav className="flex gap-1" role="tablist">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setError(""); setSuccess(""); }}
                      role="tab"
                      aria-selected={isActive}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                        isActive
                          ? "border-[#e06464] text-[#e06464]"
                          : "border-transparent text-[#8b7774] hover:text-[#48252a] hover:border-[#fbc6b9]"
                      }`}
                    >
                      <Icon size={16} /> {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Panels */}
            {activeTab === "profile" && (
              <Card title="Profile Information">
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
                  <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                  <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" disabled />
                  <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" />
                  <div className="pt-4 border-t border-[#eadfd8]">
                    <p className="text-xs text-[#8b7774] mb-3">Role and department cannot be changed from here. Contact system administrator for changes.</p>
                    <FormActions>
                      <SubmitButton loading={saving}>Save Profile</SubmitButton>
                    </FormActions>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === "security" && (
              <Card title="Security Settings">
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                  <InputField label="Current Password" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} required />
                  <InputField label="New Password" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} required helpText="Must be at least 6 characters" />
                  <InputField label="Confirm New Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                  <div className="pt-4 border-t border-[#eadfd8]">
                    <FormActions>
                      <SubmitButton loading={saving}>Change Password</SubmitButton>
                    </FormActions>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card title="Notification Preferences">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#48252a]">Email Notifications</p>
                      <p className="text-xs text-[#8b7774]">Receive email updates for important events</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-[#eadfd8] text-[#e06464] focus:ring-2 focus:ring-[#fbc6b9]/30" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#48252a]">In-App Notifications</p>
                      <p className="text-xs text-[#8b7774]">Show notifications in the app</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-[#eadfd8] text-[#e06464] focus:ring-2 focus:ring-[#fbc6b9]/30" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#48252a]">Marketing Emails</p>
                      <p className="text-xs text-[#8b7774]">Receive product updates and tips</p>
                    </div>
                    <input type="checkbox" className="h-5 w-5 rounded border-[#eadfd8] text-[#e06464] focus:ring-2 focus:ring-[#fbc6b9]/30" />
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "appearance" && (
              <Card title="Appearance">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[#48252a] mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {["Light", "Dark", "System"].map((theme) => (
                        <button
                          key={theme}
                          className={`p-4 rounded-xl border-2 text-sm font-medium transition ${theme === "Light" ? "border-[#e06464] bg-[#fffaf7] text-[#e06464]" : "border-[#eadfd8] hover:border-[#fbc6b9] text-[#8b7774]"}`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#48252a] mb-3">Sidebar Default State</p>
                    <div className="flex gap-3">
                      <button className="flex-1 p-4 rounded-xl border-2 border-[#e06464] bg-[#fffaf7] text-[#e06464] text-sm font-medium">Expanded</button>
                      <button className="flex-1 p-4 rounded-xl border-2 border-[#eadfd8] hover:border-[#fbc6b9] text-sm font-medium text-[#8b7774]">Collapsed</button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "system" && (
              <div className="space-y-5">
                <Card title="System Information">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><dt className="text-[#8b7774]">Application</dt><dd className="font-medium text-[#48252a]">Student Management System</dd></div>
                    <div><dt className="text-[#8b7774]">Version</dt><dd className="font-medium text-[#48252a]">1.0.0</dd></div>
                    <div><dt className="text-[#8b7774]">Firebase Project</dt><dd className="font-medium text-[#48252a]">{import.meta.env.VITE_FIREBASE_PROJECT_ID || "Not configured"}</dd></div>
                    <div><dt className="text-[#8b7774]">Environment</dt><dd className="font-medium text-[#48252a]">{import.meta.env.MODE}</dd></div>
                  </dl>
                </Card>

                <Card title="Danger Zone">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                    <div>
                      <p className="text-sm font-medium text-red-700">Delete Account</p>
                      <p className="text-xs text-red-500">Permanently delete your account and all data. This cannot be undone.</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition">Delete Account</button>
                  </div>
                </Card>
              </div>
            )}

            {/* Logout */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#48252a]">Sign Out</p>
                  <p className="text-xs text-[#8b7774]">End your current session</p>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-[#eadfd8] bg-white text-sm font-medium text-[#e06464] hover:bg-[#fbc6b9]/30 transition">
                  Sign Out
                </button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminSettings;