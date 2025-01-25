import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  error: string | null;
}

export default function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded flex items-center">
      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
      <p className="text-sm text-red-700">{error}</p>
    </div>
  );
}