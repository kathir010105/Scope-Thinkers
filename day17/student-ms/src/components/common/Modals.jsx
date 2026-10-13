import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children, size = "max-w-lg" }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      ref={overlayRef}
    >
      <div
        className={`${size} w-full bg-white rounded-2xl shadow-xl overflow-hidden`}
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger", loading = false }) {
  const colors = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title={title} size="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 ${colors[variant]}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}