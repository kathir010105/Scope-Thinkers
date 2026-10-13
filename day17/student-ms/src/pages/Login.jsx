import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const firebaseUser = userCredential.user;
      const userSnapshot = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userSnapshot.exists()) {
        await signOut(auth);
        setError(
          "Your account profile was not found. Contact the administrator.",
        );
        return;
      }

      const profile = userSnapshot.data();

      if (profile.status !== "approved") {
        await signOut(auth);
        setError(
          profile.status === "pending"
            ? "Your account is awaiting administrator approval."
            : profile.status === "rejected"
              ? "Your account registration has been rejected."
              : "Your account is not currently active.",
        );
        return;
      }

      const routes = {
        admin: "/admin",
        hod: "/hod",
        teacher: "/teacher",
        student: "/student",
      };

      if (!routes[profile.role]) {
        await signOut(auth);
        setError("Your account does not have a valid role.");
        return;
      }

      navigate(routes[profile.role]);
    } catch (error) {
      console.error("Login error:", error);

      const messages = {
        "auth/invalid-credential": "Invalid email or password.",
        "auth/wrong-password": "Invalid email or password.",
        "auth/user-not-found": "Invalid email or password.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/user-disabled": "This account has been disabled.",
      };

      setError(messages[error.code] || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f2ee] text-[#48252a]">
      <header className="border-b border-[#eadfd8] bg-[#fffaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#48252a] text-[#fbc6b9]">
              <Building2 size={21} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">
                Student Management System
              </p>
              <p className="text-[10px] text-[#8b7774]">
                Academic Administration Portal
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-[10px] font-medium text-[#8b7774] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#e06464]" />
            Secure institutional access
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-78px)] max-w-[1500px] items-center justify-center px-5 py-10 lg:px-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#eadfd8] bg-[#fffaf7] shadow-[0_24px_80px_rgba(72,37,42,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden overflow-hidden bg-[#48252a] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#e06464]/20" />
            <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#f1745e]/15" />

            <div className="relative">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e06464]">
                <GraduationCap size={25} strokeWidth={1.8} />
              </div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#fbc6b9]">
                One platform. Every role.
              </p>

              <h2 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-tight xl:text-5xl">
                Manage your academic world from one place.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-[#f8e8e3]/70">
                A focused digital workspace for administrators, HODs, teachers
                and students.
              </p>
            </div>

            <div className="relative grid grid-cols-2 gap-3">
              {[
                ["01", "Role-based access"],
                ["02", "Academic records"],
                ["03", "Attendance"],
                ["04", "Performance"],
              ].map(([number, label]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-[10px] font-semibold text-[#fbc6b9]">
                    {number}
                  </p>
                  <p className="mt-2 text-xs text-white/80">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-7 sm:p-10 lg:p-12 xl:p-14">
            <div className="mb-8">
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbc6b9]/45 text-[#48252a]">
                <ShieldCheck size={22} strokeWidth={1.8} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e06464]">
                Authorized access
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#48252a]">
                Welcome back.
              </h1>
              <p className="mt-2 text-sm text-[#8b7774]">
                Sign in to continue to your workspace.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-[#e06464]/25 bg-[#fbc6b9]/25 px-4 py-3 text-xs leading-5 text-[#8b3e46]">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#48252a]">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b99f96]"
                    size={17}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@institution.edu"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-[#eadfd8] bg-white pl-11 pr-4 text-sm text-[#48252a] outline-none transition placeholder:text-[#b99f96] focus:border-[#e06464] focus:ring-4 focus:ring-[#fbc6b9]/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#48252a]">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b99f96]"
                    size={17}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-[#eadfd8] bg-white pl-11 pr-12 text-sm text-[#48252a] outline-none transition placeholder:text-[#b99f96] focus:border-[#e06464] focus:ring-4 focus:ring-[#fbc6b9]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b7774] hover:text-[#48252a]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e06464] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(224,100,100,0.22)] transition hover:bg-[#d65757] hover:shadow-[0_12px_28px_rgba(224,100,100,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 border-t border-[#eadfd8] pt-6">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#e06464]"
              />
              <div>
                <p className="text-xs font-semibold text-[#48252a]">
                  Authorized users only
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#8b7774]">
                  Access is controlled by your approved institutional role.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Login;
