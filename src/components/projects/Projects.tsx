import React from 'react';
import Sidebar from '../Sidebar';
import { Briefcase, Clock, Users, CheckCircle } from 'lucide-react';

export default function Projects() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const projects = [
    {
      id: 1,
      name: 'Solar Panel Installation',
      status: 'In Progress',
      progress: 75,
      team: 4,
      deadline: '2024-06-30',
      description: 'Installation of solar panels in rural areas to provide sustainable energy solutions.',
    },
    {
      id: 2,
      name: 'Grid Optimization',
      status: 'Planning',
      progress: 25,
      team: 3,
      deadline: '2024-07-15',
      description: 'Optimizing the power grid for better energy distribution and efficiency.',
    },
    {
      id: 3,
      name: 'Community Training',
      status: 'Completed',
      progress: 100,
      team: 2,
      deadline: '2024-05-30',
      description: 'Training local communities on solar power system maintenance and basic troubleshooting.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <Briefcase className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">{project.progress}% complete</p>
              </div>

              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(project.deadline).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {project.team} team members
                </div>
                {project.status === 'Completed' && (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}