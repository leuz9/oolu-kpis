import React from 'react';
import { Download, Search } from 'lucide-react';

interface DocHeaderProps {
  searchTerm: string;
  onSearch: (term: string) => void;
}

export default function DocHeader({ searchTerm, onSearch }: DocHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform documentation and technical guides
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <a
          href="#"
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <Download className="h-5 w-5 mr-2" />
          Download PDF
        </a>
      </div>
    </div>
  );
}