import React from 'react';
import { Menu, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ currentModule, sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  
  const getRoleDisplay = (role) => {
    switch(role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'user': return 'User';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <User size={16} className="text-gray-600" />
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
            {getRoleDisplay(user?.role)}
          </span>
        </div>
      </div>
    </div>
  );
};
