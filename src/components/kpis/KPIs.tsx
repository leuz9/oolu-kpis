import React from 'react';
import Sidebar from '../Sidebar';
import KPIOverview from '../KPIOverview';

export default function KPIs() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Key Performance Indicators</h1>
        <KPIOverview />
      </div>
    </div>
  );
}