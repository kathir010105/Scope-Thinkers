import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, GitBranch, Loader2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await signIn(form.email, form.password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Branding */}
        <div className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.15),transparent_35%)]" />

          <div className="relative flex w-full flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e] text-black">
                <GitBranch size={20} />
              </div>

              <span className="font-semibold tracking-tight">Flow</span>
            </div>

            <div className="max-w-lg">
              <p className="mb-4 text-sm font-medium text-[#4ade80]">
                PROJECT WORKSPACE
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">
                Build.
                <br />
                Ship.
                <br />
                <span className="text-[#4ade80]">Keep moving.</span>
              </h1>

              <p className="mt-6 max-w-md text-sm leading-6 text-white/40">
                Manage projects, organize tasks, and keep your team moving from
                idea to completion.
              </p>
            </div>

            <p className="text-xs text-white/20">
              Your workspace. Your projects. Your flow.
            </p>
          </div>
        </div>

        {/* Login */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22c55e] text-black">
                  <GitBranch size={20} />
                </div>

                <span className="font-semibold">Flow</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-sm text-[#4ade80]">Welcome back</p>

              <h2 className="text-3xl font-semibold tracking-tight">
                Sign in to Flow
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Continue managing your projects.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/3 px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-[#22c55e]/60 focus:ring-1 focus:ring-[#22c55e]/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/3 px-4 py-3 text-sm outline-none transition placeholder:text-white/20 focus:border-[#22c55e]/60 focus:ring-1 focus:ring-[#22c55e]/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#22c55e] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#4ade80] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-white/40">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-[#4ade80] hover:text-[#86efac]"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
