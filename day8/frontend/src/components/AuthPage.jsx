import { useState } from "react";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LogIn,
} from "lucide-react";

import { supabase } from "../services/supabase";

import { useNavigate } from "react-router-dom";

function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  /*
   * =========================
   * VALIDATE EMAIL
   * =========================
   */

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email address is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Enter a valid email address";
    }

    return "";
  };

  /*
   * =========================
   * VALIDATE PASSWORD
   * =========================
   */

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }

    if (password.length < 8) {
      return "Password must contain at least 8 characters";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }

    return "";
  };

  /*
   * =========================
   * FORM SUBMIT
   * =========================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrors({});

    setMessage("");

    const emailError = validateEmail(email);

    const passwordError = validatePassword(password);

    const validationErrors = {};

    if (emailError) {
      validationErrors.email = emailError;
    }

    if (passwordError) {
      validationErrors.password = passwordError;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      return;
    }

    try {
      setLoading(true);

      /*
       * =========================
       * SIGN UP
       * =========================
       */

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        /*
         * If email confirmation is enabled,
         * Supabase may return a user without
         * an active session.
         */

        if (data.user) {
          setMode("signin");

          setPassword("");

          setMessage("Account created successfully. Please sign in.");
        }

        return;
      }

      /*
       * =========================
       * SIGN IN
       * =========================
       */

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      /*
       * Successful login
       */

      navigate("/register");
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================
   * SWITCH MODE
   * =========================
   */

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");

    setEmail("");

    setPassword("");

    setErrors({});

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* LOGO */}

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <h1 className="text-xl font-bold tracking-wide">
              VERIFY
              <span className="text-blue-400">ID</span>
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Secure identity verification
            </p>
          </div>

          {/* CARD */}

          <div className="rounded-2xl border border-white/[0.08] bg-[#0d1321] p-6 shadow-2xl shadow-black/20 sm:p-8">
            {/* TABS */}

            <div className="mb-7 grid grid-cols-2 rounded-xl bg-[#080d17] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrors({});
                  setMessage("");
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                  mode === "signin"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrors({});
                  setMessage("");
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </button>
            </div>

            {/* TITLE */}

            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {mode === "signin"
                  ? "Sign in to continue to your KYC application."
                  : "Create an account to start your KYC application."}
              </p>
            </div>

            {/* MESSAGE */}

            {message && (
              <div className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-400">
                {message}
              </div>
            )}

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (errors.email) {
                        setErrors({
                          ...errors,
                          email: "",
                        });
                      }
                    }}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-[#080d17] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:ring-4 ${
                      errors.email
                        ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (errors.password) {
                        setErrors({
                          ...errors,
                          password: "",
                        });
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border bg-[#080d17] py-3 pl-11 pr-11 text-sm text-white placeholder:text-slate-600 outline-none transition focus:ring-4 ${
                      errors.password
                        ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs text-red-400">{errors.password}</p>
                )}

                {mode === "signup" && (
                  <p className="mt-2 text-[11px] leading-5 text-slate-600">
                    Password must contain at least 8 characters, one uppercase
                    letter, one lowercase letter and one number.
                  </p>
                )}
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}

                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {/* SWITCH */}

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-600">
                {mode === "signin"
                  ? "Don't have an account?"
                  : "Already have an account?"}

                <button
                  type="button"
                  onClick={switchMode}
                  className="ml-1 font-medium text-blue-400 transition hover:text-blue-300"
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          {/* SECURITY NOTE */}

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Authentication secured by Supabase
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
