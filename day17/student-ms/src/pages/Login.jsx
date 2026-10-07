import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LockKeyhole, Mail, Loader2, AlertCircle } from "lucide-react";

import { auth, db } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();

  const { isAuthenticated, profile } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const firebaseUser = credential.user;

      // 2. Get application profile
      const userRef = doc(db, "users", firebaseUser.uid);

      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        await auth.signOut();

        throw new Error("Your account profile was not found.");
      }

      const profileData = userSnapshot.data();

      // 3. Check approval status
      if (profileData.status !== "approved") {
        await auth.signOut();

        if (profileData.status === "pending") {
          throw new Error(
            "Your account is waiting for administrator approval.",
          );
        }

        if (profileData.status === "rejected") {
          throw new Error("Your registration request was rejected.");
        }

        throw new Error("Your account is not active.");
      }

      // 4. Role-based redirect
      switch (profileData.role) {
        case "admin":
          navigate("/admin");
          break;

        case "hod":
          navigate("/hod");
          break;

        case "teacher":
          navigate("/teacher");
          break;

        case "student":
          navigate("/student");
          break;

        default:
          await auth.signOut();

          throw new Error("Your account does not have a valid role.");
      }
    } catch (error) {
      console.error("Login error:", error);

      let message = "Unable to login.";

      if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      }

      if (error.code === "auth/too-many-requests") {
        message = "Too many login attempts. Please try again later.";
      }

      if (error.message?.includes("profile")) {
        message = error.message;
      }

      if (error.message?.includes("approval")) {
        message = error.message;
      }

      if (error.message?.includes("rejected")) {
        message = error.message;
      }

      if (error.message?.includes("active")) {
        message = error.message;
      }

      if (error.message?.includes("valid role")) {
        message = error.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-4">
            <LockKeyhole size={28} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Student Management System
          </h1>

          <p className="mt-2 text-slate-500">Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />

              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Authorized users only
        </p>
      </div>
    </div>
  );
}

export default Login;
