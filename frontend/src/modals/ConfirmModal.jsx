import { Dialog } from "@headlessui/react";
import { useState } from "react";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure?", confirmText = "Yes", cancelText = "Cancel" }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-40" />
      <div className="bg-white rounded-xl p-6 z-50 shadow-lg w-11/12 max-w-md">
        <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
        <Dialog.Description className="mt-2 text-sm text-gray-600">{message}</Dialog.Description>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
