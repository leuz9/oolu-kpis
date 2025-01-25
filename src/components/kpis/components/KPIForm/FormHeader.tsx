import React from 'react';
import { X } from 'lucide-react';

interface FormHeaderProps {
  title: string;
  onClose: () => void;
}

export default function FormHeader({ title, onClose }: FormHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Define and track your key performance indicators
        </p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}