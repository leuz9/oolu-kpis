import React from 'react';
import { Menu, X } from 'lucide-react';

interface LogoProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Logo({ sidebarOpen, setSidebarOpen }: LogoProps) {
  return (
    <div className="p-4 flex items-center justify-between border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
      <div className="flex items-center">
        <img 
          src="https://ignite-power.com/wp-content/uploads/2024/03/ignite-logo.png" 
          alt="Ignite Power" 
          className="h-8 w-8 object-contain bg-white rounded-lg p-1"
        />
        {sidebarOpen && <span className="ml-2 text-xl font-semibold text-white">OKRFlow</span>}
      </div>
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>
  );
}