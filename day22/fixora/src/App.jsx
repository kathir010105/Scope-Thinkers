import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cpu,
  FileText,
  Headphones,
  ImagePlus,
  Laptop,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Monitor,
  Plus,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  Wrench,
  X,
Check,
Circle,
CircleCheck,
UserRound,
} from "lucide-react";

import {
  isSupabaseConfigured,
  supabase,
} from "./lib/supabase";
import RepairAssistant from "./components/RepairAssistant.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import TechnicianDashboard from "./components/TechnicianDashboard.jsx";

const CATEGORIES = [
  { value: "hardware", label: "Hardware issue" },
  { value: "software", label: "Software issue" },
  { value: "battery", label: "Battery problem" },
  { value: "screen", label: "Screen or display" },
  { value: "network", label: "Connectivity" },
  { value: "performance", label: "Slow performance" },
  { value: "other", label: "Other issue" },
];

const STATUSES = {
  submitted: {
    label: "Submitted",
    className: "bg-[#edf2fa] text-[#3f567f]",
  },
  awaiting_assignment: {
    label: "Awaiting assignment",
    className: "bg-[#fff4e5] text-[#9a6416]",
  },
  assigned: {
    label: "Technician assigned",
    className: "bg-[#f6eaf7] text-[#8c4a95]",
  },
  visit_scheduled: {
    label: "Visit scheduled",
    className: "bg-[#f6eaf7] text-[#8c4a95]",
  },
  in_progress: {
    label: "In progress",
    className: "bg-[#fff0ed] text-[#c34d39]",
  },
  awaiting_customer: {
    label: "Awaiting customer",
    className: "bg-[#fff4e5] text-[#9a6416]",
  },
  resolved: {
    label: "Resolved",
    className: "bg-[#e8f5ef] text-[#24745e]",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-[#f1eff4] text-[#777187]",
  },
};

const formatDate = (value) => {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatCategory = (category) =>
  CATEGORIES.find((item) => item.value === category)?.label ??
  "Other issue";

const formatDevice = (request) => {
  const type =
    request.device_type === "laptop" ? "Laptop" : "Mobile";

  const details = [
    request.device_brand,
    request.device_model,
  ]
    .filter(Boolean)
    .join(" ");

  return details ? `${type} · ${details}` : type;
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "CU";

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

function SetupScreen() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#f1edf6] p-6">
      <div className="w-full max-w-xl rounded-[22px] border border-[#ded7e8] bg-white p-8 shadow-xl sm:p-10">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#d174d2] to-[#e0563f] text-white shadow-[0_5px_16px_rgba(209,116,210,0.22)]">
          <Wrench size={23} />
        </div>

        <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.9px] text-[#9a6aa5]">FIXORA AI · SETUP</p>

        <h1>Connect your workspace.</h1>

        <p className="text-[13px] leading-[1.8] text-[#716b85]">
          Add your Supabase project URL and publishable key
          to your local .env.local file.
        </p>

        <div className="my-5 overflow-x-auto rounded-xl bg-[#f1edf6] p-4 font-mono text-xs leading-6 text-[#412653]">
          VITE_SUPABASE_URL=your_project_url
          <br />
          VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
        </div>

        <p className="text-[13px] leading-[1.8] text-[#716b85]">
          Restart the Vite development server after updating
          your environment variables.
        </p>
      </div>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (isSignup && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error: signupError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name.trim(),
              },
            },
          });

        if (signupError) throw signupError;

        if (data.session) {
          setMessage("Account created successfully.");
        } else {
          setMessage(
            "Account created. Check your email to confirm your address, then sign in."
          );
          setMode("login");
        }
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) throw loginError;
      }
    } catch (err) {
      setError(
        err.message || "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_0.85fr]">
      <div className="relative hidden min-h-screen flex-col overflow-hidden bg-[#412653] px-10 py-8 text-white lg:flex xl:px-16">
        <nav className="relative z-10 flex items-center justify-between">
          <a className="inline-flex items-center gap-2.5 font-[Manrope,sans-serif] text-2xl font-extrabold tracking-[-1.3px] text-[#412653] text-white" href="#">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#d174d2] to-[#e0563f] text-white shadow-[0_5px_16px_rgba(209,116,210,0.22)]">
              <Wrench size={20} />
            </span>
            <span>fixora<span className="text-[#e0563f]">.</span></span>
          </a>

          <span className="text-xs font-semibold tracking-wide text-white/70">
            YOUR DEVICE. OUR EXPERTISE.
          </span>
        </nav>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
            <span className="inline-block h-2 w-2 rounded-full bg-[#d174d2] shadow-[0_0_0_5px_rgba(209,116,210,0.18)]" />
            SMARTER REPAIRS START HERE
          </div>

          <h1>
            Your tech.
            <br />
            <span>Back to life.</span>
          </h1>

          <p>
            Reliable laptop and mobile repairs, brought
            straight to your doorstep.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 text-sm leading-6 text-white/80">
              <ShieldCheck size={19} />
              <span>Trusted service</span>
            </div>

            <div className="flex items-start gap-3 text-sm leading-6 text-white/80">
              <MapPin size={19} />
              <span>At-home visits</span>
            </div>

            <div className="flex items-start gap-3 text-sm leading-6 text-white/80">
              <Sparkles size={19} />
              <span>AI-assisted support</span>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 overflow-hidden">
          <div className="absolute rounded-full border border-white/10 -bottom-40 -left-16 h-96 w-96" />
          <div className="absolute rounded-full border border-white/10 -bottom-52 right-[-3rem] h-[30rem] w-[30rem]" />

          <span>REPAIR SMARTER.</span>
          <span>LIVE BETTER.</span>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#d174d2] to-[#e0563f] text-white shadow-[0_5px_16px_rgba(209,116,210,0.22)]">
              <Wrench size={20} />
            </span>
            <span>fixora<span className="text-[#e0563f]">.</span></span>
          </div>

          <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.9px] text-[#9a6aa5]">
            {isSignup ? "GET STARTED" : "WELCOME BACK"}
          </p>

          <h2>
            {isSignup ? "Create your account." : "Good to see you."}
          </h2>

          <p className="text-[13px] leading-[1.8] text-[#716b85] mb-7 mt-3">
            {isSignup
              ? "Create an account to manage your repair requests."
              : "Sign in to track your repairs and home visits."}
          </p>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#f1edf6] p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-bold text-[#716b85] transition ${!isSignup ? "bg-white text-[#412653] shadow-sm" : "hover:text-[#412653]"}`}
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-bold text-[#716b85] transition ${isSignup ? "bg-white text-[#412653] shadow-sm" : "hover:text-[#412653]"}`}
              onClick={() => {
                setMode("signup");
                setError("");
                setMessage("");
              }}
            >
              Create account
            </button>
          </div>

          {error && <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 border-red-200 bg-red-50 text-red-700">{error}</div>}

          {message && (
            <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 border-emerald-200 bg-emerald-50 text-emerald-700">{message}</div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5">
            {isSignup && (
              <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
                <span>Full name</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            )}

            <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
              <span>Email address</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
              <span>Password</span>
              <input
                type="password"
                autoComplete={
                  isSignup ? "new-password" : "current-password"
                }
                placeholder="At least 8 characters"
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </label>

            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-transparent px-[17px] text-xs font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 bg-[#412653] text-white shadow-sm hover:bg-[#523269] hover:-translate-y-px mt-1 w-full"
              disabled={loading}
              type="submit"
            >
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-6 text-[#716b85]">
            By continuing, you agree to use Fixora AI responsibly.
            Your account and repair requests are protected by
            authentication and database access policies.
          </p>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  user,
  activePage,
  onNavigate,
  onLogout,
  mobileOpen,
  onClose,
}) {
  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Customer";

  const items = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      page: "overview",
    },
    {
      label: "My repairs",
      icon: Wrench,
      page: "repairs",
    },
  ];

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-[#21152b]/40 transition-opacity lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-[#ded7e8] bg-white px-5 py-6 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between">
          <a className="inline-flex items-center gap-2.5 font-[Manrope,sans-serif] text-2xl font-extrabold tracking-[-1.3px] text-[#412653]" href="#" onClick={(event) => {
            event.preventDefault();
            onNavigate("overview");
          }}>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#d174d2] to-[#e0563f] text-white shadow-[0_5px_16px_rgba(209,116,210,0.22)]">
              <Wrench size={20} />
            </span>

            <span>
              fixora<span className="text-[#e0563f]">.</span>
            </span>
          </a>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded7e8] bg-white text-[#526a8a] transition hover:bg-[#f1edf6] hover:text-[#412653] lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mb-3 px-3 text-[10px] font-bold tracking-[1.8px] text-[#8f899f]">WORKSPACE</div>

        <nav className="grid gap-2">
          {items.map(({ label, icon: Icon, page }) => (
            <button
              key={page}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition hover:bg-[#f1edf6] hover:text-[#412653] ${activePage === page ? "bg-[#f6eaf7] text-[#412653]" : "text-[#777187]"}`}
              onClick={() => {
                onNavigate(page);
                onClose();
              }}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-[#f0e5f2] bg-[#fbf4fc] p-4">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#aa54b2]">
            <Headphones size={20} />
          </div>

          <p className="mb-1 text-sm font-bold text-[#412653]">
            Need a hand?
          </p>

          <p className="mb-4 text-xs leading-5 text-[#716b85]">
            Manage a repair request from your dashboard.
          </p>

          <button
            className="inline-flex items-center gap-2 text-xs font-bold text-[#aa54b2] hover:text-[#412653]"
            onClick={() => {
              onNavigate("repairs");
              onClose();
            }}
          >
            View my repairs <ArrowRight size={15} />
          </button>
        </div>

        <div className="mt-6 border-t border-[#ded7e8] pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1e4f4] text-sm font-bold text-[#412653]">
              {getInitials(fullName)}
            </div>

            <div className="min-w-0 flex-1">
              <strong>{fullName}</strong>
              <span>Customer</span>
            </div>

            <ChevronDown size={16} className="text-[#8f899f]" />
          </div>

          <button className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#716b85] hover:bg-red-50 hover:text-red-600" onClick={onLogout}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function StatCard({ title, value, description, icon: Icon, accent }) {
  return (
    <article className="rounded-2xl border border-[#ded7e8] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-[#716b85]">{title}</span>

        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={20} strokeWidth={1.8} />
        </span>
      </div>

      <div className="font-[Manrope,sans-serif] text-3xl font-extrabold tracking-tight text-[#412653]">{value}</div>

      <p className="mt-2 text-xs leading-5 text-[#716b85]">{description}</p>
    </article>
  );
}

function StatusBadge({ status }) {
  const item = STATUSES[status] || STATUSES.submitted;

  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold ${item.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}

function RequestCard({ request, onClick }) {
  const Icon =
    request.device_type === "laptop" ? Laptop : Smartphone;

  return (
    <button
      type="button"
      className="group flex min-w-0 items-center gap-4 rounded-2xl border border-[#ded7e8] bg-white p-4 shadow-sm transition hover:border-[#d9b6df] hover:shadow-md sm:p-5"
      onClick={() => onClick(request)}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1edf6] text-[#526a8a]">
        <Icon size={22} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3>{formatDevice(request)}</h3>
          <span className="rounded-md bg-[#f1edf6] px-2 py-1 font-mono text-[10px] text-[#716b85]">
            #{request.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#716b85]">
          {request.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#716b85]">
          <span>
            <CalendarDays size={14} />
            {formatDate(request.created_at)}
          </span>

          <span>
            <Wrench size={14} />
            {formatCategory(request.category)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-3">
        <StatusBadge status={request.status} />
        <ArrowRight size={17} className="text-[#8f899f] transition group-hover:translate-x-1 group-hover:text-[#aa54b2]" />
      </div>
    </button>
  );
}

function EmptyState({ onCreateRequest }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#f6eaf7] text-[#aa54b2]">
        <Monitor size={35} strokeWidth={1.5} />
        <span>
          <Plus size={17} />
        </span>
      </div>

      <h3>Your repair journey starts here.</h3>

      <p>
        No repair requests yet. Tell us what's wrong with
        your device and we'll help you figure out the next step.
      </p>

      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-transparent px-[17px] text-xs font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 bg-[#412653] text-white shadow-sm hover:bg-[#523269] hover:-translate-y-px"
        onClick={onCreateRequest}
      >
        <Plus size={18} />
        Create your first request
      </button>
    </div>
  );
}

function RequestModal({ onClose, onCreated, initialDraft }) {
  const [deviceType, setDeviceType] = useState(initialDraft?.deviceType || "laptop");
  const [brand, setBrand] = useState(initialDraft?.brand || "");
  const [model, setModel] = useState(initialDraft?.model || "");
  const [category, setCategory] = useState(initialDraft?.category || "hardware");
  const [description, setDescription] = useState(initialDraft?.description || "");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (description.trim().length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }

    if (address.trim().length < 5) {
      setError("Please enter a valid service address.");
      return;
    }

    if (image && image.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      return;
    }

    if (image && !["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    setLoading(true);

    let uploadedPath = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      if (image) {
        const extensionMap = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };

        const extension = extensionMap[image.type];
        const fileName = `${crypto.randomUUID()}.${extension}`;

        uploadedPath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("service-request-images")
          .upload(uploadedPath, image, {
            contentType: image.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;
      }

      const { data, error: insertError } = await supabase
        .from("service_requests")
        .insert({
          user_id: user.id,
          device_type: deviceType,
          device_brand: brand.trim() || null,
          device_model: model.trim() || null,
          category,
          description: description.trim(),
          service_address: address.trim(),
          preferred_visit_at: preferredDate
            ? new Date(preferredDate).toISOString()
            : null,
          image_path: uploadedPath,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onCreated(data);
    } catch (err) {
      if (uploadedPath) {
        await supabase.storage
          .from("service-request-images")
          .remove([uploadedPath]);
      }

      setError(
        err.message ||
          "We couldn't submit your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#21152b]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !loading) {
        onClose();
      }
    }}>
      <section
        className="my-auto w-full max-w-2xl overflow-hidden rounded-[22px] border border-[#ded7e8] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#ded7e8] px-6 py-5 sm:px-8">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.9px] text-[#9a6aa5]">NEW SERVICE REQUEST</p>
            <h2 id="request-modal-title">Let's fix it.</h2>
            <p className="text-[13px] leading-[1.8] text-[#716b85]">
              Tell us what happened. We'll help with the next step.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded7e8] bg-white text-[#526a8a] transition hover:bg-[#f1edf6] hover:text-[#412653]"
            onClick={onClose}
            disabled={loading}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 px-6 py-6 sm:px-8">
          <div className="grid gap-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#412653]">01 · YOUR DEVICE</label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`relative flex min-w-0 items-center gap-3 rounded-xl border border-[#ded7e8] p-4 text-left transition hover:border-[#d174d2] ${
                  deviceType === "laptop" ? "border-[#d174d2] bg-[#fbf4fc] ring-2 ring-[#d174d2]/20" : "bg-white"
                }`}
                onClick={() => setDeviceType("laptop")}
              >
                <Laptop size={22} />
                <span>
                  <strong>Laptop</strong>
                  <small>Notebook or computer</small>
                </span>

                {deviceType === "laptop" && (
                  <CheckCircle2 size={18} className="ml-auto text-[#aa54b2]" />
                )}
              </button>

              <button
                type="button"
                className={`relative flex min-w-0 items-center gap-3 rounded-xl border border-[#ded7e8] p-4 text-left transition hover:border-[#d174d2] ${
                  deviceType === "mobile" ? "border-[#d174d2] bg-[#fbf4fc] ring-2 ring-[#d174d2]/20" : "bg-white"
                }`}
                onClick={() => setDeviceType("mobile")}
              >
                <Smartphone size={22} />
                <span>
                  <strong>Mobile</strong>
                  <small>Phone or smartphone</small>
                </span>

                {deviceType === "mobile" && (
                  <CheckCircle2 size={18} className="ml-auto text-[#aa54b2]" />
                )}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
                <span>Manufacturer (optional)</span>
                <input
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  placeholder="e.g. Samsung, Apple, Lenovo"
                  maxLength={100}
                />
              </label>

              <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
                <span>Model (optional)</span>
                <input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Device model"
                  maxLength={100}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#412653]">02 · THE PROBLEM</label>

            <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
              <span>Problem category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
              <span>Describe what's happening</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the symptoms, when the problem started, and anything you've already tried..."
                rows={4}
                minLength={10}
                maxLength={5000}
                required
              />

              <small className="text-[11px] leading-5 text-[#716b85]">
                {description.length}/5000 characters
              </small>
            </label>

            <label className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#ded7e7] bg-[#f8f4fb] p-5 text-center hover:border-[#d174d2]">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setImage(event.target.files?.[0] || null)
                }
                hidden
              />

              {image ? (
                <>
                  <CheckCircle2 size={23} />
                  <span>
                    <strong>{image.name}</strong>
                    <small>
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </span>
                  <button
                    type="button"
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow"
                    onClick={(event) => {
                      event.preventDefault();
                      setImage(null);
                    }}
                  >
                    <X size={17} />
                  </button>
                </>
              ) : (
                <>
                  <ImagePlus size={24} />
                  <span>
                    <strong>Add a device photograph</strong>
                    <small>JPEG, PNG, or WebP · Maximum 5 MB</small>
                  </span>
                  <Upload size={18} className="mb-1 text-[#aa54b2]" />
                </>
              )}
            </label>
          </div>

          <div className="grid gap-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[#412653]">03 · HOME VISIT</label>

            <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
              <span>Service address in Chennai</span>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="House / flat, street, area, Chennai, PIN code"
                rows={3}
                maxLength={500}
                required
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-[#526a8a]">
              <span>Preferred visit date and time (optional)</span>
              <input
                type="datetime-local"
                value={preferredDate}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16)}
                onChange={(event) => setPreferredDate(event.target.value)}
              />

              <small className="text-[11px] leading-5 text-[#716b85]">
                This is a preference, not a confirmed appointment.
              </small>
            </label>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-[#edf2fa] p-4 text-xs leading-5 text-[#3f567f]">
            <ShieldCheck size={18} />
            <p>
              If your device has a swollen battery, emits smoke,
              or smells like burning, stop using it and keep away
              from it. Don't attempt to open or charge it.
            </p>
          </div>

          {error && <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 border-red-200 bg-red-50 text-red-700">{error}</div>}

          <div className="flex items-center justify-end gap-3 border-t border-[#ded7e8] px-6 py-4 sm:px-8">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-transparent px-[17px] text-xs font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 border border-[#ded7e8] bg-white text-[#412653] hover:bg-[#f1edf6]"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-transparent px-[17px] text-xs font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 bg-[#412653] text-white shadow-sm hover:bg-[#523269] hover:-translate-y-px"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit repair request"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function RequestDetailsModal({ request, onClose }) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [technician, setTechnician] = useState(null);
const [history, setHistory] = useState([]);
const [trackingError, setTrackingError] = useState("");
useEffect(() => {
  let active = true;

  async function loadTrackingDetails() {
    setTrackingError("");

    const [historyResult, technicianResult] = await Promise.all([
      supabase
        .from("repair_status_history")
        .select("id,old_status,new_status,changed_by,created_at")
        .eq("request_id", request.id)
        .order("created_at", { ascending: true }),

      request.technician_id
        ? supabase
            .from("profiles")
            .select("id,full_name,email,phone")
            .eq("id", request.technician_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (!active) return;

    if (historyResult.error) {
      setTrackingError(historyResult.error.message);
    } else {
      setHistory(historyResult.data || []);
    }

    if (technicianResult.error) {
      console.error(
        "Unable to load assigned technician:",
        technicianResult.error
      );
    }

    setTechnician(technicianResult.data || null);
  }

  loadTrackingDetails();

  const channel = supabase
    .channel(`repair-tracking-${request.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "repair_status_history",
        filter: `request_id=eq.${request.id}`,
      },
      () => loadTrackingDetails()
    )
    .subscribe();

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}, [request.id, request.technician_id]);

  useEffect(() => {
    let active = true;

    async function loadImage() {
      if (!request.image_path) return;

      const { data, error } = await supabase.storage
        .from("service-request-images")
        .createSignedUrl(request.image_path, 300);

      if (!active) return;

      if (error) {
        setImageError("Unable to load this image.");
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadImage();

    return () => {
      active = false;
    };
  }, [request.image_path]);

  const labelClass =
    "mb-2 block text-[10px] font-bold uppercase tracking-[1.2px] text-[#817995]";
  const valueClass = "break-words text-[15px] leading-6 text-[#342b43]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#21152b]/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="my-auto flex max-h-[min(92vh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] border border-[#ded7e8] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-details-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5deed] px-5 py-5 sm:px-8">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.9px] text-[#a268ad]">
              REQUEST #{request.id.slice(0, 8).toUpperCase()}
            </p>
            <h2
              id="request-details-title"
              className="m-0 font-[Manrope,sans-serif] text-xl font-semibold tracking-[-0.5px] text-[#342b43] sm:text-[22px]"
            >
              Repair details
            </h2>
          </div>

          <button
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#ded7e8] bg-white text-[#526a8a] transition hover:border-[#d174d2] hover:bg-[#f8f1fa] hover:text-[#412653]"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-5 sm:p-8">
            <div className="mb-7 flex items-center gap-4 rounded-[18px] bg-[#f1edf6] p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white text-[#3f567f]">
                {request.device_type === "laptop" ? (
                  <Laptop size={25} />
                ) : (
                  <Smartphone size={25} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="mb-1 break-words font-[Manrope,sans-serif] text-base font-semibold text-[#342b43] sm:text-lg">
                  {formatDevice(request)}
                </h3>
                <p className="m-0 text-sm text-[#716b85]">
                  {formatCategory(request.category)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <span className={labelClass}>Current status</span>
              <StatusBadge status={request.status} />
            </div>
            {/* Repair progress */}
<div className="mb-7 rounded-2xl border border-[#ded7e8] bg-[#fcfaff] p-5">
  <div className="mb-5 flex items-center gap-2">
    <Activity size={19} className="text-[#aa54b2]" />

    <h3 className="text-sm font-bold text-[#412653]">
      Repair progress
    </h3>
  </div>

  {trackingError && (
    <p className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
      Unable to load the full status history: {trackingError}
    </p>
  )}

  {history.length === 0 ? (
    <p className="text-xs leading-5 text-[#716b85]">
      No status history is available yet. Your current repair
      status is shown above.
    </p>
  ) : (
    <div className="space-y-0">
      {history.map((item, index) => {
        const statusInfo =
          STATUSES[item.new_status] || STATUSES.submitted;

        const isLatest = index === history.length - 1;

        return (
          <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
            <div className="relative flex w-5 shrink-0 justify-center">
              {!isLatest && (
                <span className="absolute top-5 h-full w-px bg-[#ded7e8]" />
              )}

              <span
                className={`relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                  isLatest
                    ? "bg-[#412653] text-white"
                    : "border border-[#d9b6df] bg-white text-[#aa54b2]"
                }`}
              >
                {isLatest ? (
                  <CircleCheck size={13} />
                ) : (
                  <Check size={12} />
                )}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-xs font-bold text-[#412653]">
                  {statusInfo.label}
                </strong>

                {isLatest && (
                  <span className="rounded-full bg-[#f6eaf7] px-2 py-0.5 text-[9px] font-bold text-[#8c4a95]">
                    CURRENT
                  </span>
                )}
              </div>

              <p className="mt-1 text-[11px] text-[#716b85]">
                {formatDateTime(item.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

{/* Assigned technician */}
<div className="mb-7 rounded-2xl border border-[#ded7e8] bg-white p-5">
  <div className="mb-4 flex items-center gap-2">
    <UserRound size={19} className="text-[#aa54b2]" />

    <h3 className="text-sm font-bold text-[#412653]">
      Your technician
    </h3>
  </div>

  {technician ? (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1e4f4] text-sm font-bold text-[#412653]">
        {getInitials(technician.full_name || "Technician")}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-[#412653]">
          {technician.full_name || "Assigned technician"}
        </p>

        {technician.phone && (
          <p className="mt-1 text-xs text-[#716b85]">
            Phone: {technician.phone}
          </p>
        )}

        {technician.email && (
          <p className="mt-1 break-all text-xs text-[#716b85]">
            Email: {technician.email}
          </p>
        )}

        {request.assigned_at && (
          <p className="mt-2 text-[10px] text-[#91889e]">
            Assigned {formatDateTime(request.assigned_at)}
          </p>
        )}
      </div>
    </div>
  ) : (
    <p className="text-xs leading-5 text-[#716b85]">
      {request.technician_id
        ? "Loading technician details..."
        : "A technician has not been assigned yet. We'll update this section when one is assigned."}
    </p>
  )}
</div>

{/* Visit appointment */}
<div className="mb-6 rounded-2xl border border-[#ded7e8] bg-white p-5">
  <div className="mb-3 flex items-center gap-2">
    <CalendarDays size={19} className="text-[#3f567f]" />

    <h3 className="text-sm font-bold text-[#412653]">
      Home visit
    </h3>
  </div>

  <p className="text-sm font-semibold text-[#412653]">
    {formatDateTime(request.preferred_visit_at)}
  </p>

  <p className="mt-1 text-xs leading-5 text-[#716b85]">
    {request.status === "visit_scheduled"
      ? "Your visit is marked as scheduled."
      : request.preferred_visit_at
        ? "This is your preferred visit time. It is not confirmed unless the status is Visit scheduled."
        : "No visit time has been set yet."}
  </p>
</div>

            <div className="mb-6">
              <span className={labelClass}>Problem description</span>
              <p className={`${valueClass} m-0 whitespace-pre-wrap`}>
                {request.description}
              </p>
            </div>

            {request.image_path && (
              <div className="mb-6">
                <span className={labelClass}>Attached photograph</span>
                {imageUrl ? (
                  <img
                    className="max-h-72 w-full rounded-xl border border-[#ded7e8] object-contain"
                    src={imageUrl}
                    alt="Customer-provided device"
                  />
                ) : (
                  <p className="m-0 text-[13px] leading-[1.8] text-[#716b85]">
                    {imageError || "Loading image..."}
                  </p>
                )}
              </div>
            )}

            <div className="mb-6">
              <span className={labelClass}>Service address</span>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-1 shrink-0 text-[#8f68a4]" size={18} />
                <p className={`${valueClass} m-0`}>{request.service_address}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 border-t border-[#eee8f2] pt-5 sm:grid-cols-2">
              <div className="min-w-0">
                <span className={labelClass}>Submitted on</span>
                <p className={`${valueClass} m-0`}>
                  {formatDateTime(request.created_at)}
                </p>
              </div>
              <div className="min-w-0">
                <span className={labelClass}>Preferred visit</span>
                <p className={`${valueClass} m-0`}>
                  {formatDateTime(request.preferred_visit_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-4 border-t border-[#e5deed] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="m-0 max-w-md text-[13px] leading-6 text-[#817995]">
            Technician assignments and confirmed appointments will appear here when available.
          </p>
          <button
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[11px] border border-transparent bg-[#412653] px-5 text-sm font-bold text-white transition hover:bg-[#523269] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d174d2]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function NotificationInbox({ userId, onOpenRequest }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    const { data, error: queryError } = await supabase
      .from("notifications")
      .select(
        "id,user_id,request_id,title,message,type,is_read,created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    setError("");
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel(`customer-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => loadNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadNotifications]);

  async function markAsRead(notification) {
    if (!notification.is_read) {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id)
        .eq("user_id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );
    }

    if (notification.request_id) {
      onOpenRequest(notification.request_id);
    }

    setOpen(false);
  }

  async function markAllRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id);

    if (!unreadIds.length) return;

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .in("id", unreadIds);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotifications((previous) =>
      previous.map((item) => ({ ...item, is_read: true }))
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded7e8] bg-white text-[#526a8a] transition hover:bg-[#f1edf6] hover:text-[#412653]"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e0563f] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />

          <section className="absolute right-0 top-12 z-40 flex max-h-[min(75vh,560px)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#ded7e8] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[#eee8f2] p-4">
              <div>
                <h3 className="text-sm font-bold text-[#412653]">
                  Notifications
                </h3>
                <p className="mt-1 text-xs text-[#716b85]">
                  {unreadCount} unread
                </p>
              </div>

              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="text-xs font-semibold text-[#aa54b2] hover:text-[#412653] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mark all read
              </button>
            </div>

            {error && (
              <p className="m-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {error}
              </p>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-6 text-center text-xs text-[#716b85]">
                  Loading notifications...
                </p>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto mb-3 text-[#a49bad]" size={25} />
                  <p className="text-sm font-semibold text-[#412653]">
                    You're all caught up
                  </p>
                  <p className="mt-1 text-xs text-[#716b85]">
                    Repair updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => markAsRead(notification)}
                    className={`flex w-full items-start gap-3 border-b border-[#f0eaf3] p-4 text-left transition hover:bg-[#fbf7fc] ${
                      notification.is_read ? "bg-white" : "bg-[#fbf4fc]"
                    }`}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1e4f4] text-[#8c4a95]">
                      {notification.type === "assignment" ? (
                        <UserRound size={17} />
                      ) : notification.type === "schedule" ? (
                        <CalendarDays size={17} />
                      ) : (
                        <Wrench size={17} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <strong className="text-xs text-[#412653]">
                          {notification.title}
                        </strong>

                        {!notification.is_read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#d174d2]" />
                        )}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#716b85]">
                        {notification.message}
                      </span>

                      <span className="mt-2 block text-[10px] text-[#91889e]">
                        {formatDateTime(notification.created_at)}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Dashboard({
  user,
  onLogout,
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [requestDraft, setRequestDraft] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activePage, setActivePage] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "there";

  const firstName = fullName.split(/\s+/)[0];

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!currentUser) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const { data, error: queryError } = await supabase
        .from("service_requests")
        .select(
  "id,user_id,technician_id,assigned_at,assignment_note,device_type,device_brand,device_model,category,description,service_address,preferred_visit_at,image_path,status,created_at,updated_at"
)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setRequests(data || []);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load your repair requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const channel = supabase
      .channel(`customer-requests-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, loadRequests]);

  useEffect(() => {
    if (!success) return undefined;

    const timeout = setTimeout(() => setSuccess(""), 5000);

    return () => clearTimeout(timeout);
  }, [success]);

  const activeCount = requests.filter((request) =>
    [
      "submitted",
      "awaiting_assignment",
      "assigned",
      "visit_scheduled",
      "in_progress",
      "awaiting_customer",
    ].includes(request.status)
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "resolved"
  ).length;

  const upcomingVisits = requests.filter(
    (request) =>
      request.status === "visit_scheduled" &&
      request.preferred_visit_at &&
      new Date(request.preferred_visit_at) > new Date()
  ).length;

  const filteredRequests = requests.filter((request) => {
    const matchesFilter =
      filter === "all" || request.status === filter;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        request.id,
        request.description,
        request.device_type,
        request.device_brand,
        request.device_model,
        request.category,
        request.status,
      ].some((value) => value?.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  function handleCreated(request) {
    setShowForm(false);
    setSuccess("Your repair request was submitted successfully.");
    setActivePage("repairs");

    setRequests((previous) => [
      request,
      ...previous.filter((item) => item.id !== request.id),
    ]);
  }

  const openRequestForm = () => {
    setError("");
    setRequestDraft(null);
    setShowForm(true);
  };

  const createRequestFromDiagnosis = (draft) => {
    setShowAssistant(false);
    setRequestDraft(draft);
    setError("");
    setShowForm(true);
  };

  function openRequestFromNotification(requestId) {
  const request = requests.find((item) => item.id === requestId);

  if (request) {
    setSelectedRequest(request);
    return;
  }

  // The request might not be in the current list yet.
  loadRequests().then(() => {
    setActivePage("repairs");
  });
}
  return (
    <div className="min-h-screen bg-[#f1edf6]">
      <Sidebar
        user={user}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#ded7e8] bg-white/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-4">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded7e8] bg-white text-[#526a8a] transition hover:bg-[#f1edf6] hover:text-[#412653] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#716b85]">
              <span>Workspace</span>
              <span className="text-[#c2bdcc]">/</span>
              <strong>
                {activePage === "overview"
                  ? "Overview"
                  : "My repairs"}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 text-xs font-semibold text-[#526a8a] sm:flex">
              <MapPin size={15} />
              Chennai, India
            </span>

            <div className="h-7 w-px bg-[#ded7e8]" />

            <NotificationInbox
  userId={user.id}
  onOpenRequest={openRequestFromNotification}
/>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1e4f4] text-sm font-bold text-[#412653] h-9 w-9 text-xs">
              {getInitials(fullName)}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          {success && (
            <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 border-emerald-200 bg-emerald-50 text-emerald-700 mb-5">
              <CheckCircle2 size={18} />
              {success}
              <button
                className="ml-auto shrink-0"
                onClick={() => setSuccess("")}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 border-red-200 bg-red-50 text-red-700 mb-5">
              {error}
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-transparent px-[17px] text-xs font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 border border-[#ded7e8] bg-white text-[#412653] hover:bg-[#f1edf6] min-h-9 px-3 text-[11px]"
                onClick={loadRequests}
              >
                Retry
              </button>
            </div>
          )}

          {activePage === "overview" ? (
            <>
              <section className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.9px] text-[#9a6aa5]">
                    YOUR REPAIR WORKSPACE
                  </p>

                  <h1>
                    Hey, {firstName}<span className="ml-1 inline-block h-2 w-2 rounded-full">.</span>
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716b85]">
                    Your devices deserve better days.
                    Let's get them there.
                  </p>
                </div>

                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-transparent px-[17px] text-xs font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 bg-[#412653] text-white shadow-sm hover:bg-[#523269] hover:-translate-y-px shrink-0"
                  onClick={openRequestForm}
                >
                  <Plus size={19} />
                  New repair request
                </button>
              </section>

              <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total requests"
                  value={loading ? "—" : requests.length}
                  description="Your repair history"
                  icon={FileText}
                  accent="bg-[#f6eaf7] text-[#aa54b2]"
                />

                <StatCard
                  title="Active repairs"
                  value={loading ? "—" : activeCount}
                  description="Requests being handled"
                  icon={Activity}
                  accent="bg-[#fff0ed] text-[#e0563f]"
                />

                <StatCard
                  title="Upcoming visits"
                  value={loading ? "—" : upcomingVisits}
                  description="Confirmed scheduled visits"
                  icon={CalendarDays}
                  accent="bg-[#edf2fa] text-[#3f567f]"
                />

                <StatCard
                  title="Resolved"
                  value={loading ? "—" : completedCount}
                  description="Successfully completed"
                  icon={CheckCircle2}
                  accent="bg-[#e8f5ef] text-[#29846b]"
                />
              </section>

              <section className="relative mb-10 flex min-h-56 overflow-hidden rounded-[22px] bg-gradient-to-r from-[#412653] to-[#3f567f] text-white">
                <div className="relative z-10 max-w-xl p-6 sm:p-8">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles size={14} />
                    SMARTER DEVICE CARE
                  </div>

                  <h2>
                    Not sure what's wrong?
                    <br />
                    <span>Start with the symptoms.</span>
                  </h2>

                  <p>
                    Describe your laptop or mobile issue.
                    Our AI-assisted workflow will help you
                    explore safe next steps.
                  </p>

                  <button
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-[#412653] transition hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => setShowAssistant(true)}
                  >
                    Describe your issue
                    <ArrowRight size={17} />
                  </button>
                </div>

                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block" aria-hidden="true">
                  <div className="absolute rounded-full border border-white/20 right-8 top-[-5rem] h-72 w-72" />
                  <div className="absolute rounded-full border border-white/20 bottom-[-7rem] right-[-2rem] h-80 w-80" />

                  <div className="absolute flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur right-24 top-1/2 h-28 w-44 -translate-y-1/2 rotate-[-8deg]">
                    <Laptop size={77} strokeWidth={1.15} />
                  </div>

                  <div className="absolute flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur right-12 top-1/2 h-32 w-16 translate-y-[-35%] rotate-[10deg]">
                    <Smartphone size={52} strokeWidth={1.3} />
                  </div>

                  <div className="absolute text-[#d174d2] right-16 top-8">
                    <Sparkles size={20} />
                  </div>

                  <div className="absolute text-[#d174d2] bottom-8 right-40">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.9px] text-[#9a6aa5]">YOUR ACTIVITY</p>
                    <h2>Recent repair requests</h2>
                  </div>

                  <button
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#aa54b2] hover:text-[#412653]"
                    onClick={() => setActivePage("repairs")}
                  >
                    View all <ArrowRight size={16} />
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center gap-3 py-12 text-xs text-[#716b85]">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    Loading your actual repair requests...
                  </div>
                ) : requests.length === 0 ? (
                  <EmptyState onCreateRequest={openRequestForm} />
                ) : (
                  <div className="grid gap-3">
                    {requests.slice(0, 3).map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onClick={setSelectedRequest}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-6 flex items-start gap-3 rounded-xl bg-white p-4 text-xs leading-5 text-[#716b85]">
                <ShieldCheck size={17} />
                <p>
                  Your requests are private. Only authenticated
                  users authorized by the database policies can
                  access them.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end mb-6">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[1.9px] text-[#9a6aa5]">REQUEST MANAGEMENT</p>
                  <h1>
                    My repairs<span className="ml-1 inline-block h-2 w-2 rounded-full">.</span>
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#716b85]">
                    Track your device issues from submission to resolution.
                  </p>
                </div>

                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-transparent px-[17px] text-xs font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 bg-[#412653] text-white shadow-sm hover:bg-[#523269] hover:-translate-y-px shrink-0"
                  onClick={openRequestForm}
                >
                  <Plus size={19} />
                  New repair request
                </button>
              </section>

              <section className="mb-5 flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#ded7e8] bg-white px-4 py-3 text-[#716b85] focus-within:border-[#d174d2]">
                  <Search size={18} />
                  <input
                    type="search"
                    placeholder="Search your requests..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <select
                  className="rounded-xl border border-[#ded7e8] bg-white px-4 py-3 text-xs text-[#526a8a] outline-none focus:border-[#d174d2]"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  aria-label="Filter requests by status"
                >
                  <option value="all">All statuses</option>

                  {Object.entries(STATUSES).map(([value, item]) => (
                    <option key={value} value={value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </section>

              {loading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-xs text-[#716b85]">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  Loading your actual repair requests...
                </div>
              ) : filteredRequests.length === 0 ? (
                requests.length === 0 ? (
                  <EmptyState onCreateRequest={openRequestForm} />
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#ded7e7] bg-white px-6 py-12 text-center">
                    <Search size={26} />
                    <h3>No matching requests</h3>
                    <p>
                      Try changing your search or status filter.
                    </p>
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-transparent px-[17px] text-xs font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 border border-[#ded7e8] bg-white text-[#412653] hover:bg-[#f1edf6]"
                      onClick={() => {
                        setSearch("");
                        setFilter("all");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )
              ) : (
                <div className="grid gap-3 mb-4">
                  {filteredRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onClick={setSelectedRequest}
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-[#716b85]">
                Showing {filteredRequests.length} of {requests.length} requests
              </p>
            </>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ded7e8] px-5 py-5 text-[11px] text-[#716b85] sm:px-8">
            <span>
              © {new Date().getFullYear()} Fixora AI
            </span>

            <span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Connected to your workspace
            </span>
          </footer>
        </div>
      </main>

      {showAssistant && (
        <RepairAssistant
          onClose={() => setShowAssistant(false)}
          onCreateRequest={createRequestFromDiagnosis}
        />
      )}

      {showForm && (
        <RequestModal
          initialDraft={requestDraft}
          onClose={() => setShowForm(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [profile, setProfile] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setInitializing(false);
      return;
    }

    let active = true;

    async function initializeAuth() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!active) return;

        setSession(currentSession);
      } catch (err) {
        console.error("Unable to restore session:", err);
        if (active) setRoleError(err.message);
      } finally {
        if (active) setInitializing(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      setSession(nextSession);
      setProfile(null);
      setRoleError("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id || !supabase) {
      setProfile(null);
      setRoleLoading(false);
      return;
    }

    let active = true;

    async function loadProfile() {
      setRoleLoading(true);
      setRoleError("");

      try {
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!currentUser || currentUser.id !== session.user.id) {
          throw new Error("Your session is invalid. Please sign in again.");
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone, role")
          .eq("id", currentUser.id)
          .single();

        if (error) throw error;

        if (!active) return;

        if (!["customer", "technician", "admin"].includes(data.role)) {
          throw new Error("Your account has an invalid role.");
        }

        setProfile(data);
      } catch (err) {
        console.error("Unable to load account profile:", err);

        if (active) {
          setProfile(null);
          setRoleError(
            err.message ||
              "Unable to load your account role. Please try again."
          );
        }
      } finally {
        if (active) setRoleLoading(false);
      }
    }

    loadProfile();

    // Keep the role in sync if an authorized admin changes it.
    const channel = supabase
      .channel(`fixora-profile-${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${session.user.id}`,
        },
        () => loadProfile()
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-out failed:", error);
      window.alert("Unable to sign out. Please try again.");
    }
  }

  if (!isSupabaseConfigured) {
    return <SetupScreen />;
  }

  if (initializing) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f1edf6]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ded7e8] border-t-[#412653]" />
          <p className="mt-4 text-sm text-[#716b85]">
            Connecting to Fixora AI...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (roleLoading || (!profile && !roleError)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f1edf6] p-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ded7e8] border-t-[#412653]" />
          <p className="mt-4 text-sm text-[#716b85]">
            Loading your Fixora workspace...
          </p>
        </div>
      </div>
    );
  }

  if (roleError || !profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f1edf6] p-5">
        <section className="w-full max-w-lg rounded-3xl border border-[#ded7e8] bg-white p-7 shadow-sm">
          <h1 className="text-xl font-bold text-[#412653]">
            Unable to load your workspace
          </h1>

          <p className="mt-3 break-words text-sm leading-6 text-[#716b85]">
            {roleError ||
              "Your profile could not be found. Please contact the administrator."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setProfile(null);
                setRoleError("");
                setRoleLoading(true);

                supabase
                  .from("profiles")
                  .select("id, full_name, email, phone, role")
                  .eq("id", session.user.id)
                  .single()
                  .then(({ data, error }) => {
                    if (error) {
                      setRoleError(error.message);
                    } else {
                      setProfile(data);
                    }
                  })
                  .finally(() => setRoleLoading(false));
              }}
              className="rounded-xl bg-[#412653] px-4 py-3 text-sm font-semibold text-white"
            >
              Retry
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#ded7e8] px-4 py-3 text-sm font-semibold text-[#412653]"
            >
              Sign out
            </button>
          </div>
        </section>
      </div>
    );
  }

  switch (profile.role) {
    case "admin":
      return (
        <AdminDashboard
          user={session.user}
          onLogout={handleLogout}
        />
      );

    case "technician":
      return (
        <TechnicianDashboard
          user={session.user}
          onLogout={handleLogout}
        />
      );

    case "customer":
    default:
      return (
        <Dashboard
          key={session.user.id}
          user={session.user}
          onLogout={handleLogout}
        />
      );
  }
}