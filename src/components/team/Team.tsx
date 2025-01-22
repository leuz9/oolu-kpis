import React from 'react';
import Sidebar from '../Sidebar';
import { Users } from 'lucide-react';

export default function Team() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Team Lead',
      department: 'Engineering',
      email: 'john.doe@ignite.solar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Product Manager',
      department: 'Product',
      email: 'jane.smith@ignite.solar',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Developer',
      department: 'Engineering',
      email: 'mike.johnson@ignite.solar',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <Users className="h-5 w-5 mr-2" />
            Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Department:</span> {member.department}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {member.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}