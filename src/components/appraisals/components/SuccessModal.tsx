import React from 'react';
import { CheckCircle, X, Sparkles, Award, Target, Users } from 'lucide-react';

type SuccessIcon = 'check' | 'sparkles' | 'award' | 'target' | 'users';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  icon?: SuccessIcon;
  onClose: () => void;
  details?: Array<{
    label: string;
    value: string | number;
  }>;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function SuccessModal({
  isOpen,
  title,
  message,
  icon = 'check',
  onClose,
  details,
  actionButton
}: SuccessModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles className="h-8 w-8 text-green-600" />;
      case 'award':
        return <Award className="h-8 w-8 text-green-600" />;
      case 'target':
        return <Target className="h-8 w-8 text-green-600" />;
      case 'users':
        return <Users className="h-8 w-8 text-green-600" />;
      case 'check':
      default:
        return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          {/* Success Icon with Animation */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full animate-bounce">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-green-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-4">
            {message}
          </p>

          {/* Details */}
          {details && details.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                {details.map((detail, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">{detail.label}</span>
                    <span className="text-sm font-bold text-green-900">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confetti Effect */}
          <div className="text-center mb-4">
            <span className="text-4xl">🎉</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="px-4 py-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              {actionButton.label}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick Success Toast (Alternative)
interface SuccessToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function SuccessToast({ message, isOpen, onClose, duration = 3000 }: SuccessToastProps) {
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4 flex items-center gap-3 max-w-md">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full flex-shrink-0">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm font-medium text-gray-900 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
