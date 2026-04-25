import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

/**
 * Reusable confirmation dialog.
 * Props: title, message, confirmLabel, danger, onConfirm, onCancel, loading
 */
const ConfirmModal = ({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[100] animate-fade-in">
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slide-up border border-theme">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? "bg-red-500/10" : "bg-amber-500/10"}`}>
              <FiAlertTriangle className={`text-lg ${danger ? "text-red-500" : "text-amber-500"}`} />
            </div>
            <h3 className="font-bold text-theme-primary text-base">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-xl bg-surface hover:opacity-80 flex items-center justify-center transition border border-theme"
          >
            <FiX className="text-theme-muted text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-theme-secondary text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-surface border border-theme text-theme-secondary text-sm font-medium hover:opacity-80 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 active:scale-[0.98]
              ${danger
                ? "bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/20"
                : "bg-theme-primary hover:opacity-90"
              }`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
