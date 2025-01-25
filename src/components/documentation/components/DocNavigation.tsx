import React from 'react';
import type { DocSection } from '../types';

interface DocNavigationProps {
  docs: DocSection[];
  selectedDoc: DocSection;
  onSelectDoc: (doc: DocSection) => void;
  activeTab: 'functional' | 'technical';
}

export default function DocNavigation({ docs, selectedDoc, onSelectDoc, activeTab }: DocNavigationProps) {
  return (
    <div className="col-span-3">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {activeTab === 'functional' ? 'User Guide' : 'Technical Guide'}
        </h3>
        <nav className="space-y-2">
          {docs.map((doc) => {
            const Icon = doc.icon;
            return (
              <button
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg ${
                  selectedDoc.id === doc.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="ml-3">{doc.title}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}