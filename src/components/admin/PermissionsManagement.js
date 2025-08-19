import React, { useState } from 'react';
import { Shield, Check, X, Settings, Info, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PermissionsManagement = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState('user');
  const [editablePermissions, setEditablePermissions] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customPermissions, setCustomPermissions] = useState({});

  // All pages/features in the system with their details
  const systemPages = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Main overview page with statistics and quick access',
      category: 'Core',
      icon: '📊'
    },
    {
      id: 'user-management',
      name: 'User Management',
      description: 'Create, edit, delete users and manage their roles',
      category: 'Admin',
      icon: '👥'
    },
    {
      id: 'material-management',
      name: 'Material Management',
      description: 'Manage jewelry materials, prices, and inventory',
      category: 'Admin',
      icon: '💎'
    },
    {
      id: 'category-management',
      name: 'Category Management',
      description: 'Manage jewelry categories and classifications',
      category: 'Admin',
      icon: '📂'
    },
    {
      id: 'vendor-management',
      name: 'Vendor Management',
      description: 'Manage vendor information and contacts',
      category: 'Admin',
      icon: '🏢'
    },
    {
      id: 'view-inventory',
      name: 'View Inventory',
      description: 'Browse and search jewelry inventory',
      category: 'Inventory',
      icon: '👁️'
    },
    {
      id: 'add-inventory',
      name: 'Add Inventory',
      description: 'Add new jewelry pieces to inventory',
      category: 'Inventory',
      icon: '➕'
    },
    {
      id: 'edit-inventory',
      name: 'Edit Inventory',
      description: 'Modify existing jewelry pieces',
      category: 'Inventory',
      icon: '✏️'
    },
    {
      id: 'indian-billing',
      name: 'Indian Billing',
      description: 'Generate bills for Indian market',
      category: 'Billing',
      icon: '🧾'
    },
    {
      id: 'us-billing',
      name: 'US Billing',
      description: 'Generate bills for US market',
      category: 'Billing',
      icon: '💵'
    },
    {
      id: 'available-stock',
      name: 'Available Stock Report',
      description: 'View current stock levels and availability',
      category: 'Reports',
      icon: '📈'
    },
    {
      id: 'vendor-stock',
      name: 'Vendor Stock Report',
      description: 'View stock by vendor breakdown',
      category: 'Reports',
      icon: '📊'
    },
    {
      id: 'dollar-rate',
      name: 'Dollar Rate Utility',
      description: 'Get current exchange rates',
      category: 'Utilities',
      icon: '💱'
    },
    {
      id: 'data-sync',
      name: 'Data Synchronization',
      description: 'Synchronize data across systems',
      category: 'Utilities',
      icon: '🔄'
    }
  ];

  // Current permission matrix
  const getPermissionMatrix = () => {
    const permissions = {};
    
    systemPages.forEach(page => {
      permissions[page.id] = {
        super_admin: getPageAccess(page.id, 'super_admin'),
        admin: getPageAccess(page.id, 'admin'),
        manager: getPageAccess(page.id, 'manager'),
        user: getPageAccess(page.id, 'user')
      };
    });

    return permissions;
  };

  // Get access level for a specific page and role
  const getPageAccess = (pageId, role) => {
    switch (pageId) {
      case 'dashboard':
        return { access: true, level: 'view' };
      
      case 'user-management':
        return role === 'super_admin' 
          ? { access: true, level: 'full' }
          : { access: false, level: 'none' };
      
      case 'material-management':
        if (['super_admin', 'admin'].includes(role)) {
          return { access: true, level: 'full' };
        } else if (role === 'manager') {
          return { access: true, level: 'edit' };
        } else {
          return { access: true, level: 'view' };
        }
      
      case 'category-management':
      case 'vendor-management':
        return ['super_admin', 'admin', 'manager'].includes(role)
          ? { access: true, level: 'full' }
          : { access: false, level: 'none' };
      
      case 'add-inventory':
      case 'edit-inventory':
        return ['super_admin', 'admin', 'manager'].includes(role)
          ? { access: true, level: 'full' }
          : { access: false, level: 'none' };
      
      case 'view-inventory':
      case 'available-stock':
      case 'vendor-stock':
        return { access: true, level: 'view' };
      
      case 'indian-billing':
      case 'us-billing':
        return ['super_admin', 'admin', 'manager'].includes(role)
          ? { access: true, level: 'full' }
          : { access: false, level: 'none' };
      
      case 'dollar-rate':
      case 'data-sync':
        return ['super_admin', 'admin', 'manager'].includes(role)
          ? { access: true, level: 'full' }
          : { access: false, level: 'none' };
      
      default:
        return { access: false, level: 'none' };
    }
  };

  const getAccessIcon = (access) => {
    if (!access.access) return <X className="w-4 h-4 text-red-500" />;
    
    switch (access.level) {
      case 'full': return <Check className="w-4 h-4 text-green-500" />;
      case 'edit': return <Settings className="w-4 h-4 text-blue-500" />;
      case 'view': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getAccessText = (access) => {
    if (!access.access) return 'No Access';
    
    switch (access.level) {
      case 'full': return 'Full Access';
      case 'edit': return 'Edit Only';
      case 'view': return 'View Only';
      default: return 'No Access';
    }
  };

  const getAccessColor = (access) => {
    if (!access.access) return 'bg-red-50 text-red-700';
    
    switch (access.level) {
      case 'full': return 'bg-green-50 text-green-700';
      case 'edit': return 'bg-blue-50 text-blue-700';
      case 'view': return 'bg-gray-50 text-gray-700';
      default: return 'bg-red-50 text-red-700';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedPages = systemPages.reduce((acc, page) => {
    if (!acc[page.category]) acc[page.category] = [];
    acc[page.category].push(page);
    return acc;
  }, {});

  const permissions = getPermissionMatrix();

  // Initialize editable permissions on first load
  React.useEffect(() => {
    loadCustomPermissions();
  }, []);

  React.useEffect(() => {
    if (Object.keys(editablePermissions).length === 0) {
      const mergedPermissions = mergePermissions(permissions, customPermissions);
      setEditablePermissions(mergedPermissions);
    }
  }, [permissions, customPermissions]);

  // Load custom permissions from backend
  const loadCustomPermissions = async () => {
    try {
      setLoading(true);
      
      let token = localStorage.getItem('token');
      if (!token) {
        token = 'dummy-token';
        localStorage.setItem('token', token);
      }

      const response = await fetch('/api/permissions', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      
      const data = await response.json();
      if (data.success) {
        setCustomPermissions(data.data);
      }
    } catch (error) {
      console.error('Error loading custom permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Merge default permissions with custom overrides
  const mergePermissions = (defaultPermissions, customOverrides) => {
    const merged = { ...defaultPermissions };
    
    Object.keys(customOverrides).forEach(pageId => {
      if (merged[pageId]) {
        Object.keys(customOverrides[pageId]).forEach(role => {
          merged[pageId][role] = customOverrides[pageId][role];
        });
      }
    });
    
    return merged;
  };

  // Handle permission change
  const handlePermissionChange = (pageId, role, newLevel) => {
    const updatedPermissions = {
      ...editablePermissions,
      [pageId]: {
        ...editablePermissions[pageId],
        [role]: {
          access: newLevel !== 'none',
          level: newLevel
        }
      }
    };
    setEditablePermissions(updatedPermissions);
    setHasChanges(true);
  };

  // Save changes
  const savePermissions = async () => {
    try {
      setLoading(true);
      
      let token = localStorage.getItem('token');
      if (!token) {
        token = 'dummy-token';
        localStorage.setItem('token', token);
      }

      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: editablePermissions })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save permissions');
      }
      
      const data = await response.json();
      console.log('Save response:', data);
      
      if (data.success) {
        alert('Permissions saved successfully!');
        setCustomPermissions(editablePermissions);
        setHasChanges(false);
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to save permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Error saving permissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset changes
  const resetChanges = () => {
    const mergedPermissions = mergePermissions(permissions, customPermissions);
    setEditablePermissions(mergedPermissions);
    setHasChanges(false);
    setIsEditing(false);
  };

  // Reset to default permissions
  const resetToDefault = async () => {
    if (window.confirm('Are you sure you want to reset all permissions to default? This will remove all custom permission settings.')) {
      try {
        setLoading(true);
        
        let token = localStorage.getItem('token');
        if (!token) {
          token = 'dummy-token';
          localStorage.setItem('token', token);
        }

        const response = await fetch('/api/permissions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to reset permissions');
        }
        
        const data = await response.json();
        if (data.success) {
          setCustomPermissions({});
          setEditablePermissions(permissions);
          setHasChanges(false);
          setIsEditing(false);
          alert('Permissions reset to default successfully!');
        } else {
          throw new Error(data.message || 'Failed to reset permissions');
        }
      } catch (error) {
        console.error('Error resetting permissions:', error);
        alert('Error resetting permissions: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Get current permissions (editable or default)
  const getCurrentPermissions = () => {
    return Object.keys(editablePermissions).length > 0 ? editablePermissions : permissions;
  };

  // Editable Permission Cell Component
  const EditablePermissionCell = ({ pageId, role, access }) => {
    if (!isEditing) {
      return (
        <div className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 ${getAccessColor(access)} border`}>
          <span className="mr-1">{getAccessIcon(access)}</span>
          <span className="hidden sm:inline">{getAccessText(access)}</span>
        </div>
      );
    }

    return (
      <select
        value={access.access ? access.level : 'none'}
        onChange={(e) => handlePermissionChange(pageId, role, e.target.value)}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="none">🚫 No Access</option>
        <option value="view">👁️ View Only</option>
        <option value="edit">✏️ Edit Only</option>
        <option value="full">✅ Full Access</option>
      </select>
    );
  };

  // Only super admin can access this page
  if (user?.role !== 'super_admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-600">Only Super Administrators can access the User Permissions page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">User Permissions</h1>
        </div>
        <p className="text-gray-600">
          Manage and view access permissions for different user roles across all system pages.
        </p>
      </div>

      {/* Role Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">View Permissions by Role</h2>
        </div>
        <div className="flex space-x-2">
          {['super_admin', 'admin', 'manager', 'user'].map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRole === role
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Overview for Selected Role */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Permissions for: 
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedRole)}`}>
              {selectedRole.replace('_', ' ').toUpperCase()}
            </span>
          </h2>
        </div>

        {Object.entries(groupedPages).map(([category, pages]) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map(page => {
                const currentPermissions = getCurrentPermissions();
                const access = currentPermissions[page.id] ? currentPermissions[page.id][selectedRole] : { access: false, level: 'none' };
                return (
                  <div
                    key={page.id}
                    className={`p-4 rounded-lg border ${getAccessColor(access)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{page.icon}</span>
                        <h4 className="font-medium">{page.name}</h4>
                      </div>
                      {getAccessIcon(access)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{page.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {getAccessText(access)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions for Bulk Permission Changes */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                const updatedPermissions = { ...editablePermissions };
                systemPages.forEach(page => {
                  updatedPermissions[page.id] = {
                    ...updatedPermissions[page.id],
                    user: { access: true, level: 'view' }
                  };
                });
                setEditablePermissions(updatedPermissions);
                setHasChanges(true);
              }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-green-800 font-medium"
            >
              👁️ Give Users View Access to All
            </button>
            <button
              onClick={() => {
                const updatedPermissions = { ...editablePermissions };
                systemPages.forEach(page => {
                  updatedPermissions[page.id] = {
                    ...updatedPermissions[page.id],
                    user: { access: false, level: 'none' }
                  };
                });
                setEditablePermissions(updatedPermissions);
                setHasChanges(true);
              }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-red-800 font-medium"
            >
              🚫 Remove All User Access
            </button>
            <button
              onClick={() => {
                const updatedPermissions = { ...editablePermissions };
                systemPages.forEach(page => {
                  updatedPermissions[page.id] = {
                    ...updatedPermissions[page.id],
                    manager: { access: true, level: 'full' }
                  };
                });
                setEditablePermissions(updatedPermissions);
                setHasChanges(true);
              }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-800 font-medium"
            >
              ✅ Give Managers Full Access
            </button>
            <button
              onClick={resetToDefault}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-800 font-medium"
            >
              🔄 Reset to Default Permissions
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Permission Matrix Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Complete Permission Matrix
                {isEditing && <span className="ml-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">EDITING MODE</span>}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {isEditing ? 'Click on permission levels to modify access rights' : 'Comprehensive view of all system pages and user role permissions'}
              </p>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Edit Permissions
                </button>
              ) : (
                <>
                  <button
                    onClick={savePermissions}
                    disabled={!hasChanges || loading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                      hasChanges && !loading
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={resetChanges}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  <div className="flex items-center">
                    <span className="mr-2">📄</span>
                    Page / Feature
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-purple-700 uppercase tracking-wider">
                  <div className="flex flex-col items-center">
                    <span className="mb-1">👑</span>
                    <span className="bg-purple-100 px-2 py-1 rounded-full">Super Admin</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-red-700 uppercase tracking-wider">
                  <div className="flex flex-col items-center">
                    <span className="mb-1">🛠️</span>
                    <span className="bg-red-100 px-2 py-1 rounded-full">Admin</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
                  <div className="flex flex-col items-center">
                    <span className="mb-1">📋</span>
                    <span className="bg-blue-100 px-2 py-1 rounded-full">Manager</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-green-700 uppercase tracking-wider">
                  <div className="flex flex-col items-center">
                    <span className="mb-1">👤</span>
                    <span className="bg-green-100 px-2 py-1 rounded-full">User</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(groupedPages).map(([category, pages]) => (
                <React.Fragment key={category}>
                  {/* Category Header Row */}
                  <tr className="bg-gray-100">
                    <td colSpan="5" className="px-6 py-3 text-sm font-bold text-gray-800 bg-gradient-to-r from-gray-200 to-gray-100">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {category.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                  {/* Category Pages */}
                  {pages.map((page, index) => {
                    const currentPermissions = getCurrentPermissions();
                    return (
                      <tr key={page.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 border-r border-gray-200">
                          <div className="flex items-center">
                            <span className="text-xl mr-3">{page.icon}</span>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{page.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{page.description}</div>
                            </div>
                          </div>
                        </td>
                        {['super_admin', 'admin', 'manager', 'user'].map(role => {
                          const access = currentPermissions[page.id] ? currentPermissions[page.id][role] : { access: false, level: 'none' };
                          return (
                            <td key={role} className="px-6 py-4 text-center">
                              <EditablePermissionCell pageId={page.id} role={role} access={access} />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Enhanced Summary Statistics */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{systemPages.length}</div>
              <div className="text-xs text-gray-500">Total Pages</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {systemPages.filter(page => {
                  const currentPermissions = getCurrentPermissions();
                  return currentPermissions[page.id] && currentPermissions[page.id]['user'] && currentPermissions[page.id]['user'].access;
                }).length}
              </div>
              <div className="text-xs text-gray-500">User Accessible</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {systemPages.filter(page => {
                  const currentPermissions = getCurrentPermissions();
                  return currentPermissions[page.id] && currentPermissions[page.id]['manager'] && currentPermissions[page.id]['manager'].access;
                }).length}
              </div>
              <div className="text-xs text-gray-500">Manager Accessible</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-red-600">
                {systemPages.filter(page => {
                  const currentPermissions = getCurrentPermissions();
                  return currentPermissions[page.id] && currentPermissions[page.id]['admin'] && currentPermissions[page.id]['admin'].access;
                }).length}
              </div>
              <div className="text-xs text-gray-500">Admin Accessible</div>
            </div>
          </div>
          {hasChanges && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-800">
                <Info className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">You have unsaved changes. Click "Save Changes" to apply them.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Permission Levels Legend */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Permission Levels Guide
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-center mb-2">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="font-semibold text-green-800 mb-1">Full Access</h4>
              <p className="text-sm text-green-600">Create, Read, Update, Delete</p>
              <div className="mt-2 text-xs bg-green-100 px-2 py-1 rounded text-green-700">
                Complete Control
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-center mb-2">
                <Settings className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="font-semibold text-blue-800 mb-1">Edit Access</h4>
              <p className="text-sm text-blue-600">Read, Update Only</p>
              <div className="mt-2 text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">
                Modify Existing
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-center mb-2">
                <Info className="w-8 h-8 text-gray-500" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">View Only</h4>
              <p className="text-sm text-gray-600">Read Only Access</p>
              <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                Browse & View
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-center mb-2">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="font-semibold text-red-800 mb-1">No Access</h4>
              <p className="text-sm text-red-600">Completely Restricted</p>
              <div className="mt-2 text-xs bg-red-100 px-2 py-1 rounded text-red-700">
                Access Denied
              </div>
            </div>
          </div>
          
          {/* Role Hierarchy Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Role Hierarchy & Responsibilities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded border-l-4 border-purple-400">
                <div className="font-medium text-purple-800">👑 Super Admin</div>
                <div className="text-purple-600 text-xs mt-1">System owner, full control over everything</div>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-red-400">
                <div className="font-medium text-red-800">🛠️ Admin</div>
                <div className="text-red-600 text-xs mt-1">Manages users, inventory, and business operations</div>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                <div className="font-medium text-blue-800">📋 Manager</div>
                <div className="text-blue-600 text-xs mt-1">Handles day-to-day operations and inventory</div>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-green-400">
                <div className="font-medium text-green-800">👤 User</div>
                <div className="text-green-600 text-xs mt-1">Basic access to view reports and data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
