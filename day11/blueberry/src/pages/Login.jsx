import { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Utensils,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const location = useLocation();

  const { signIn } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // Where the user should go after login
  const redirectTo = location.state?.from || "/explore";

  // -----------------------------------
  // LOGIN
  // -----------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await signIn({
        email: email.trim(),
        password,
      });

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email before logging in.");
      } else if (
        err.message?.toLowerCase().includes("invalid login credentials")
      ) {
        setError("Incorrect email or password.");
      } else {
        setError(err.message || "Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* -------------------------------- */}
      {/* TOP BAR */}
      {/* -------------------------------- */}

      <header className="absolute left-0 right-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <Link
            to="/"
            className="text-2xl font-black tracking-tight text-blue-600"
          >
            blueberry
          </Link>
        </div>
      </header>

      {/* -------------------------------- */}
      {/* CONTENT */}
      {/* -------------------------------- */}

      <main className="grid min-h-screen lg:grid-cols-2">
        {/* -------------------------------- */}
        {/* LEFT BLUE PANEL */}
        {/* -------------------------------- */}

        <div className="relative hidden overflow-hidden bg-blue-600 lg:flex">
          {/* Decorative circles */}

          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />

          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" />

          <div className="relative z-10 flex w-full items-center justify-center p-16">
            <div className="max-w-md text-white">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <Utensils className="h-8 w-8" />
              </div>

              <h1 className="text-5xl font-black leading-tight">
                Welcome back
                <br />
                to Blueberry.
              </h1>

              <p className="mt-6 text-lg leading-8 text-blue-100">
                Your favourite food, your favourite restaurants, and everything
                you crave — all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------- */}
        {/* LOGIN FORM */}
        {/* -------------------------------- */}

        <div className="flex items-center justify-center px-6 py-28">
          <div className="w-full max-w-md">
            {/* Mobile logo */}

            <div className="mb-10 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Utensils className="h-7 w-7 text-blue-600" />
              </div>

              <h1 className="text-3xl font-black text-gray-900">blueberry</h1>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Login to your account
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Continue where you left off.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* SIGNUP */}

            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                state={{
                  from: redirectTo,
                }}
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
