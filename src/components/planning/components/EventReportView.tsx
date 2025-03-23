import React from 'react';
import { X, Download, Printer, Mail, Clock, Users, Paperclip, CheckCircle2, Calendar } from 'lucide-react';
import type { EventReport } from '../../../types';

interface EventReportViewProps {
  report: EventReport;
  onClose: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function EventReportView({ report, onClose, onPrint, onDownload, onShare }: EventReportViewProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{report.title}</h2>
            <div className="flex items-center space-x-2">
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  title="Download Report"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  title="Print Report"
                >
                  <Printer className="h-5 w-5" />
                </button>
              )}
              {onShare && (
                <button
                  onClick={onShare}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  title="Share Report"
                >
                  <Mail className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            Created on {new Date(report.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Attendees */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Attendees</h3>
            <div className="flex flex-wrap gap-2">
              {report.attendees.map((attendee, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  <Users className="h-4 w-4 mr-1" />
                  {attendee}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{report.content}</p>
            </div>
          </div>

          {/* Key Decisions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Key Decisions</h3>
            <ul className="space-y-2">
              {report.decisions.map((decision, index) => (
                <li
                  key={index}
                  className="flex items-start"
                >
                  <span className="flex-shrink-0 h-5 w-5 text-primary-500">•</span>
                  <span className="ml-2 text-gray-700">{decision}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Action Items</h3>
            <div className="space-y-3">
              {report.actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-700">{item.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      {item.assignee && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {item.assignee}
                        </div>
                      )}
                      {item.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {report.attachments && report.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {report.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Paperclip className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-700">{attachment.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}