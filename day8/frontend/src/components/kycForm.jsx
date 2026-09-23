import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  FileText,
  ShieldCheck,
  Upload,
  CheckCircle2,
  CircleUserRound,
  Wallet,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";

import { supabase } from "../services/supabase";

import { validateForm, validateFile } from "../utils/validation";

function KycForm() {
  const initialFormData = {
    full_name: "",
    date_of_birth: "",
    gender: "",
    email: "",
    mobile: "",

    address: "",
    city: "",
    state: "",
    pincode: "",

    occupation: "",
    annual_income: "",
    employment_type: "",

    aadhaar_number: "",
    pan_number: "",

    parent_name: "",
    nationality: "",
    marital_status: "",
    kyc_purpose: "",

    aadhaar_file: null,
    pan_file: null,
  };

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitMessage, setSubmitMessage] = useState({
    type: "",
    text: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    setSubmitMessage({
      type: "",
      text: "",
    });
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;

    const file = files[0];

    if (!file) return;

    const fieldName =
      name === "aadhaar_file" ? "Aadhaar document" : "PAN document";

    const fileError = validateFile(file, fieldName);

    if (fileError) {
      setErrors({
        ...errors,
        [name]: fileError,
      });

      setFormData({
        ...formData,
        [name]: null,
      });

      event.target.value = "";

      return;
    }

    setFormData({
      ...formData,
      [name]: file,
    });

    setErrors({
      ...errors,
      [name]: "",
    });

    setSubmitMessage({
      type: "",
      text: "",
    });
  };

  const uploadDocument = async (file, folder) => {
    const fileExtension = file.name.split(".").pop().toLowerCase();

    const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const filePath = `${folder}/${uniqueFileName}`;

    const { error } = await supabase.storage
      .from("kyc-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    return filePath;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitMessage({
      type: "",
      text: "",
    });

    const validationErrors = validateForm(formData);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation failed:", validationErrors);

      return;
    }

    try {
      setIsSubmitting(true);

      /*
       * STEP 1
       * Upload Aadhaar document
       */
      const aadhaarPath = await uploadDocument(
        formData.aadhaar_file,
        "aadhaar",
      );

      /*
       * STEP 2
       * Upload PAN document
       */
      const panPath = await uploadDocument(formData.pan_file, "pan");

      /*
       * STEP 3
       * Insert user information into Supabase
       */
      const { error } = await supabase.from("users").insert({
        full_name: formData.full_name.trim(),

        date_of_birth: formData.date_of_birth,

        gender: formData.gender,

        email: formData.email.trim(),

        mobile: formData.mobile.trim(),

        address: formData.address.trim(),

        city: formData.city.trim(),

        state: formData.state.trim(),

        pincode: formData.pincode.trim(),

        occupation: formData.occupation.trim(),

        annual_income: Number(formData.annual_income),

        employment_type: formData.employment_type,

        aadhaar_number: formData.aadhaar_number.trim(),

        pan_number: formData.pan_number.trim().toUpperCase(),

        parent_name: formData.parent_name.trim(),

        nationality: formData.nationality,

        marital_status: formData.marital_status,

        kyc_purpose: formData.kyc_purpose,

        aadhaar_image_url: aadhaarPath,

        pan_image_url: panPath,

        kyc_status: "Pending",
      });

      if (error) {
        throw error;
      }

      /*
       * STEP 4
       * Successful submission
       */
      setSubmitMessage({
        type: "success",
        text: "KYC application submitted successfully.",
      });

      /*
       * STEP 5
       * Reset form
       */
      setFormData(initialFormData);

      setErrors({});
    } catch (error) {
      console.error("KYC submission error:", error);

      setSubmitMessage({
        type: "error",
        text:
          error.message ||
          "Something went wrong while submitting your application.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#0a0f1c]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-wide sm:text-base">
                VERIFY
                <span className="text-blue-400">ID</span>
              </h1>

              <p className="hidden text-[11px] text-slate-500 sm:block">
                Secure identity verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
            <LockKeyhole className="h-3.5 w-3.5 text-emerald-400" />

            <span className="text-xs text-slate-400">Secure & encrypted</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        {/* PAGE HEADER */}

        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <span>Home</span>

            <ChevronRight className="h-3 w-3" />

            <span className="text-slate-300">KYC Registration</span>
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                <CircleUserRound className="h-3.5 w-3.5" />
                Identity Verification
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Complete your KYC profile
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Provide your personal, professional and identification details
                to complete the verification process.
              </p>
            </div>

            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  Application progress
                </span>

                <span className="text-xs font-semibold text-blue-400">0%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-0 rounded-full bg-blue-500" />
              </div>

              <p className="mt-2 text-right text-[11px] text-slate-600">
                Complete all required fields
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS / ERROR MESSAGE */}

        {submitMessage.text && (
          <div
            className={`mb-6 rounded-xl border px-4 py-4 text-sm ${
              submitMessage.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PERSONAL */}

            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1321] shadow-xl shadow-black/10">
              <SectionHeader
                icon={User}
                number="01"
                title="Personal information"
                description="Tell us about yourself"
              />

              <div className="p-6 sm:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Full name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    icon={User}
                    required
                    error={errors.full_name}
                  />

                  <InputField
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    error={errors.date_of_birth}
                  />

                  <SelectField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    error={errors.gender}
                    options={["Male", "Female", "Other", "Prefer not to say"]}
                  />

                  <InputField
                    label="Email address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    icon={Mail}
                    required
                    error={errors.email}
                  />

                  <InputField
                    label="Mobile number"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    icon={Phone}
                    required
                    error={errors.mobile}
                  />
                </div>
              </div>
            </section>

            {/* ADDRESS */}

            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1321] shadow-xl shadow-black/10">
              <SectionHeader
                icon={MapPin}
                number="02"
                title="Address information"
                description="Your current residential address"
              />

              <div className="p-6 sm:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-200">
                      Residential address
                      <span className="text-blue-400">*</span>
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your complete residential address"
                      rows="3"
                      className={`w-full resize-none rounded-xl border bg-[#080d17] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition duration-200 focus:ring-4 ${
                        errors.address
                          ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/10"
                          : "border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />

                    {errors.address && (
                      <p className="mt-2 text-xs font-medium text-red-400">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <InputField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    icon={MapPin}
                    required
                    error={errors.city}
                  />

                  <InputField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                    error={errors.state}
                  />

                  <InputField
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    required
                    error={errors.pincode}
                  />
                </div>
              </div>
            </section>

            {/* PROFESSIONAL */}

            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1321] shadow-xl shadow-black/10">
              <SectionHeader
                icon={Briefcase}
                number="03"
                title="Professional information"
                description="Your current professional status"
              />

              <div className="p-6 sm:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    icon={Briefcase}
                    required
                    error={errors.occupation}
                  />

                  <InputField
                    label="Annual income"
                    name="annual_income"
                    type="number"
                    value={formData.annual_income}
                    onChange={handleChange}
                    placeholder="Enter annual income"
                    icon={Wallet}
                    min="0"
                    required
                    error={errors.annual_income}
                  />

                  <SelectField
                    label="Employment type"
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    required
                    error={errors.employment_type}
                    options={[
                      "Student",
                      "Full-time",
                      "Part-time",
                      "Self-employed",
                      "Unemployed",
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* IDENTITY */}

            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1321] shadow-xl shadow-black/10">
              <SectionHeader
                icon={CreditCard}
                number="04"
                title="Identity information"
                description="Your government identification details"
              />

              <div className="p-6 sm:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Aadhaar number"
                    name="aadhaar_number"
                    value={formData.aadhaar_number}
                    onChange={handleChange}
                    placeholder="12-digit Aadhaar number"
                    maxLength="12"
                    icon={CreditCard}
                    required
                    error={errors.aadhaar_number}
                  />

                  <InputField
                    label="PAN number"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                    maxLength="10"
                    icon={CreditCard}
                    required
                    error={errors.pan_number}
                  />
                </div>

                <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/10 bg-amber-500/[0.04] px-4 py-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

                  <p className="text-xs leading-5 text-slate-500">
                    Your identification information is sensitive. Use dummy
                    information while developing and testing this project.
                  </p>
                </div>
              </div>
            </section>

            {/* ADDITIONAL */}

            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1321] shadow-xl shadow-black/10">
              <SectionHeader
                icon={FileText}
                number="05"
                title="Additional information"
                description="A few additional details"
              />

              <div className="p-6 sm:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Parent / guardian name"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleChange}
                    placeholder="Enter parent or guardian name"
                    icon={User}
                    required
                    error={errors.parent_name}
                  />

                  <SelectField
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    error={errors.nationality}
                    options={["Indian", "Other"]}
                  />

                  <SelectField
                    label="Marital status"
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    required
                    error={errors.marital_status}
                    options={["Single", "Married", "Divorced", "Widowed"]}
                  />

                  <SelectField
                    label="KYC purpose"
                    name="kyc_purpose"
                    value={formData.kyc_purpose}
                    onChange={handleChange}
                    required
                    error={errors.kyc_purpose}
                    options={[
                      "Account Opening",
                      "Employment",
                      "Education",
                      "Other",
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* DOCUMENTS */}

            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1321] shadow-xl shadow-black/10">
              <SectionHeader
                icon={Upload}
                number="06"
                title="Identity documents"
                description="Upload your identification documents"
              />

              <div className="p-6 sm:p-7">
                <div className="grid gap-5 md:grid-cols-2">
                  <DocumentUpload
                    title="Aadhaar card"
                    name="aadhaar_file"
                    file={formData.aadhaar_file}
                    onChange={handleFileChange}
                    error={errors.aadhaar_file}
                  />

                  <DocumentUpload
                    title="PAN card"
                    name="pan_file"
                    file={formData.pan_file}
                    onChange={handleFileChange}
                    error={errors.pan_file}
                  />
                </div>
              </div>
            </section>

            {/* SUBMIT */}

            <div className="rounded-2xl border border-white/[0.08] bg-[#0d1321] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <LockKeyhole className="h-5 w-5 text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Your information is protected
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Review your information before submitting.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit application"}

                  {!isSubmitting && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </form>

          {/* SIDEBAR */}

          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-5">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0d1321] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Verification</p>

                    <p className="mt-1 text-xs text-slate-500">6 sections</p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <ProgressItem number="01" title="Personal information" />

                  <ProgressItem number="02" title="Address" />

                  <ProgressItem number="03" title="Professional" />

                  <ProgressItem number="04" title="Identity" />

                  <ProgressItem number="05" title="Additional details" />

                  <ProgressItem number="06" title="Documents" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* =========================
   SECTION HEADER
========================= */

function SectionHeader({ icon: Icon, number, title, description }) {
  return (
    <div className="flex items-center gap-4 border-b border-white/[0.06] px-6 py-5 sm:px-7">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-blue-400">
            {number}
          </span>

          <h3 className="text-sm font-semibold text-slate-100 sm:text-base">
            {title}
          </h3>
        </div>

        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

/* =========================
   INPUT FIELD
========================= */

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  icon: Icon,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          max={
            type === "date" ? new Date().toISOString().split("T")[0] : undefined
          }
          className={`w-full rounded-xl border bg-[#0b111d] px-4 py-3 text-sm text-white outline-none transition ${
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-white/[0.08] focus:border-blue-500/50"
          } ${type === "date" ? "[color-scheme:dark]" : ""}`}
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* =========================
   SELECT FIELD
========================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-200">
        {label}

        {required && <span className="text-blue-400">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full cursor-pointer appearance-none rounded-xl border bg-[#080d17] px-4 py-3 text-sm text-white outline-none transition duration-200 focus:ring-4 ${
          error
            ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/10"
            : "border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/10"
        }`}
      >
        <option value="" className="bg-[#0d1321]">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option key={option} value={option} className="bg-[#0d1321]">
            {option}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-400">{error}</p>
      )}
    </div>
  );
}

/* =========================
   DOCUMENT UPLOAD
========================= */

function DocumentUpload({ title, name, file, onChange, error }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-200">
        {title}

        <span className="text-blue-400">*</span>
      </label>

      <label
        htmlFor={name}
        className={`group flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition duration-200 ${
          error
            ? "border-red-500/60 bg-red-500/[0.03]"
            : file
              ? "border-emerald-500/40 bg-emerald-500/[0.04]"
              : "border-slate-700 bg-[#080d17] hover:border-blue-500/60 hover:bg-blue-500/[0.03]"
        }`}
      >
        {file ? (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>

            <p className="max-w-full truncate px-4 text-sm font-medium text-emerald-300">
              {file.name}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <span className="mt-4 text-xs font-medium text-slate-400 transition group-hover:text-white">
              Click to replace
            </span>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 transition group-hover:bg-blue-500/10">
              <Upload className="h-5 w-5 text-slate-500 transition group-hover:text-blue-400" />
            </div>

            <p className="text-sm font-medium text-slate-300">
              Upload {title.toLowerCase()}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Drag & drop or click to browse
            </p>

            <div className="mt-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-slate-600">
              <span>JPG</span>
              <span>•</span>
              <span>JPEG</span>
              <span>•</span>
              <span>PNG</span>
              <span>•</span>
              <span>MAX 2MB</span>
            </div>
          </>
        )}

        <input
          id={name}
          type="file"
          name={name}
          accept=".jpg,.jpeg,.png"
          onChange={onChange}
          className="hidden"
        />
      </label>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-400">{error}</p>
      )}
    </div>
  );
}

/* =========================
   PROGRESS ITEM
========================= */

function ProgressItem({ number, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 text-[10px] font-semibold text-slate-500">
        {number}
      </div>

      <span className="text-xs text-slate-500">{title}</span>
    </div>
  );
}

export default KycForm;
