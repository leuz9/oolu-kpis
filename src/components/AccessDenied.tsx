import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
  message?: string;
}

export default function AccessDenied({ message = 'You do not have permission to access this page.' }: AccessDeniedProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <ShieldOff className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}