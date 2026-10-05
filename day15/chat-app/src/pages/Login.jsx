import { Mail, Lock, Eye, EyeOff, MessageCircle } from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../firebase/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [id]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(email, password);

      navigate("/app");
    } catch (error) {
      console.error(error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#C7DBF7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#75708C] flex items-center justify-center shadow-md">
            <MessageCircle size={28} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#010101]">Welcome back</h1>

          <p className="mt-2 text-sm text-[#75708C]">
            Sign in to continue to Chatter
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl bg-[#C59594]/20 border border-[#C59594] px-4 py-3">
            <p className="text-sm text-[#010101]">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#010101] mb-2"
            >
              Email
            </label>

            <div className="relative">
              <Mail
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75708C]"
              />

              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="
                  w-full h-12 pl-11 pr-4 rounded-xl
                  border border-[#BFC7DE]
                  bg-[#F8FAFE]
                  outline-none
                  focus:border-[#75708C]
                  focus:ring-2
                  focus:ring-[#75708C]/20
                "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#010101]"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-[#75708C] hover:text-[#010101]"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75708C]"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                  w-full h-12 pl-11 pr-12 rounded-xl
                  border border-[#BFC7DE]
                  bg-[#F8FAFE]
                  outline-none
                  focus:border-[#75708C]
                  focus:ring-2
                  focus:ring-[#75708C]/20
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-[#75708C]
                "
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-12 rounded-xl
              bg-[#75708C]
              text-white
              font-semibold
              shadow-md
              hover:bg-[#010101]
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="h-px flex-1 bg-[#BFC7DE]" />

          <span className="text-xs text-[#75708C]">OR</span>

          <div className="h-px flex-1 bg-[#BFC7DE]" />
        </div>

        {/* Google */}
        <button
          type="button"
          className="
            w-full h-12 rounded-xl
            border border-[#BFC7DE]
            flex items-center justify-center gap-3
            font-medium
            hover:bg-[#BFC7DE]/30
            transition
          "
        >
          <span className="font-bold text-lg">G</span>
          Continue with Google
        </button>

        {/* Register */}
        <p className="text-center text-sm text-[#75708C] mt-7">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-[#010101]">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
