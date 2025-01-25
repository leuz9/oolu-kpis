import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AuthAlertProps {
  type: 'error' | 'success';
  message: string;
}

export default function AuthAlert({ type, message }: AuthAlertProps) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500',
      icon: <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500',
      icon: <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
    }
  };

  const { bg, border, icon } = styles[type];

  return (
    <div className={`mb-4 ${bg} border-l-4 ${border} p-4 rounded flex items-center`}>
      {icon}
      <p className="text-sm text-white">{message}</p>
    </div>
  );
}