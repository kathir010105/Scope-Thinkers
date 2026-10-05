import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../firebase/config";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email.trim());

      setMessage("Password reset email sent. Check your inbox.");

      setEmail("");
    } catch (error) {
      console.error("Password reset error:", error);

      if (error.code === "auth/user-not-found") {
        setError("No account exists with this email.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Unable to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#C7DBF7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#BFC7DE] shadow-xl p-8">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#C7DBF7] flex items-center justify-center mb-6">
            <Mail size={26} className="text-[#75708C]" />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-[#010101]">
              Forgot password?
            </h1>

            <p className="text-sm text-[#75708C] mt-2">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#010101] mb-2">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#75708C]
                  "
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="
                    w-full
                    h-12
                    pl-11
                    pr-4
                    rounded-xl
                    bg-[#F8FAFE]
                    border
                    border-[#BFC7DE]
                    outline-none
                    text-sm
                    text-[#010101]
                    focus:border-[#75708C]
                    focus:ring-2
                    focus:ring-[#75708C]/20
                  "
                />
              </div>
            </div>

            {/* Success */}
            {message && (
              <div className="p-3 rounded-xl bg-[#C7DBF7] text-sm text-[#010101]">
                {message}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-[#C59594]/20 text-sm text-[#010101]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                h-12
                rounded-xl
                bg-[#75708C]
                text-white
                font-medium
                flex
                items-center
                justify-center
                gap-2
                hover:bg-[#010101]
                transition
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send size={18} />
                  Send reset link
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-7 pt-6 border-t border-[#BFC7DE]">
            <Link
              to="/login"
              className="
                flex
                items-center
                justify-center
                gap-2
                text-sm
                font-medium
                text-[#75708C]
                hover:text-[#010101]
                transition
              "
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
