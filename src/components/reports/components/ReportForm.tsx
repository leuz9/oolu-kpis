import React, { useState } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import type { Report } from '../../../types';

interface ReportFormProps {
  onSubmit: (report: Omit<Report, 'id' | 'createdAt' | 'lastGenerated' | 'status' | 'createdBy'>) => Promise<void>;
  onClose: () => void;
}

export default function ReportForm({ onSubmit, onClose }: ReportFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'objectives' as Report['type'],
    description: '',
    frequency: 'monthly' as Report['frequency'],
    format: 'pdf' as Report['format'],
    parameters: {
      dateRange: {
        start: '',
        end: ''
      },
      departments: [] as string[],
      metrics: [] as string[]
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-600 bg-opacity-50 p-2 sm:items-center sm:p-4">
      <div className="max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 sm:max-h-[calc(100dvh-2rem)] sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Create New Report</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Report Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g., Monthly OKR Progress Report"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as Report['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="objectives">Objectives</option>
              <option value="kpis">KPIs</option>
              <option value="team">Team</option>
              <option value="performance">Performance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Describe the purpose and content of this report"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select
                value={formData.frequency}
                onChange={e => setFormData({ ...formData, frequency: e.target.value as Report['frequency'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Format</label>
              <select
                value={formData.format}
                onChange={e => setFormData({ ...formData, format: e.target.value as Report['format'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-500">Start Date</label>
                <input
                  type="date"
                  value={formData.parameters.dateRange.start}
                  onChange={e => setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      dateRange: {
                        ...formData.parameters.dateRange,
                        start: e.target.value
                      }
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">End Date</label>
                <input
                  type="date"
                  value={formData.parameters.dateRange.end}
                  onChange={e => setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      dateRange: {
                        ...formData.parameters.dateRange,
                        end: e.target.value
                      }
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
