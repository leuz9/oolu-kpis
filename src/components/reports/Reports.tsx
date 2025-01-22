import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { FileText, Download, Filter, Calendar, Share2, ChevronDown, Printer, Mail, Archive, Clock, BarChart, PieChart, Target, Users } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'objectives' | 'kpis' | 'team' | 'performance';
  description: string;
  lastGenerated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  status: 'generated' | 'scheduled' | 'failed';
  format: 'pdf' | 'excel' | 'csv';
}

const sampleReports: Report[] = [
  {
    id: '1',
    title: 'Quarterly OKR Progress Report',
    type: 'objectives',
    description: 'Comprehensive overview of OKR progress and completion rates',
    lastGenerated: '2024-03-15T10:30:00Z',
    frequency: 'quarterly',
    status: 'generated',
    format: 'pdf'
  },
  {
    id: '2',
    title: 'Monthly KPI Dashboard',
    type: 'kpis',
    description: 'Key performance indicators across all departments',
    lastGenerated: '2024-03-01T14:15:00Z',
    frequency: 'monthly',
    status: 'scheduled',
    format: 'excel'
  },
  {
    id: '3',
    title: 'Team Performance Analysis',
    type: 'team',
    description: 'Detailed analysis of team productivity and goal achievement',
    lastGenerated: '2024-03-10T09:00:00Z',
    frequency: 'monthly',
    status: 'generated',
    format: 'pdf'
  },
  {
    id: '4',
    title: 'Department Performance Report',
    type: 'performance',
    description: 'Performance metrics and trends by department',
    lastGenerated: '2024-03-14T16:45:00Z',
    frequency: 'weekly',
    status: 'generated',
    format: 'excel'
  }
];

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportActions, setShowReportActions] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'objectives':
        return <Target className="h-5 w-5 text-primary-600" />;
      case 'kpis':
        return <BarChart className="h-5 w-5 text-green-600" />;
      case 'team':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'performance':
        return <PieChart className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = filterType === 'all' 
    ? sampleReports 
    : sampleReports.filter(report => report.type === filterType);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="mt-1 text-sm text-gray-500">
                Generate and manage reports for your organization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Reports</option>
                <option value="objectives">Objectives</option>
                <option value="kpis">KPIs</option>
                <option value="team">Team</option>
                <option value="performance">Performance</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                <FileText className="h-5 w-5 mr-2" />
                New Report
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-primary-600" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Scheduled Reports</h3>
                    <p className="text-sm text-gray-500">Manage automated reports</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  3 Active
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Share2 className="h-6 w-6 text-green-600" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Shared Reports</h3>
                    <p className="text-sm text-gray-500">View shared with you</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  5 Reports
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Archive className="h-6 w-6 text-blue-600" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Report Archive</h3>
                    <p className="text-sm text-gray-500">Access past reports</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  12 Archived
                </span>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <div 
                  key={report.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      {getReportIcon(report.type)}
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setShowReportActions(showReportActions === report.id ? null : report.id)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        </button>
                        {showReportActions === report.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Download className="h-4 w-4 mr-3" />
                                Download
                              </button>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Printer className="h-4 w-4 mr-3" />
                                Print
                              </button>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Mail className="h-4 w-4 mr-3" />
                                Email
                              </button>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Clock className="h-4 w-4 mr-3" />
                                Schedule
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    Frequency: {report.frequency}
                    <span className="mx-2">•</span>
                    <FileText className="h-4 w-4 mr-1" />
                    Format: {report.format.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}