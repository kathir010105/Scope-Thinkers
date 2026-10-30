import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  IndianRupee,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const ESTIMATE_STATUS = {
  pending_approval: {
    label: "Awaiting Your Approval",
    className: "bg-amber-100 text-amber-800",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800",
  },
  superseded: {
    label: "Replaced by a New Estimate",
    className: "bg-slate-100 text-slate-700",
  },
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700",
  },
};

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function CustomerEstimatePanel({ requestId }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEstimate = useCallback(async () => {
    if (!requestId) {
      setEstimate(null);
      setError("The service request ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("repair_estimates")
        .select(
          [
            "id",
            "request_id",
            "version",
            "min_amount",
            "max_amount",
            "diagnostic_notes",
            "status",
            "created_at",
            "approved_at",
          ].join(", ")
        )
        .eq("request_id", requestId)
        .order("version", { ascending: false })
        .limit(1);

      if (queryError) throw queryError;

      setEstimate(data?.[0] || null);
    } catch (err) {
      console.error("Failed to load repair estimate:", err);

      setError(
        err?.message ||
          "Unable to load the repair estimate. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadEstimate();
  }, [loadEstimate]);

  async function handleDecision(decision) {
    if (!estimate?.id || submitting) return;

    if (
      decision === "rejected" &&
      !window.confirm(
        "Are you sure you want to reject this repair estimate?"
      )
    ) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { error: rpcError } = await supabase.rpc(
        "respond_to_repair_estimate",
        {
          p_estimate_id: estimate.id,
          p_decision: decision,
        }
      );

      if (rpcError) throw rpcError;

      setSuccess(
        decision === "approved"
          ? "You approved the repair estimate."
          : "You rejected the repair estimate."
      );

      await loadEstimate();
    } catch (err) {
      console.error("Failed to respond to estimate:", err);

      setError(
        err?.message ||
          "Your response could not be submitted. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isPending = estimate?.status === "pending_approval";

  const statusInfo = estimate
    ? ESTIMATE_STATUS[estimate.status]
    : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D174D2]/30 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-[#F8F3FA] px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#412653]">
          <FileText size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#412653]">
            Repair Estimate
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Review the estimated cost before approving the repair.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEstimate}
          disabled={loading || submitting}
          title="Refresh estimate"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-[#412653] disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>

      <div className="p-5">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500">
            <Loader2
              size={20}
              className="animate-spin text-[#D174D2]"
            />
            Loading estimate...
          </div>
        )}

        {/* Error */}
        {!loading && error && !estimate && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2 text-sm text-red-800">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={loadEstimate}
              className="mt-3 text-sm font-semibold text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* No estimate */}
        {!loading && !error && !estimate && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Clock size={23} />
            </div>

            <h4 className="mt-3 font-semibold text-slate-800">
              Estimate not available yet
            </h4>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Your technician hasn't submitted a repair estimate yet.
              Once it is available, you can review the estimated cost
              and approve or reject it here.
            </p>
          </div>
        )}

        {/* Estimate details */}
        {!loading && estimate && (
          <div className="space-y-5">
            {/* Status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-500">
                Estimate status
              </span>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusInfo?.className ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {statusInfo?.label || estimate.status}
              </span>
            </div>

            {/* Cost range */}
            <div className="rounded-xl border border-[#D174D2]/20 bg-[#F8F3FA] p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[#412653]">
                <IndianRupee size={18} />
                Estimated repair cost
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Minimum
                  </p>

                  <p className="mt-1 break-words text-lg font-bold text-[#412653] sm:text-xl">
                    {formatCurrency(estimate.min_amount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Maximum
                  </p>

                  <p className="mt-1 break-words text-lg font-bold text-[#412653] sm:text-xl">
                    {formatCurrency(estimate.max_amount)}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                This is the estimate provided by your technician,
                not necessarily the final invoice.
              </p>
            </div>

            {/* Diagnostic notes */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                Technician's diagnosis
              </h4>

              <div className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                {estimate.diagnostic_notes?.trim() ||
                  "No diagnostic notes were provided."}
              </div>
            </div>

            {/* Estimate metadata */}
            <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400">
              <span>Estimate version {estimate.version}</span>

              <span>
                Submitted {formatDate(estimate.created_at)}
              </span>
            </div>

            {/* Success message */}
            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <p>{success}</p>
              </div>
            )}

            {/* Error after decision */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <p>{error}</p>
              </div>
            )}

            {/* Approve / Reject */}
            {isPending && (
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <p className="text-sm leading-6 text-slate-600">
                  Review the estimated cost and diagnosis carefully.
                  You can approve or reject this estimate.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleDecision("approved")}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#412653] px-4 py-3 font-semibold text-white transition hover:bg-[#53336A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}

                    Approve Estimate
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision("rejected")}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <XCircle size={18} />
                    )}

                    Reject Estimate
                  </button>
                </div>
              </div>
            )}

            {/* Approved state */}
            {estimate.status === "approved" && (
              <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-green-700"
                />

                <div>
                  <p className="font-semibold text-green-900">
                    Estimate approved
                  </p>

                  <p className="mt-1 text-sm leading-6 text-green-800">
                    You approved this estimate. Your technician can
                    proceed with the repair according to the agreed
                    estimate and applicable terms.
                  </p>

                  {estimate.approved_at && (
                    <p className="mt-2 text-xs text-green-700">
                      Approved {formatDate(estimate.approved_at)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rejected state */}
            {estimate.status === "rejected" && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <XCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-red-700"
                />

                <div>
                  <p className="font-semibold text-red-900">
                    Estimate rejected
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-800">
                    You rejected this estimate. Your technician may
                    review the issue and submit a revised estimate.
                  </p>
                </div>
              </div>
            )}

            {/* Other statuses */}
            {!isPending &&
              !["approved", "rejected"].includes(estimate.status) && (
                <div className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                  This estimate is not currently available for approval.
                  Refresh the panel to check for an updated estimate.
                </div>
              )}
          </div>
        )}
      </div>
    </section>
  );
}