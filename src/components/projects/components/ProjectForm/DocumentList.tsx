import React, { useState } from 'react';
import { Link, Trash2 } from 'lucide-react';
import type { Project } from '../../../../types';

interface DocumentListProps {
  documents: Project['documents'];
  onAdd: (document: { name: string; url: string; }) => void;
  onRemove: (index: number) => void;
}

export default function DocumentList({ documents, onAdd, onRemove }: DocumentListProps) {
  const [newDocument, setNewDocument] = useState({
    name: '',
    url: ''
  });

  const handleAdd = () => {
    if (newDocument.name.trim() && newDocument.url.trim()) {
      onAdd({
        name: newDocument.name.trim(),
        url: newDocument.url.trim()
      });
      setNewDocument({ name: '', url: '' });
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Documents</h4>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={newDocument.name}
            onChange={e => setNewDocument({ ...newDocument, name: e.target.value })}
            placeholder="Document name"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <input
            type="url"
            value={newDocument.url}
            onChange={e => setNewDocument({ ...newDocument, url: e.target.value })}
            placeholder="Document URL"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newDocument.name.trim() || !newDocument.url.trim()}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Document
        </button>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={doc.id || index}
              className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
            >
              <div className="flex items-center flex-1 min-w-0">
                <Link className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  <a 
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 truncate block"
                  >
                    {doc.url}
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-4 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}