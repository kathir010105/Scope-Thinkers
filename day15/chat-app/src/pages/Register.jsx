import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MessageCircle,
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../firebase/auth";
import { createUserProfile } from "../firebase/firestore";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [id]: value,
    }));
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    const { displayName, username, email, password, confirmPassword } =
      formData;

    // Validation
    if (!displayName || !username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // 1. Create Firebase Auth account
      const userCredential = await registerUser(email, password);

      const user = userCredential.user;

      // 2. Create Firestore user profile
      await createUserProfile(user.uid, {
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        email: user.email,
        photoURL: "",
        bio: "",
      });

      // 3. Go to the application
      navigate("/app");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak.");
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
            <MessageCircle size={28} strokeWidth={2.2} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#010101]">Create account</h1>

          <p className="mt-2 text-sm text-[#75708C]">
            Join Chatter and start messaging
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl bg-[#C59594]/20 border border-[#C59594] px-4 py-3">
            <p className="text-sm text-[#010101]">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Display Name */}
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-[#010101] mb-2"
            >
              Display name
            </label>

            <div className="relative">
              <User
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75708C]"
              />

              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Your name"
                className="
                  w-full h-12 pl-11 pr-4 rounded-xl
                  border border-[#BFC7DE]
                  bg-[#F8FAFE]
                  text-[#010101]
                  placeholder:text-[#75708C]/60
                  outline-none
                  transition
                  focus:border-[#75708C]
                  focus:ring-2
                  focus:ring-[#75708C]/20
                "
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#010101] mb-2"
            >
              Username
            </label>

            <div className="relative">
              <AtSign
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75708C]"
              />

              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a unique username"
                className="
                  w-full h-12 pl-11 pr-4 rounded-xl
                  border border-[#BFC7DE]
                  bg-[#F8FAFE]
                  text-[#010101]
                  placeholder:text-[#75708C]/60
                  outline-none
                  transition
                  focus:border-[#75708C]
                  focus:ring-2
                  focus:ring-[#75708C]/20
                "
              />
            </div>

            <p className="text-xs text-[#75708C] mt-2">
              This is how other people will find you.
            </p>
          </div>

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
                  text-[#010101]
                  placeholder:text-[#75708C]/60
                  outline-none
                  transition
                  focus:border-[#75708C]
                  focus:ring-2
                  focus:ring-[#75708C]/20
                "
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#010101] mb-2"
            >
              Password
            </label>

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
                placeholder="Create a password"
                className="
                  w-full h-12 pl-11 pr-12 rounded-xl
                  border border-[#BFC7DE]
                  bg-[#F8FAFE]
                  text-[#010101]
                  placeholder:text-[#75708C]/60
                  outline-none
                  transition
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
                  hover:text-[#010101]
                  transition
                "
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#010101] mb-2"
            >
              Confirm password
            </label>

            <div className="relative">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#75708C]"
              />

              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="
                  w-full h-12 pl-11 pr-12 rounded-xl
                  border border-[#BFC7DE]
                  bg-[#F8FAFE]
                  text-[#010101]
                  placeholder:text-[#75708C]/60
                  outline-none
                  transition
                  focus:border-[#75708C]
                  focus:ring-2
                  focus:ring-[#75708C]/20
                "
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="
                  absolute right-4 top-1/2 -translate-y-1/2
                  text-[#75708C]
                  hover:text-[#010101]
                  transition
                "
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* Create Account */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-12 rounded-xl
              bg-[#75708C]
              text-white
              font-semibold
              transition duration-200
              shadow-md
              disabled:opacity-60
              disabled:cursor-not-allowed
              hover:bg-[#010101]
            "
          >
            {loading ? "Creating account..." : "Create account"}
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
            bg-white
            flex items-center justify-center gap-3
            font-medium text-[#010101]
            hover:bg-[#BFC7DE]/30
            transition
          "
        >
          <span className="font-bold text-lg">G</span>
          Continue with Google
        </button>

        {/* Login */}
        <p className="text-center text-sm text-[#75708C] mt-7">
          Already have an account?{" "}
          <Link
            to="/login"
            className="
              font-semibold
              text-[#010101]
              hover:text-[#75708C]
              transition
            "
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
