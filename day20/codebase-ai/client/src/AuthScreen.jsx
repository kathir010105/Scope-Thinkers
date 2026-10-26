import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage("Password reset email sent. Check your inbox.");
        return;
      }

      if (mode === "register") {
        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        await updateProfile(credential.user, {
          displayName: name.trim(),
        });

        setMessage("Account created successfully.");
        return;
      }

      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/weak-password": "Choose a stronger password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/network-request-failed": "Network error. Check your connection.",
        "auth/user-not-found": "No account exists with this email.",
      };

      setError(messages[err.code] || err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  const heading =
    mode === "register"
      ? "Create your account"
      : mode === "reset"
        ? "Reset your password"
        : "Welcome back";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1B1931] px-4 py-10 text-[#FFF8F5]">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#242039] p-7 shadow-2xl sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ED9659] text-[#1B1931]">
            <span className="text-xl font-black">C.</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">
              CodeBase<span className="text-[#ED9659]">.</span>AI
            </h1>
            <p className="mt-1 text-xs text-[#B8B0C7]">
              Your developer knowledge base
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold">{heading}</h2>
        <p className="mt-2 text-sm text-[#B8B0C7]">
          {mode === "register"
            ? "Create an account to get started."
            : mode === "reset"
              ? "We'll email you a password reset link."
              : "Sign in to continue to your workspace."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {mode === "register" && (
            <label className="block text-sm">
              Full name
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#1B1931] px-4 py-3 outline-none focus:border-[#ED9659]"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="block text-sm">
            Email address
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#1B1931] px-4 py-3 outline-none focus:border-[#ED9659]"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {mode !== "reset" && (
            <label className="block text-sm">
              Password
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#1B1931] px-4 py-3 outline-none focus:border-[#ED9659]"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                minLength={6}
                required
              />
            </label>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-xl bg-green-500/10 p-3 text-sm text-green-300"
            >
              {message}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-[#ED9659] px-4 py-3 font-semibold text-[#1B1931] transition hover:brightness-110 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "register"
                ? "Create account"
                : mode === "reset"
                  ? "Send reset email"
                  : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-[#EBCBC9]">
          {mode === "login" && (
            <>
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                  setMessage("");
                }}
                type="button"
              >
                Create account
              </button>
              <button
                onClick={() => {
                  setMode("reset");
                  setError("");
                  setMessage("");
                }}
                type="button"
              >
                Forgot password?
              </button>
            </>
          )}

          {mode !== "login" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Back to sign in
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
