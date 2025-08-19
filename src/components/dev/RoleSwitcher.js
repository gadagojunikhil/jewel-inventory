import React from 'react';
import { User, Shield, Crown, Users, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RoleSwitcher = () => {
  const { setAuthData, user } = useAuth();

  const roles = [
    { 
      token: 'dummy-token', 
      role: 'super_admin', 
      username: 'admin', 
      id: 4, 
      icon: Crown, 
      color: 'purple',
      label: 'Super Admin'
    },
    { 
      token: 'dummy-token-admin', 
      role: 'admin', 
      username: 'admin_user', 
      id: 3, 
      icon: Shield, 
      color: 'red',
      label: 'Admin'
    },
    { 
      token: 'dummy-token-manager', 
      role: 'manager', 
      username: 'manager_user', 
      id: 2, 
      icon: Users, 
      color: 'blue',
      label: 'Manager'
    },
    { 
      token: 'dummy-token-user', 
      role: 'user', 
      username: 'test_user', 
      id: 1, 
      icon: User, 
      color: 'green',
      label: 'User'
    },
    { 
      token: 'dummy-token-guest', 
      role: 'guest', 
      username: 'guest_user', 
      id: 5, 
      icon: Eye, 
      color: 'gray',
      label: 'Guest'
    }
  ];

  const switchRole = (roleData) => {
    localStorage.setItem('token', roleData.token);
    setAuthData({
      id: roleData.id,
      role: roleData.role,
      username: roleData.username
    }, roleData.token);
    
    // Reload to apply changes
    window.location.reload();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border z-50">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Dev Role Switcher</h3>
      <p className="text-xs text-gray-500 mb-2">Current: {user?.role || 'Unknown'}</p>
      <div className="space-y-2">
        {roles.map((role) => {
          const IconComponent = role.icon;
          const isActive = user?.role === role.role;
          
          return (
            <button
              key={role.role}
              onClick={() => switchRole(role)}
              disabled={isActive}
              className={`flex items-center space-x-2 w-full p-2 rounded text-sm transition-colors ${
                isActive 
                  ? `bg-${role.color}-100 text-${role.color}-800 cursor-not-allowed` 
                  : `hover:bg-${role.color}-50 text-gray-700 hover:text-${role.color}-700`
              }`}
            >
              <IconComponent size={16} />
              <span>{role.label}</span>
              {isActive && <span className="text-xs">(Current)</span>}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">Development only</p>
    </div>
  );
};

export default RoleSwitcher;
