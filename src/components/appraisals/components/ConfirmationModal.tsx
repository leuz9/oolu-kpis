import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type ConfirmationType = 'warning' | 'danger' | 'info' | 'success';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  children
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle className="h-6 w-6 text-red-600" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-900',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-900',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-900',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-900',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-gray-600" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-900',
          buttonColor: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          {/* Icon */}
          <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 ${config.bgColor} rounded-full`}>
            {config.icon}
          </div>

          {/* Title */}
          <h3 className={`text-lg font-semibold ${config.textColor} text-center mb-2`}>
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-4">
            {message}
          </p>

          {/* Custom Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-md disabled:opacity-50 transition-colors ${config.buttonColor}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
