import React, { useState } from 'react';
import { X, Plus, Trash2, Paperclip, Link } from 'lucide-react';
import type { Event, EventReport } from '../../../types';

interface EventReportFormProps {
  event: Event;
  onSubmit: (report: Omit<EventReport, 'id' | 'eventId' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

export default function EventReportForm({ event, onSubmit, onClose }: EventReportFormProps) {
  const [formData, setFormData] = useState({
    title: `${event.title} - Summary`,
    content: '',
    attendees: event.participants || [],
    decisions: [''],
    actionItems: [{
      id: Date.now().toString(),
      description: '',
      status: 'pending' as const
    }],
    attachments: [] as EventReport['attachments']
  });

  const [newAttendee, setNewAttendee] = useState('');
  const [newAttachment, setNewAttachment] = useState({
    name: '',
    url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty decisions and action items
    const cleanedData = {
      ...formData,
      decisions: formData.decisions.filter(d => d.trim()),
      actionItems: formData.actionItems.filter(item => item.description.trim())
    };

    await onSubmit(cleanedData);
  };

  const handleAddDecision = () => {
    setFormData(prev => ({
      ...prev,
      decisions: [...prev.decisions, '']
    }));
  };

  const handleDecisionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      decisions: prev.decisions.map((d, i) => i === index ? value : d)
    }));
  };

  const handleRemoveDecision = (index: number) => {
    setFormData(prev => ({
      ...prev,
      decisions: prev.decisions.filter((_, i) => i !== index)
    }));
  };

  const handleAddActionItem = () => {
    setFormData(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, {
        id: Date.now().toString(),
        description: '',
        status: 'pending' as const
      }]
    }));
  };

  const handleActionItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRemoveActionItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index)
    }));
  };

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()]
      }));
      setNewAttendee('');
    }
  };

  const handleRemoveAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const handleAddAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), {
          id: Date.now().toString(),
          name: newAttachment.name.trim(),
          url: newAttachment.url.trim(),
          type: newAttachment.url.split('.').pop() || 'link'
        }]
      }));
      setNewAttachment({ name: '', url: '' });
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(a => a.id !== id) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Create Event Report</h3>
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
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Summary</label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Provide a summary of the event..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attendees</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.attendees.map((attendee, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {attendee}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttendee(index)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAttendee}
                onChange={e => setNewAttendee(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Add attendee"
              />
              <button
                type="button"
                onClick={handleAddAttendee}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Decisions</label>
            {formData.decisions.map((decision, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={decision}
                  onChange={e => handleDecisionChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter decision"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveDecision(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddDecision}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Decision
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Items</label>
            {formData.actionItems.map((item, index) => (
              <div key={item.id} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => handleActionItemChange(index, 'description', e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter action item"
                />
                <input
                  type="text"
                  value={item.assignee || ''}
                  onChange={e => handleActionItemChange(index, 'assignee', e.target.value)}
                  className="w-40 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Assignee"
                />
                <input
                  type="date"
                  value={item.dueDate || ''}
                  onChange={e => handleActionItemChange(index, 'dueDate', e.target.value)}
                  className="w-40 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveActionItem(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddActionItem}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Action Item
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
            <div className="space-y-4">
              {/* Add attachment form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAttachment.name}
                  onChange={e => setNewAttachment({ ...newAttachment, name: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="File name"
                />
                <input
                  type="url"
                  value={newAttachment.url}
                  onChange={e => setNewAttachment({ ...newAttachment, url: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="File URL"
                />
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  disabled={!newAttachment.name || !newAttachment.url}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {/* Attachment list */}
              <div className="space-y-2">
                {formData.attachments?.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Link className="h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {attachment.url}
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Example URLs */}
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-1">Example document URLs:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Google Drive: https://drive.google.com/file/d/...</li>
                  <li>Dropbox: https://www.dropbox.com/s/...</li>
                  <li>OneDrive: https://1drv.ms/...</li>
                  <li>SharePoint: https://company.sharepoint.com/...</li>
                </ul>
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