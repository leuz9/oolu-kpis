import React from 'react';

interface ArchiveConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ArchiveConfirmModal({ onConfirm, onCancel }: ArchiveConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Archive Objective</h3>
        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to archive this objective? This action will hide the objective from active views but preserve its history.
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}