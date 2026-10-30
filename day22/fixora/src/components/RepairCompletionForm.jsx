import { useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  Wrench,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const ITEM_TYPES = [
  { value: "part", label: "Replacement part" },
  { value: "labour", label: "Labour" },
  { value: "diagnostic", label: "Diagnostic fee" },
  { value: "additional_fee", label: "Additional fee" },
  { value: "discount", label: "Discount" },
];

const createItem = () => ({
  id: crypto.randomUUID(),
  item_type: "part",
  description: "",
  quantity: "1",
  unit_price: "",
});

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export default function RepairCompletionForm({
  request,
  onSubmitted,
  onCancel,
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [items, setItems] = useState([createItem()]);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateItem = (id, field, value) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (items.length >= 100) {
      setError("You can add a maximum of 100 charge items.");
      return;
    }

    setItems((current) => [...current, createItem()]);
    setError("");
  };

  const handlePhotoSelection = (event) => {
    const selected = Array.from(event.target.files || []);

    if (photos.length + selected.length > 10) {
      setError("You can upload a maximum of 10 completion photos.");
      event.target.value = "";
      return;
    }

    const invalid = selected.find(
      (file) =>
        !file.type.startsWith("image/") ||
        file.size > 5 * 1024 * 1024
    );

    if (invalid) {
      setError(
        "Select image files only. Each image must be 5 MB or smaller."
      );
      event.target.value = "";
      return;
    }

    setPhotos((current) => [...current, ...selected]);
    setError("");
    event.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((current) =>
      current.filter((_, photoIndex) => photoIndex !== index)
    );
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);

      if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(unitPrice) ||
        quantity <= 0 ||
        unitPrice < 0
      ) {
        return total;
      }

      const lineTotal = quantity * unitPrice;

      if (item.item_type === "discount") {
        return total - lineTotal;
      }

      return total + lineTotal;
    }, 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!request?.id) {
      setError("A valid repair request is required.");
      return;
    }

    if (!diagnosis.trim() || !workPerformed.trim()) {
      setError("Enter both the diagnosis and the work performed.");
      return;
    }

    if (diagnosis.trim().length > 5000) {
      setError("Diagnosis cannot exceed 5000 characters.");
      return;
    }

    if (workPerformed.trim().length > 10000) {
      setError("Work performed cannot exceed 10000 characters.");
      return;
    }

    if (items.length === 0) {
      setError("Add at least one charge item.");
      return;
    }

    const cleanedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);

      if (!item.description.trim()) {
        setError("Every charge item needs a description.");
        return;
      }

      if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(unitPrice) ||
        quantity <= 0 ||
        quantity > 100000 ||
        unitPrice < 0 ||
        unitPrice > 100000000
      ) {
        setError("Check the quantity and price for every charge item.");
        return;
      }

      cleanedItems.push({
        item_type: item.item_type,
        description: item.description.trim(),
        quantity,
        unit_price: unitPrice,
      });
    }

    if (calculateTotal() < 0) {
      setError("The final amount cannot be negative.");
      return;
    }

    setSubmitting(true);

    const uploadedPaths = [];

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      // Upload evidence into a request-specific directory.
      for (const file of photos) {
        const extension = file.name.split(".").pop()?.toLowerCase();

        const safeExtension =
          extension && /^[a-z0-9]{1,10}$/.test(extension)
            ? extension
            : "jpg";

        const path =
          `${request.id}/${crypto.randomUUID()}.${safeExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("repair-completion-images")
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(path);
      }

      const { data, error: rpcError } = await supabase.rpc(
        "submit_repair_completion",
        {
          p_request_id: request.id,
          p_diagnosis: diagnosis.trim(),
          p_work_performed: workPerformed.trim(),
          p_items: cleanedItems,
          p_completion_photos: uploadedPaths,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      setSuccess("Completion report submitted for admin review.");

      if (onSubmitted) {
        await onSubmitted(data);
      }
    } catch (err) {
      console.error("Repair completion submission failed:", err);

      // Best-effort cleanup if the database submission failed.
      // Never delete evidence if the RPC succeeded.
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("repair-completion-images")
          .remove(uploadedPaths)
          .catch(() => {});
      }

      setError(
        err?.message ||
          "Unable to submit the completion report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#D174D2] focus:ring-2 focus:ring-[#D174D2]/20";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-[#412653]/10 p-3 text-[#412653]">
          <Wrench size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Complete repair
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Request #{request.id.slice(0, 8)} ·{" "}
            {request.device_brand || "Device"}{" "}
            {request.device_model || request.device_type || ""}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Your report will be reviewed before the repair is finalized.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 flex gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClass}>
            Diagnosis *
          </label>

          <textarea
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
            maxLength={5000}
            rows={4}
            required
            placeholder="Describe the confirmed fault and its cause..."
            className={inputClass}
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {diagnosis.length}/5000
          </p>
        </div>

        <div>
          <label className={labelClass}>
            Work performed *
          </label>

          <textarea
            value={workPerformed}
            onChange={(event) =>
              setWorkPerformed(event.target.value)
            }
            maxLength={10000}
            rows={4}
            required
            placeholder="Describe the repairs, replacement parts and tests performed..."
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">
                Itemized charges
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Enter the actual charges for this repair.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={submitting || items.length >= 100}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D174D2]/40 px-3 py-2 text-sm font-medium text-[#412653] hover:bg-[#D174D2]/10 disabled:opacity-50"
            >
              <Plus size={16} />
              Add item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const quantity = Number(item.quantity);
              const unitPrice = Number(item.unit_price);

              const lineTotal =
                Number.isFinite(quantity) &&
                Number.isFinite(unitPrice) &&
                quantity > 0 &&
                unitPrice >= 0
                  ? quantity * unitPrice
                  : 0;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Charge {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={submitting || items.length === 1}
                      aria-label={`Remove charge ${index + 1}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Charge type
                      </label>

                      <select
                        value={item.item_type}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "item_type",
                            event.target.value
                          )
                        }
                        className={inputClass}
                        disabled={submitting}
                      >
                        {ITEM_TYPES.map((type) => (
                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Description
                      </label>

                      <input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "description",
                            event.target.value
                          )
                        }
                        maxLength={500}
                        required
                        placeholder="e.g. Replacement component"
                        className={inputClass}
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        max="100000"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "quantity",
                            event.target.value
                          )
                        }
                        required
                        className={inputClass}
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Unit price (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="100000000"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            "unit_price",
                            event.target.value
                          )
                        }
                        required
                        className={inputClass}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end text-sm">
                    <span className="text-slate-500">
                      Line total:{" "}
                    </span>

                    <span className="ml-2 font-semibold text-slate-900">
                      {formatINR(lineTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-slate-700">
                Proposed final amount
              </span>

              <span className="text-xl font-bold text-[#412653]">
                {formatINR(calculateTotal())}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Calculated from the items above. The database
              recalculates the final amount independently.
            </p>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <span className="inline-flex items-center gap-2">
              <Camera size={17} />
              Completion photos
            </span>
          </label>

          <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 px-5 py-7 text-center transition hover:border-[#D174D2] hover:bg-[#D174D2]/5">
            <Upload size={24} className="mb-2 text-[#412653]" />

            <span className="text-sm font-medium text-slate-700">
              Select completion photos
            </span>

            <span className="mt-1 text-xs text-slate-500">
              Images only · Up to 10 photos · 5 MB each
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelection}
              disabled={submitting || photos.length >= 10}
              className="sr-only"
            />
          </label>

          {photos.length > 0 && (
            <div className="mt-3 space-y-2">
              {photos.map((photo, index) => (
                <div
                  key={`${photo.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-700">
                      {photo.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {(photo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    disabled={submitting}
                    aria-label={`Remove ${photo.name}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#412653] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#523269] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Submit for review
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
