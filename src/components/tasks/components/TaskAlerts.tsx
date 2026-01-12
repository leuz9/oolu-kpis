import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface TaskAlertsProps {
  error: string | null;
  success: string | null;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

export default function TaskAlerts({
  error,
  success,
  onDismissError,
  onDismissSuccess
}: TaskAlertsProps) {
  return (
    <>
      {error && (
        <div className="animate-slide-down bg-red-50 border-l-4 border-red-400 p-2.5 sm:p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
            <button onClick={onDismissError} className="text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="animate-slide-down bg-green-50 border-l-4 border-green-400 p-2.5 sm:p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
              <p className="text-xs sm:text-sm text-green-700">{success}</p>
            </div>
            <button onClick={onDismissSuccess} className="text-green-400 hover:text-green-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
