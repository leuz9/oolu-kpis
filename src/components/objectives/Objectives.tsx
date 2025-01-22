import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import ObjectiveHierarchy from './ObjectiveHierarchy';
import type { Objective } from '../../types';

// Example data - replace with actual data from your backend
const sampleObjectives: Objective[] = [
  {
    id: 'obj-1',
    title: 'Expand Solar Energy Access',
    description: 'Increase solar energy accessibility across rural areas',
    progress: 65,
    keyResults: [],
    owner: 'user-1',
    dueDate: '2024-12-31',
    status: 'on-track',
    level: 'company',
    quarter: '2024-Q1',
    year: 2024,
    weight: 1,
    contributors: ['user-1', 'user-2'],
  },
  {
    id: 'obj-2',
    title: 'Optimize Installation Process',
    description: 'Streamline solar panel installation workflow',
    progress: 45,
    keyResults: [],
    owner: 'user-2',
    dueDate: '2024-09-30',
    status: 'at-risk',
    level: 'department',
    parentId: 'obj-1',
    departmentId: 'dept-1',
    quarter: '2024-Q1',
    year: 2024,
    weight: 0.8,
    contributors: ['user-3', 'user-4'],
  },
  {
    id: 'obj-3',
    title: 'Improve Installation Time',
    description: 'Reduce average installation time by 25%',
    progress: 80,
    keyResults: [],
    owner: 'user-3',
    dueDate: '2024-06-30',
    status: 'on-track',
    level: 'individual',
    parentId: 'obj-2',
    departmentId: 'dept-1',
    assigneeId: 'user-3',
    quarter: '2024-Q1',
    year: 2024,
    weight: 0.6,
    contributors: ['user-3'],
  },
];

export default function Objectives() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);

  const handleObjectiveSelect = (objective: Objective) => {
    setSelectedObjective(objective);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Objectives</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ObjectiveHierarchy 
              objectives={sampleObjectives}
              onObjectiveSelect={handleObjectiveSelect}
            />
          </div>
          
          <div className="lg:col-span-2">
            {selectedObjective ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedObjective.title}
                </h2>
                <p className="text-gray-600 mb-6">{selectedObjective.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Level</label>
                    <p className="text-gray-900 capitalize">{selectedObjective.level}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-gray-900 capitalize">{selectedObjective.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Due Date</label>
                    <p className="text-gray-900">{new Date(selectedObjective.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Progress</label>
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{ width: `${selectedObjective.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{selectedObjective.progress}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Add more details and actions as needed */}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center text-gray-500">
                Select an objective to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}