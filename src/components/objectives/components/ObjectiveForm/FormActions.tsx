import React from 'react';

interface FormActionsProps {
  onCancel: () => void;
  isEdit: boolean;
}

export default function FormActions({ onCancel, isEdit }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        {isEdit ? 'Save Changes' : 'Create Objective'}
      </button>
    </div>
  );
}