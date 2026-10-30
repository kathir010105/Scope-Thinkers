import { useState } from "react";
import {
  X,
  Sparkles,
  Laptop,
  Smartphone,
  LoaderCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Wrench,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const ISSUE_CATEGORIES = [
  { value: "hardware", label: "Hardware problem" },
  { value: "software", label: "Software problem" },
  { value: "battery", label: "Battery or charging" },
  { value: "screen", label: "Screen or display" },
  { value: "network", label: "Network or connectivity" },
  { value: "performance", label: "Slow performance" },
  { value: "other", label: "Other" },
];

const INITIAL_FORM = {
  deviceType: "laptop",
  brand: "",
  model: "",
  category: "other",
  symptoms: "",
};

function getCategoryLabel(category) {
  return (
    ISSUE_CATEGORIES.find((item) => item.value === category)?.label ||
    "Other"
  );
}

export default function RepairAssistant({ onClose, onCreateRequest }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [diagnosis, setDiagnosis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleDiagnose(event) {
    event.preventDefault();

    const symptoms = form.symptoms.trim();

    if (symptoms.length < 10) {
      setError("Please describe the problem in at least 10 characters.");
      return;
    }

    if (symptoms.length > 2000) {
      setError("Please keep your description under 2,000 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setDiagnosis(null);

    try {
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Check your frontend environment variables."
        );
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        throw new Error("Please sign in before using the Repair Assistant.");
      }

      const response = await fetch(`${API_URL}/api/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          deviceType: form.deviceType,
          brand: form.brand.trim(),
          model: form.model.trim(),
          category: form.category,
          symptoms,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error || "The assistant could not diagnose this issue."
        );
      }

      if (!result.diagnosis) {
        throw new Error("The server returned an invalid diagnosis.");
      }

      setDiagnosis(result.diagnosis);
    } catch (err) {
      console.error("Repair diagnosis failed:", err);

      setError(
        err.message ||
          "Unable to connect to the Repair Assistant. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCreateRequest() {
    if (!diagnosis) return;

    onCreateRequest({
      deviceType: form.deviceType,
      brand: form.brand.trim(),
      model: form.model.trim(),
      category: diagnosis.suggestedCategory || form.category,
      description:
        diagnosis.requestDescription || form.symptoms.trim(),
    });
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setDiagnosis(null);
    setError("");
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="repair-assistant-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-[#412653] to-[#3F567F] px-5 py-5 text-white sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles size={24} />
            </div>

            <div>
              <h2
                id="repair-assistant-title"
                className="text-lg font-bold sm:text-xl"
              >
                AI Repair Assistant
              </h2>
              <p className="mt-1 text-sm text-white/75">
                Understand the problem before booking a repair.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close Repair Assistant"
            className="rounded-xl p-2 text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {!diagnosis ? (
            <>
              <div className="mb-6 rounded-2xl border border-[#D174D2]/25 bg-[#D174D2]/10 p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-[#412653]">
                    <ShieldCheck size={22} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#412653]">
                      Describe what is happening
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Gemini will suggest possible causes and safe
                      troubleshooting steps. The diagnosis is an estimate,
                      not a confirmed hardware inspection.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleDiagnose} className="space-y-5">
                {/* Device type */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Which device has a problem?
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "laptop",
                        label: "Laptop",
                        icon: Laptop,
                      },
                      {
                        value: "mobile",
                        label: "Mobile phone",
                        icon: Smartphone,
                      },
                    ].map((device) => {
                      const Icon = device.icon;
                      const selected = form.deviceType === device.value;

                      return (
                        <button
                          key={device.value}
                          type="button"
                          onClick={() =>
                            updateForm("deviceType", device.value)
                          }
                          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-[#412653] bg-[#412653]/5 text-[#412653] ring-1 ring-[#412653]"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <Icon size={22} />
                          <span className="font-semibold">
                            {device.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brand and model */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="assistant-brand"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Brand{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="assistant-brand"
                      value={form.brand}
                      onChange={(event) =>
                        updateForm("brand", event.target.value)
                      }
                      maxLength={80}
                      placeholder={
                        form.deviceType === "laptop"
                          ? "e.g. ASUS, Dell, HP"
                          : "e.g. Samsung, Apple"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assistant-model"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Model{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="assistant-model"
                      value={form.model}
                      onChange={(event) =>
                        updateForm("model", event.target.value)
                      }
                      maxLength={100}
                      placeholder="Enter your device model"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20"
                    />
                  </div>
                </div>

                {/* Issue category */}
                <div>
                  <label
                    htmlFor="assistant-category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Problem category
                  </label>

                  <select
                    id="assistant-category"
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20"
                  >
                    {ISSUE_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Symptoms */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="assistant-symptoms"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Describe the symptoms
                    </label>

                    <span className="text-xs text-slate-400">
                      {form.symptoms.length}/2000
                    </span>
                  </div>

                  <textarea
                    id="assistant-symptoms"
                    value={form.symptoms}
                    onChange={(event) =>
                      updateForm("symptoms", event.target.value)
                    }
                    minLength={10}
                    maxLength={2000}
                    rows={5}
                    required
                    placeholder="For example: My laptop gets very hot after 10 minutes, the fan becomes loud, and the laptop sometimes shuts down while gaming..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Include when the problem started, what triggers it, and
                    any error messages you see.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <AlertTriangle
                      size={19}
                      className="mt-0.5 shrink-0"
                    />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#412653] to-[#3F567F] px-5 py-3.5 font-semibold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={20} className="animate-spin" />
                      Analysing your problem...
                    </>
                  ) : (
                    <>
                      <Sparkles size={19} />
                      Diagnose with AI
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              {/* Diagnosis summary */}
              <div className="rounded-2xl border border-[#D174D2]/30 bg-gradient-to-br from-[#D174D2]/10 to-[#3F567F]/5 p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#412653]">
                  <Sparkles size={18} />
                  AI assessment
                </div>

                <p className="text-base leading-7 text-slate-800">
                  {diagnosis.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#412653] ring-1 ring-[#412653]/10">
                    {form.deviceType === "laptop" ? "Laptop" : "Mobile phone"}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                    {getCategoryLabel(
                      diagnosis.suggestedCategory || form.category
                    )}
                  </span>

                  {diagnosis.repairRecommended && (
                    <span className="rounded-full bg-[#E0563F]/10 px-3 py-1.5 text-xs font-semibold text-[#B63C2B]">
                      Professional repair may be needed
                    </span>
                  )}
                </div>
              </div>

              {/* Possible causes */}
              {Array.isArray(diagnosis.likelyCauses) &&
                diagnosis.likelyCauses.length > 0 && (
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                      <Wrench size={19} className="text-[#D174D2]" />
                      Possible causes
                    </h3>

                    <div className="space-y-3">
                      {diagnosis.likelyCauses.map((cause, index) => (
                        <div
                          key={`${index}-${cause.title}`}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-slate-800">
                              {cause.title}
                            </h4>

                            {cause.likelihood && (
                              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                                {cause.likelihood}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {cause.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {/* Safe troubleshooting steps */}
              {Array.isArray(diagnosis.safeSteps) &&
                diagnosis.safeSteps.length > 0 && (
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                      <CheckCircle2
                        size={19}
                        className="text-emerald-600"
                      />
                      Safe troubleshooting steps
                    </h3>

                    <ol className="space-y-3">
                      {diagnosis.safeSteps.map((step, index) => (
                        <li
                          key={`${index}-${step.title}`}
                          className="flex gap-3 rounded-xl border border-slate-200 p-4"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#412653]/10 text-sm font-bold text-[#412653]">
                            {index + 1}
                          </span>

                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {step.title}
                            </h4>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {step.instruction}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

              {/* Warning signs */}
              {Array.isArray(diagnosis.redFlags) &&
                diagnosis.redFlags.length > 0 && (
                  <section className="rounded-2xl border border-[#E0563F]/25 bg-[#E0563F]/5 p-5">
                    <h3 className="mb-3 flex items-center gap-2 font-bold text-[#B63C2B]">
                      <AlertTriangle size={20} />
                      Warning signs
                    </h3>

                    <ul className="space-y-2">
                      {diagnosis.redFlags.map((warning, index) => (
                        <li
                          key={index}
                          className="flex gap-2 text-sm leading-6 text-slate-700"
                        >
                          <span className="font-bold text-[#E0563F]">
                            •
                          </span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

              <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                <strong className="text-slate-700">Important:</strong>{" "}
                This AI diagnosis is preliminary and may be incorrect. Do
                not open a device, handle exposed wiring, or attempt
                hazardous repairs based on this advice. If you notice
                smoke, burning smells, sparks, or a swollen battery, stop
                using the device and seek professional assistance.
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          {diagnosis ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={17} />
                Try another diagnosis
              </button>

              <button
                type="button"
                onClick={handleCreateRequest}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#412653] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3F567F]"
              >
                Create repair request
                <ArrowRight size={17} />
              </button>
            </>
          ) : (
            <p className="text-center text-xs text-slate-400 sm:text-left">
              Powered by Gemini AI
            </p>
          )}
        </footer>
      </section>
    </div>
  );
}
