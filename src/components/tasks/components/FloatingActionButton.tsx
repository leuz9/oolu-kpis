import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white rounded-full p-4 sm:p-5 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 active:scale-95 group animate-bounce-subtle hover:animate-none"
      title="Create New Task (⌘N)"
      aria-label="Create New Task"
    >
      <Plus className="h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-90 transition-transform duration-300" />
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
    </button>
  );
}
