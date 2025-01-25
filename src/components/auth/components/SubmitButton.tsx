import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';

interface SubmitButtonProps {
  type: 'login' | 'register';
  loading: boolean;
}

export default function SubmitButton({ type, loading }: SubmitButtonProps) {
  const Icon = type === 'login' ? LogIn : UserPlus;
  const text = type === 'login' 
    ? (loading ? 'Signing in...' : 'Sign in')
    : (loading ? 'Creating account...' : 'Create account');

  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Icon className="h-5 w-5 mr-2" />
      {text}
    </button>
  );
}