import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 hidden items-center justify-center rounded-full bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 p-5 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl active:scale-95 group animate-bounce-subtle hover:animate-none sm:flex"
      title="Create New Task (⌘N)"
      aria-label="Create New Task"
    >
      <Plus className="h-6 w-6 sm:h-7 sm:w-7 group-hover:rotate-90 transition-transform duration-300" />
      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
    </button>
  );
}
