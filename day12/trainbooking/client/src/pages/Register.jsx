import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithCustomToken } from "firebase/auth";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { auth } from "../services/firebase";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setSendingOtp(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setOtpSent(true);
      setMessage("OTP sent successfully. Check your email.");

      setResendCooldown(60);

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError(error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setEmailVerified(true);
      setMessage("Email verified successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!emailVerified) {
      setError("Please verify your email first.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setRegistering(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      // Sign the user into Firebase
      await signInWithCustomToken(auth, data.token);

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-32">
      <div className="mx-auto max-w-2xl">
        {/* Header */}

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
            <User size={28} className="text-red-700" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Create your RailBook account
          </h1>

          <p className="mt-2 text-slate-500">
            Register to book and manage your train journeys.
          </p>
        </div>

        {/* Form */}

        <form
          onSubmit={handleRegister}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Username */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          {/* Full Name */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name as per Government ID
            </label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Email */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleChange(e);

                    if (emailVerified) {
                      setEmailVerified(false);
                    }
                  }}
                  placeholder="you@example.com"
                  required
                  disabled={emailVerified}
                  className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                />
              </div>

              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || resendCooldown > 0}
                  className="shrink-0 rounded-xl bg-red-800 px-5 py-3 font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : resendCooldown > 0 ? (
                    `${resendCooldown}s`
                  ) : otpSent ? (
                    "Resend"
                  ) : (
                    "Send OTP"
                  )}
                </button>
              )}

              {emailVerified && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={18} />
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* OTP */}

          {otpSent && !emailVerified && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Enter 6-digit OTP
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    setOtp(value);
                    setError("");
                  }}
                  placeholder="123456"
                  className="flex-1 rounded-xl border border-red-200 bg-white px-4 py-3.5 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otp.length !== 6}
                  className="rounded-xl bg-red-800 px-5 font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyingOtp ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                The OTP expires in 5 minutes.
              </p>
            </div>
          )}

          {/* Mobile */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mobile Number
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          {/* Password */}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-12 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">Minimum 8 characters.</p>
          </div>

          {/* Confirm Password */}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-12 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Status */}

          {message && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={18} />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={registering || !emailVerified}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-800 py-3.5 font-semibold text-white transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {registering ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Create Account
              </>
            )}
          </button>

          {!emailVerified && (
            <p className="mt-3 text-center text-xs text-slate-500">
              Verify your email before creating your account.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Register;
