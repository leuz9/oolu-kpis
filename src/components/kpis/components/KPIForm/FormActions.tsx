import React from 'react';
import { Target } from 'lucide-react';

interface FormActionsProps {
  loading: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

export default function FormActions({ loading, isEdit, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-6 border-t">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Target className="h-4 w-4 mr-2" />
            {isEdit ? 'Save Changes' : 'Create KPI'}
          </>
        )}
      </button>
    </div>
  );
}