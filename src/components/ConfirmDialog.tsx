"use client";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  confirmColor = "bg-green-700 hover:bg-green-800",
  onConfirm, onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-2 rounded-lg font-medium text-sm transition ${confirmColor}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
