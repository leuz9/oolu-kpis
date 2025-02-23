import React from 'react';
import { X } from 'lucide-react';
import type { Objective } from '../../../types';
import ObjectiveDetails from './ObjectiveDetails';

interface ObjectiveDetailsModalProps {
  objective: Objective;
  onClose: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onLinkKPI: (kpiId: string) => Promise<void>;
  onUnlinkKPI: (kpiId: string) => Promise<void>;
}

export default function ObjectiveDetailsModal({
  objective,
  onClose,
  onEdit,
  onArchive,
  onLinkKPI,
  onUnlinkKPI
}: ObjectiveDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Objective Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <ObjectiveDetails
            objective={objective}
            onEdit={onEdit}
            onArchive={onArchive}
            onLinkKPI={onLinkKPI}
            onUnlinkKPI={onUnlinkKPI}
          />
        </div>
      </div>
    </div>
  );
}