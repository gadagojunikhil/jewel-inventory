import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ currentModule, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="bg-white shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-xl font-semibold capitalize">
          {currentModule.replace('-', ' ')}
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          Welcome, Admin User
        </div>
      </div>
    </div>
  );
};
