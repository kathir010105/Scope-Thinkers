import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import {
  Sparkles,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (name.trim().length < 2) {
          throw new Error("Please enter a name with at least 2 characters.");
        }

        if (password.length < 6) {
          throw new Error("Password must contain at least 6 characters.");
        }

        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        await updateProfile(result.user, {
          displayName: name.trim(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      const messages = {
        "auth/email-already-in-use":
          "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/weak-password":
          "Choose a stronger password with at least 6 characters.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed":
          "Network error. Check your internet connection.",
        "auth/operation-not-allowed":
          "Email/password sign-in is disabled in Firebase Console.",
      };

      setError(
        messages[err.code] ||
          err.message ||
          "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-5 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 md:grid-cols-2">
          {/* Left panel */}
          <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-10 text-white md:flex">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/20" />
            <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full border border-white/20" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Sparkles size={25} />
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold">
                  Nova AI
                </h1>
                <p className="text-sm text-blue-100">Your AI workspace</p>
              </div>
            </div>

            <div className="relative py-12">
              <div className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium ring-1 ring-white/20">
                Your ideas, amplified
              </div>
              <h2 className="font-display text-4xl font-extrabold leading-tight">
                Think clearly.
                <br />
                Create boldly.
              </h2>
              <p className="mt-5 max-w-sm leading-7 text-blue-100">
                A smarter workspace for asking questions, exploring ideas, and
                getting things done.
              </p>
            </div>

            <p className="relative text-sm text-blue-100">Powered by Gemini</p>
          </section>

          {/* Form panel */}
          <section className="flex items-center justify-center p-7 sm:p-10 md:p-12">
            <div className="w-full max-w-md">
              <div className="mb-9 flex items-center gap-3 md:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-200">
                  <Sparkles size={23} />
                </div>
                <div>
                  <h1 className="font-display text-xl font-extrabold">
                    Nova AI
                  </h1>
                  <p className="text-sm text-slate-500">Your AI workspace</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Welcome to Nova
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">
                  {isRegister ? "Create your account" : "Welcome back"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isRegister
                    ? "Sign up to start your AI journey."
                    : "Sign in to continue your conversations."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {isRegister && (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      minLength={2}
                      maxLength={80}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        isRegister ? "new-password" : "current-password"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      {isRegister ? "Create account" : "Sign in"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister((value) => !value);
                    setError("");
                  }}
                  className="font-bold text-blue-600 hover:text-blue-800"
                >
                  {isRegister ? "Sign in" : "Create account"}
                </button>
              </p>

              <p className="mt-8 text-center text-xs leading-5 text-slate-400">
                By continuing, you agree to use Nova AI responsibly.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
