import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  FileImage,
  CheckCircle,
  XCircle,
  Calendar,
  IndianRupee,
  Heart,
  Flag,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { supabase } from "../services/supabase";

function KycDetails() {
  const { id } = useParams();

  const [user, setUser] = useState(null);

  const [aadhaarImageUrl, setAadhaarImageUrl] = useState("");
  const [panImageUrl, setPanImageUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");

        // ==========================================
        // 1. GET LOGGED-IN USER
        // ==========================================

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        // ==========================================
        // 2. CHECK ADMIN ROLE
        // ==========================================

        const admin = authUser?.app_metadata?.role === "admin";

        setIsAdmin(admin);

        console.log("Logged-in user:", authUser);
        console.log("Is admin:", admin);

        // ==========================================
        // 3. FETCH KYC RECORD
        // ==========================================

        const { data, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (userError) {
          throw userError;
        }

        console.log("KYC user:", data);

        setUser(data);

        // ==========================================
        // 4. GENERATE SIGNED AADHAAR URL
        // ==========================================

        if (data.aadhaar_image_url) {
          const { data: aadhaarUrlData, error: aadhaarError } =
            await supabase.storage
              .from("kyc-documents")
              .createSignedUrl(data.aadhaar_image_url, 60 * 10);

          if (aadhaarError) {
            console.error("Aadhaar signed URL error:", aadhaarError);
          } else {
            setAadhaarImageUrl(aadhaarUrlData.signedUrl);
          }
        }

        // ==========================================
        // 5. GENERATE SIGNED PAN URL
        // ==========================================

        if (data.pan_image_url) {
          const { data: panUrlData, error: panError } = await supabase.storage
            .from("kyc-documents")
            .createSignedUrl(data.pan_image_url, 60 * 10);

          if (panError) {
            console.error("PAN signed URL error:", panError);
          } else {
            setPanImageUrl(panUrlData.signedUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching KYC:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // ==========================================
  // APPROVE / REJECT KYC
  // ==========================================

  const updateKycStatus = async (status) => {
    try {
      setUpdatingStatus(true);
      setError("");

      console.log("Updating KYC status to:", status);
      console.log("KYC ID:", id);

      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          kyc_status: status,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }

      console.log("Updated KYC record:", data);

      setUser(data);
    } catch (err) {
      console.error("KYC status update failed:", err);

      setError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060a11] px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

              <p className="text-sm text-slate-400">Loading KYC details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !user) {
    return (
      <div className="min-h-screen bg-[#060a11] px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/dashboard"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <h2 className="mb-2 text-lg font-semibold text-red-400">
              Failed to load KYC profile
            </h2>

            <p className="text-sm text-slate-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      case "Rejected":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      default:
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#060a11] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ==========================================
                    HEADER
                ========================================== */}

        <div className="mb-8">
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-blue-400">
                KYC Application
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {user?.full_name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Application ID #{user?.id}
              </p>
            </div>

            {/* STATUS */}
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${getStatusStyle(
                user?.kyc_status,
              )}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />

              {user?.kyc_status || "Pending"}
            </div>
          </div>
        </div>

        {/* ==========================================
                    ADMIN ACTIONS
                ========================================== */}

        {isAdmin && (
          <div className="mb-8 rounded-2xl border border-blue-500/10 bg-[#0b111d] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Admin Actions
                </h2>

                <p className="text-xs text-slate-500">
                  Review and update this KYC application
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {/* APPROVE */}

              <button
                type="button"
                onClick={() => updateKycStatus("Approved")}
                disabled={updatingStatus}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />

                {updatingStatus ? "Updating..." : "Approve KYC"}
              </button>

              {/* REJECT */}

              <button
                type="button"
                onClick={() => updateKycStatus("Rejected")}
                disabled={updatingStatus}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />

                {updatingStatus ? "Updating..." : "Reject KYC"}
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
                    PERSONAL INFORMATION
                ========================================== */}

        <Section number="01" title="Personal Information" icon={User}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Full Name" value={user?.full_name} />

            <InfoItem
              label="Date of Birth"
              value={formatDate(user?.date_of_birth)}
              icon={Calendar}
            />

            <InfoItem label="Gender" value={user?.gender} />

            <InfoItem label="Parent / Guardian" value={user?.parent_name} />

            <InfoItem
              label="Nationality"
              value={user?.nationality}
              icon={Flag}
            />

            <InfoItem
              label="Marital Status"
              value={user?.marital_status}
              icon={Heart}
            />
          </div>
        </Section>

        {/* ==========================================
                    CONTACT INFORMATION
                ========================================== */}

        <Section number="02" title="Contact Information" icon={Phone}>
          <div className="grid gap-6 sm:grid-cols-2">
            <InfoItem label="Email Address" value={user?.email} icon={Mail} />

            <InfoItem label="Mobile Number" value={user?.mobile} icon={Phone} />
          </div>
        </Section>

        {/* ==========================================
                    ADDRESS
                ========================================== */}

        <Section number="03" title="Address" icon={MapPin}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <InfoItem label="Address" value={user?.address} />
            </div>

            <InfoItem label="City" value={user?.city} />

            <InfoItem label="State" value={user?.state} />

            <InfoItem label="Pincode" value={user?.pincode} />
          </div>
        </Section>

        {/* ==========================================
                    EMPLOYMENT
                ========================================== */}

        <Section
          number="04"
          title="Employment & Financial Information"
          icon={Briefcase}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Occupation"
              value={user?.occupation}
              icon={Briefcase}
            />

            <InfoItem label="Employment Type" value={user?.employment_type} />

            <InfoItem
              label="Annual Income"
              value={
                user?.annual_income
                  ? `₹${Number(user.annual_income).toLocaleString("en-IN")}`
                  : "-"
              }
              icon={IndianRupee}
            />
          </div>
        </Section>

        {/* ==========================================
                    IDENTIFICATION
                ========================================== */}

        <Section number="05" title="Government Identification" icon={FileText}>
          <div className="grid gap-6 sm:grid-cols-2">
            <InfoItem label="Aadhaar Number" value={user?.aadhaar_number} />

            <InfoItem label="PAN Number" value={user?.pan_number} />
          </div>
        </Section>

        {/* ==========================================
                    KYC PURPOSE
                ========================================== */}

        <Section number="06" title="KYC Purpose" icon={FileText}>
          <InfoItem label="Purpose of KYC" value={user?.kyc_purpose} />
        </Section>

        {/* ==========================================
                    DOCUMENTS
                ========================================== */}

        <Section number="07" title="Uploaded Documents" icon={FileImage}>
          <div className="grid gap-6 lg:grid-cols-2">
            <DocumentPreview
              title="Aadhaar Document"
              imageUrl={aadhaarImageUrl}
            />

            <DocumentPreview title="PAN Document" imageUrl={panImageUrl} />
          </div>
        </Section>

        {/* ==========================================
                    FOOTER
                ========================================== */}

        <div className="mt-8 border-t border-white/[0.06] pt-6">
          <div className="flex flex-col justify-between gap-2 text-xs text-slate-600 sm:flex-row">
            <p>KYC Application #{user?.id}</p>

            <p>Submitted {formatDateTime(user?.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function Section({ number, title, icon: Icon, children }) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b111d]">
      <div className="flex items-center gap-4 border-b border-white/[0.06] px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
          <Icon className="h-4 w-4 text-blue-400" />
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
            Section {number}
          </p>

          <h2 className="mt-0.5 text-sm font-semibold text-white">{title}</h2>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-600">
        {label}
      </p>

      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500" />}

        <p className="break-words text-sm text-slate-200">{value || "-"}</p>
      </div>
    </div>
  );
}

/* =========================================================
   DOCUMENT PREVIEW
========================================================= */

function DocumentPreview({ title, imageUrl }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-600">
        {title}
      </p>

      <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080d17] p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} document`}
            className="h-40 w-auto max-w-[240px] rounded-lg border border-white/10 object-contain"
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <div className="text-center">
              <FileImage className="mx-auto mb-3 h-8 w-8 text-slate-700" />

              <p className="text-xs text-slate-600">Image unavailable</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   DATE FORMATTERS
========================================================= */

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default KycDetails;
