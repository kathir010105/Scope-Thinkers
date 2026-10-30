import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Wrench,
  X,
  IndianRupee,
  User,
  MessageSquare,
  LogOut,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import RepairCompletionForm from "./RepairCompletionForm";

const STATUS_LABELS = {
  submitted: "Submitted",
  awaiting_assignment: "Awaiting Assignment",
  assigned: "Assigned",
  visit_scheduled: "Visit Scheduled",
  in_progress: "In Progress",
  awaiting_customer: "Awaiting Customer",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

const STATUS_STYLES = {
  submitted: "bg-slate-100 text-slate-700",
  awaiting_assignment: "bg-amber-100 text-amber-800",
  assigned: "bg-blue-100 text-blue-800",
  visit_scheduled: "bg-purple-100 text-purple-800",
  in_progress: "bg-orange-100 text-orange-800",
  awaiting_customer: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const ESTIMATE_LABELS = {
  not_created: "Estimate Not Prepared",
  pending_approval: "Awaiting Customer Approval",
  approved: "Estimate Approved",
  rejected: "Estimate Rejected",
};

const ESTIMATE_STYLES = {
  not_created: "bg-slate-100 text-slate-700",
  pending_approval: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

// Technicians must not mark requests resolved directly.
// The admin completion-review function handles resolution.
const ALLOWED_NEXT_STATUSES = {
  assigned: ["visit_scheduled", "in_progress"],
  visit_scheduled: ["in_progress", "awaiting_customer"],
  in_progress: ["awaiting_customer", "visit_scheduled"],
  awaiting_customer: ["in_progress", "visit_scheduled"],
};

const ACTIVE_STATUSES = [
  "assigned",
  "visit_scheduled",
  "in_progress",
  "awaiting_customer",
];

function formatDate(value) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {STATUS_LABELS[status] || status || "Unknown"}
    </span>
  );
}

function EstimateBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        ESTIMATE_STYLES[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {ESTIMATE_LABELS[status] || status || "Unknown"}
    </span>
  );
}

function Modal({ title, description, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#412653]">{title}</h2>

            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function EstimatePreparationForm({
  request,
  onSubmitted,
  onCancel,
}) {
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [diagnosticNotes, setDiagnosticNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const minimum = Number(minAmount);
    const maximum = Number(maxAmount);

    if (
      minAmount.trim() === "" ||
      maxAmount.trim() === "" ||
      !Number.isFinite(minimum) ||
      !Number.isFinite(maximum)
    ) {
      setError("Enter valid minimum and maximum amounts.");
      return;
    }

    if (minimum < 0 || maximum < 0) {
      setError("Estimate amounts cannot be negative.");
      return;
    }

    if (maximum < minimum) {
      setError(
        "The maximum estimate must be greater than or equal to the minimum estimate."
      );
      return;
    }

    if (!diagnosticNotes.trim()) {
      setError(
        "Add diagnostic notes explaining the issue and the proposed repair."
      );
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "create_repair_estimate",
        {
          p_request_id: request.id,
          p_min_amount: minimum,
          p_max_amount: maximum,
          p_diagnostic_notes: diagnosticNotes.trim(),
        }
      );

      if (rpcError) throw rpcError;

      if (!data) {
        throw new Error("The estimate was not returned by the server.");
      }

      onSubmitted();
    } catch (err) {
      console.error("Estimate submission failed:", err);

      setError(
        err?.message ||
          "Could not submit the estimate. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Service Request
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {request.device_brand || "Unknown Brand"}{" "}
          {request.device_model || ""}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {request.device_type || "Device"} ·{" "}
          {request.category || "Uncategorized"}
        </p>
      </div>

      <div>
        <label
          htmlFor="minAmount"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Minimum estimated cost (₹)
        </label>

        <div className="relative">
          <IndianRupee
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="minAmount"
            type="number"
            min="0"
            step="0.01"
            required
            value={minAmount}
            onChange={(event) => setMinAmount(event.target.value)}
            placeholder="Enter minimum amount"
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="maxAmount"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Maximum estimated cost (₹)
        </label>

        <div className="relative">
          <IndianRupee
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="maxAmount"
            type="number"
            min="0"
            step="0.01"
            required
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value)}
            placeholder="Enter maximum amount"
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20"
          />
        </div>

        {minAmount !== "" && maxAmount !== "" && (
          <p className="mt-2 text-sm text-slate-500">
            Estimated range: {formatCurrency(minAmount)} –{" "}
            {formatCurrency(maxAmount)}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="diagnosticNotes"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Diagnosis and repair details
        </label>

        <textarea
          id="diagnosticNotes"
          rows={5}
          required
          value={diagnosticNotes}
          onChange={(event) => setDiagnosticNotes(event.target.value)}
          placeholder="Describe the suspected issue, required repairs, and factors affecting the cost."
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20"
        />

        <p className="mt-1 text-xs text-slate-500">
          Explain the diagnosis clearly so the customer can make an informed
          decision.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm leading-6 text-amber-900">
          The customer must approve this estimate before you can submit the
          repair completion report. Submitting an estimate does not mean the
          repair has been completed.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#412653] px-5 py-3 font-semibold text-white transition hover:bg-[#53336A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Estimate
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function TechnicianDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedEstimateRequest, setSelectedEstimateRequest] =
    useState(null);

  const [selectedCompletionRequest, setSelectedCompletionRequest] =
    useState(null);

  const loadAssignedRequests = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    setPageError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setRequests([]);
        setPageError("Please sign in to access your technician dashboard.");
        return;
      }

      const { data: requestRows, error: requestError } = await supabase
        .from("service_requests")
        .select("*")
        .eq("technician_id", user.id)
        .order("created_at", { ascending: false });

      if (requestError) throw requestError;

      const assignedRequests = requestRows || [];
      const customerIds = [
        ...new Set(
          assignedRequests
            .map((request) => request.user_id)
            .filter(Boolean)
        ),
      ];

      let profilesById = {};

      if (customerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", customerIds);

        if (profilesError) throw profilesError;

        profilesById = Object.fromEntries(
          (profiles || []).map((profile) => [profile.id, profile])
        );
      }

      setRequests(
        assignedRequests.map((request) => ({
          ...request,
          customer: profilesById[request.user_id] || null,
        }))
      );
    } catch (err) {
      console.error("Failed to load technician requests:", err);

      setPageError(
        err?.message || "Could not load your assigned service requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignedRequests();
  }, [loadAssignedRequests]);

  async function handleStatusUpdate(request, newStatus) {
    setActionError("");

    if (
      !ALLOWED_NEXT_STATUSES[request.status]?.includes(newStatus)
    ) {
      setActionError("This status transition is not available.");
      return;
    }

    setUpdatingRequestId(request.id);

    try {
      const { error } = await supabase.rpc(
        "technician_update_request_status",
        {
          p_request_id: request.id,
          p_new_status: newStatus,
        }
      );

      if (error) throw error;

      await loadAssignedRequests(false);
    } catch (err) {
      console.error("Status update failed:", err);

      setActionError(
        err?.message || "Could not update the request status."
      );
    } finally {
      setUpdatingRequestId(null);
    }
  }

  async function handleEstimateSubmitted() {
    setSelectedEstimateRequest(null);
    await loadAssignedRequests(false);
  }

  async function handleCompletionSubmitted() {
    setSelectedCompletionRequest(null);
    await loadAssignedRequests(false);
  }

  function canPrepareEstimate(request) {
    return (
      ACTIVE_STATUSES.includes(request.status) &&
      ["not_created", "rejected"].includes(
        request.estimate_status || "not_created"
      )
    );
  }

  function canSubmitCompletion(request) {
    return (
      request.estimate_status === "approved" &&
      ACTIVE_STATUSES.includes(request.status)
    );
  }

  const filteredRequests = requests.filter((request) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        request.id,
        request.device_type,
        request.device_brand,
        request.device_model,
        request.category,
        request.description,
        request.customer?.full_name,
        request.customer?.email,
      ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    active: requests.filter((request) =>
      ACTIVE_STATUSES.includes(request.status)
    ).length,
    estimatesPending: requests.filter(
      (request) => request.estimate_status === "pending_approval"
    ).length,
    estimatesNeeded: requests.filter((request) =>
      canPrepareEstimate(request)
    ).length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 size={24} className="animate-spin text-[#D174D2]" />
          <span className="font-medium">Loading technician dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        {/* Header */}
<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
  <div>
    <p className="text-sm font-semibold uppercase tracking-wider text-[#D174D2]">
      Fixora AI
    </p>

    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#412653]">
      Technician Dashboard
    </h1>

    <p className="mt-2 text-slate-600">
      Manage assigned repairs, prepare estimates, and report completed work.
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-3">
    <button
      type="button"
      onClick={() => {
        setRefreshing(true);
        loadAssignedRequests(false);
      }}
      disabled={refreshing}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#D174D2] hover:text-[#412653] disabled:opacity-60"
    >
      <RefreshCw
        size={17}
        className={refreshing ? "animate-spin" : ""}
      />
      Refresh
    </button>

    <button
      type="button"
      onClick={async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
          setActionError(error.message);
        }
      }}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#412653] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#53336A]"
    >
      <LogOut size={17} />
      Sign Out
    </button>
  </div>
</div>

        {/* Page error */}
        {pageError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load dashboard</p>
              <p className="mt-1 text-sm">{pageError}</p>
            </div>
          </div>
        )}

        {/* Action error */}
        {actionError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError("")}
              className="ml-auto rounded p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Assigned Requests"
            value={stats.total}
            icon={<ClipboardList size={22} />}
            description="Requests assigned to you"
          />

          <SummaryCard
            title="Active Repairs"
            value={stats.active}
            icon={<Wrench size={22} />}
            description="Requests currently in progress"
          />

          <SummaryCard
            title="Estimates Required"
            value={stats.estimatesNeeded}
            icon={<FileText size={22} />}
            description="Prepare or revise estimates"
            emphasis={stats.estimatesNeeded > 0}
          />

          <SummaryCard
            title="Awaiting Approval"
            value={stats.estimatesPending}
            icon={<Clock size={22} />}
            description="Waiting for customer decisions"
          />
        </div>

        {/* Search and filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search device, customer, category, or request..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#D174D2]"
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#412653]">
                Your Service Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredRequests.length} request
                {filteredRequests.length === 1 ? "" : "s"} displayed
              </p>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <ClipboardList size={27} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                {requests.length === 0
                  ? "No assigned requests yet"
                  : "No matching requests"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {requests.length === 0
                  ? "Requests assigned to your technician account will appear here."
                  : "Try changing your search or status filter."}
              </p>

              {requests.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 font-semibold text-[#412653] hover:text-[#D174D2]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  updating={updatingRequestId === request.id}
                  onStatusUpdate={handleStatusUpdate}
                  onPrepareEstimate={() =>
                    setSelectedEstimateRequest(request)
                  }
                  onSubmitCompletion={() =>
                    setSelectedCompletionRequest(request)
                  }
                  canPrepareEstimate={canPrepareEstimate(request)}
                  canSubmitCompletion={canSubmitCompletion(request)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estimate preparation modal */}
      {selectedEstimateRequest && (
        <Modal
          title={
            selectedEstimateRequest.estimate_status === "rejected"
              ? "Prepare Revised Estimate"
              : "Prepare Repair Estimate"
          }
          description="Enter the estimated repair cost and diagnostic details."
          onClose={() => setSelectedEstimateRequest(null)}
        >
          <EstimatePreparationForm
            request={selectedEstimateRequest}
            onSubmitted={handleEstimateSubmitted}
            onCancel={() => setSelectedEstimateRequest(null)}
          />
        </Modal>
      )}

      {/* Repair completion modal */}
      {selectedCompletionRequest && (
        <Modal
          title="Submit Repair Completion"
          description="Record the completed work for admin review."
          onClose={() => setSelectedCompletionRequest(null)}
        >
          <RepairCompletionForm
            request={selectedCompletionRequest}
            onSubmitted={handleCompletionSubmitted}
            onCancel={() => setSelectedCompletionRequest(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  description,
  emphasis = false,
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        emphasis
          ? "border-[#D174D2]/50"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-[#412653]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            emphasis
              ? "bg-[#D174D2]/15 text-[#412653]"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function RequestCard({
  request,
  updating,
  onStatusUpdate,
  onPrepareEstimate,
  onSubmitCompletion,
  canPrepareEstimate,
  canSubmitCompletion,
}) {
  const customer = request.customer;

  const allowedStatuses = ALLOWED_NEXT_STATUSES[request.status] || [];

  const estimateStatus = request.estimate_status || "not_created";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Card header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Request ID
            </p>

            <p className="mt-1 break-all font-mono text-sm font-semibold text-[#412653]">
              {request.id}
            </p>
          </div>

          <StatusBadge status={request.status} />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          {[request.device_brand, request.device_model]
            .filter(Boolean)
            .join(" ") ||
            request.device_type ||
            "Service Request"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {request.device_type || "Device"} ·{" "}
          {request.category || "Uncategorized"}
        </p>
      </div>

      <div className="space-y-5 p-5">
        {/* Customer */}
        <section>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <User size={16} />
            Customer
          </div>

          <p className="text-sm font-medium text-slate-900">
            {customer?.full_name || "Customer"}
          </p>

          {customer?.email && (
            <p className="mt-1 break-all text-sm text-slate-500">
              {customer.email}
            </p>
          )}

          {customer?.phone && (
            <p className="mt-1 text-sm text-slate-500">
              {customer.phone}
            </p>
          )}
        </section>

        {/* Description */}
        <section>
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Problem Description
          </p>

          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {request.description || "No description provided."}
          </p>
        </section>

        {/* Location and schedule */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
            <MapPin
              size={17}
              className="mt-0.5 shrink-0 text-[#D174D2]"
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">
                Service Address
              </p>

              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
                {request.service_address || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
            <Calendar
              size={17}
              className="mt-0.5 shrink-0 text-[#D174D2]"
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">
                Preferred Visit
              </p>

              <p className="mt-1 text-sm text-slate-800">
                {formatDate(request.preferred_visit_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Created {formatDate(request.created_at)}
        </div>

        {/* Estimate status */}
        <section className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#412653]" />

              <h4 className="font-semibold text-slate-800">
                Repair Estimate
              </h4>
            </div>

            <EstimateBadge status={estimateStatus} />
          </div>

          {estimateStatus === "not_created" && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              An estimate has not been prepared. Enter the expected repair
              cost and diagnosis, then submit it to the customer for approval.
            </p>
          )}

          {estimateStatus === "pending_approval" && (
            <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-amber-800">
              <Clock size={17} className="mt-1 shrink-0" />

              <p>
                The estimate has been submitted. Wait for the customer to
                approve or reject it before proceeding with the repair
                completion report.
              </p>
            </div>
          )}

          {estimateStatus === "approved" && (
            <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-green-800">
              <CheckCircle2 size={17} className="mt-1 shrink-0" />

              <p>
                The customer has approved the estimate. You can proceed with
                the repair and submit the completion report when the work is
                finished.
              </p>
            </div>
          )}

          {estimateStatus === "rejected" && (
            <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-red-800">
              <AlertCircle size={17} className="mt-1 shrink-0" />

              <p>
                The customer rejected the previous estimate. Review the
                diagnosis and prepare a revised estimate.
              </p>
            </div>
          )}

          {canPrepareEstimate && (
            <button
              type="button"
              onClick={onPrepareEstimate}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#412653] px-4 py-3 font-semibold text-white transition hover:bg-[#53336A]"
            >
              <IndianRupee size={18} />

              {estimateStatus === "rejected"
                ? "Prepare Revised Estimate"
                : "Prepare Estimate"}

              <ArrowRight size={17} />
            </button>
          )}

          {estimateStatus === "pending_approval" && (
            <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
              Customer action required
            </div>
          )}
        </section>

        {/* Request status actions */}
        {allowedStatuses.length > 0 && (
          <section>
            <label
              htmlFor={`status-${request.id}`}
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Update Request Status
            </label>

            <select
              id={`status-${request.id}`}
              value=""
              disabled={updating}
              onChange={(event) => {
                const newStatus = event.target.value;

                if (newStatus) {
                  onStatusUpdate(request, newStatus);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#D174D2] disabled:opacity-60"
            >
              <option value="">
                {updating ? "Updating..." : "Choose next status"}
              </option>

              {allowedStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            {updating && (
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                Updating request...
              </p>
            )}
          </section>
        )}

        {/* Completion action */}
        {canSubmitCompletion && (
          <button
            type="button"
            onClick={onSubmitCompletion}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D174D2] px-4 py-3 font-semibold text-white transition hover:bg-[#BD5EBE]"
          >
            <CheckCircle2 size={18} />
            Submit Repair Completion
            <ArrowRight size={17} />
          </button>
        )}

        {/* Completion blocked until estimate approval */}
        {ACTIVE_STATUSES.includes(request.status) &&
          estimateStatus !== "approved" && (
            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />

              <p>
                Repair completion submission is available only after the
                customer approves the estimate.
              </p>
            </div>
          )}

        {request.status === "resolved" && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-800">
            <CheckCircle2 size={18} />
            This request has been resolved.
          </div>
        )}

        {request.status === "cancelled" && (
          <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">
            This request has been cancelled.
          </div>
        )}
      </div>
    </article>
  );
}