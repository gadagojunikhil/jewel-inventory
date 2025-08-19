import React, { useState } from 'react';
import { Shield, Check, X, Settings, Info, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const PermissionsManagement = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState('user');
  const [editablePermissions, setEditablePermissions] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customPermissions, setCustomPermissions] = useState({});

  // Available roles including the new Guest role
  const availableRoles = [
    { id: 'super_admin', name: 'Super Admin', color: 'bg-purple-100 text-purple-800', icon: '👑' },
    { id: 'admin', name: 'Admin', color: 'bg-red-100 text-red-800', icon: '🛠️' },
    { id: 'manager', name: 'Manager', color: 'bg-blue-100 text-blue-800', icon: '📋' },
    { id: 'user', name: 'User', color: 'bg-green-100 text-green-800', icon: '👤' },
    { id: 'guest', name: 'Guest', color: 'bg-gray-100 text-gray-800', icon: '👥' }
  ];

  // Permission types with their details
  const permissionTypes = [
    { id: 'create', name: 'Create', icon: '➕', color: 'text-green-600' },
    { id: 'view', name: 'View', icon: '👁️', color: 'text-blue-600' },
    { id: 'edit', name: 'Edit', icon: '✏️', color: 'text-yellow-600' },
    { id: 'delete', name: 'Delete', icon: '🗑️', color: 'text-red-600' },
    { id: 'approve', name: 'Approve', icon: '✅', color: 'text-purple-600' }
  ];

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

  // Current permission matrix with new structure
  const getPermissionMatrix = () => {
    const permissions = {};
    
    systemPages.forEach(page => {
      permissions[page.id] = {};
      availableRoles.forEach(role => {
        permissions[page.id][role.id] = getPageAccess(page.id, role.id);
      });
    });

    return permissions;
  };

  // Get access level for a specific page and role with new permission structure
  const getPageAccess = (pageId, role) => {
    const defaultPermissions = {
      create: false,
      view: false,
      edit: false,
      delete: false,
      approve: false
    };

    switch (pageId) {
      case 'dashboard':
        if (role === 'guest') {
          return { view: true };
        }
        return { view: true };
      
      case 'user-management':
        if (role === 'super_admin') {
          return { create: true, view: true, edit: true, delete: true, approve: true };
        }
        return defaultPermissions;
      
      case 'material-management':
        if (role === 'super_admin') {
          return { create: true, view: true, edit: true, delete: true, approve: true };
        } else if (role === 'admin') {
          return { create: true, view: true, edit: true, delete: true, approve: false };
        } else if (role === 'manager') {
          return { create: false, view: true, edit: true, delete: false, approve: false };
        } else if (role === 'user') {
          return { view: true };
        }
        return defaultPermissions;
      
      case 'category-management':
      case 'vendor-management':
        if (['super_admin', 'admin'].includes(role)) {
          return { create: true, view: true, edit: true, delete: true, approve: false };
        } else if (role === 'manager') {
          return { create: true, view: true, edit: true, delete: false, approve: false };
        }
        return defaultPermissions;
      
      case 'add-inventory':
      case 'edit-inventory':
        if (['super_admin', 'admin'].includes(role)) {
          return { create: true, view: true, edit: true, delete: true, approve: true };
        } else if (role === 'manager') {
          return { create: true, view: true, edit: true, delete: false, approve: false };
        }
        return defaultPermissions;
      
      case 'view-inventory':
      case 'available-stock':
      case 'vendor-stock':
        if (role === 'guest') {
          return { view: true };
        }
        return { view: true };
      
      case 'indian-billing':
      case 'us-billing':
        if (['super_admin', 'admin'].includes(role)) {
          return { create: true, view: true, edit: true, delete: true, approve: true };
        } else if (role === 'manager') {
          return { create: true, view: true, edit: false, delete: false, approve: false };
        }
        return defaultPermissions;
      
      case 'dollar-rate':
      case 'data-sync':
        if (['super_admin', 'admin'].includes(role)) {
          return { create: true, view: true, edit: true, delete: false, approve: false };
        } else if (role === 'manager') {
          return { view: true };
        }
        return defaultPermissions;
      
      default:
        return defaultPermissions;
    }
  };

  // Handle permission change for new checkbox structure
  const handlePermissionChange = (pageId, role, permissionType, value) => {
    const updatedPermissions = {
      ...editablePermissions,
      [pageId]: {
        ...editablePermissions[pageId],
        [role]: {
          ...editablePermissions[pageId][role],
          [permissionType]: value
        }
      }
    };
    setEditablePermissions(updatedPermissions);
    setHasChanges(true);
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
      
      const response = await apiService.getCustomPermissions();
      
      if (response.success) {
        setCustomPermissions(response.data);
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
          const backendPermission = customOverrides[pageId][role];
          
          // Convert backend format to new checkbox format
          let newPermission = {
            create: false,
            view: false,
            edit: false,
            delete: false,
            approve: false
          };
          
          if (backendPermission.access) {
            switch (backendPermission.level) {
              case 'full':
                newPermission = {
                  create: true,
                  view: true,
                  edit: true,
                  delete: true,
                  approve: true
                };
                break;
              case 'edit':
                newPermission = {
                  create: false,
                  view: true,
                  edit: true,
                  delete: false,
                  approve: false
                };
                break;
              case 'view':
                newPermission = {
                  create: false,
                  view: true,
                  edit: false,
                  delete: false,
                  approve: false
                };
                break;
            }
          }
          
          merged[pageId][role] = newPermission;
        });
      }
    });
    
    return merged;
  };

  // Save changes
  const savePermissions = async () => {
    try {
      setLoading(true);
      
      // Convert new permission structure to backend format
      const backendPermissions = {};
      
      Object.keys(editablePermissions).forEach(pageId => {
        backendPermissions[pageId] = {};
        
        Object.keys(editablePermissions[pageId]).forEach(role => {
          const permissions = editablePermissions[pageId][role];
          
          // Convert checkbox permissions to backend format
          let access = false;
          let level = 'none';
          
          // Determine access level based on permission combinations
          if (permissions.create || permissions.edit || permissions.delete || permissions.approve || permissions.view) {
            access = true;
            
            if (permissions.create && permissions.edit && permissions.delete && permissions.approve) {
              level = 'full';
            } else if (permissions.create && permissions.edit && permissions.delete) {
              level = 'full'; // Consider this full access even without approve
            } else if (permissions.create && (permissions.edit || permissions.delete || permissions.approve)) {
              level = 'full'; // Any create permission with other management permissions = full
            } else if (permissions.delete || permissions.approve) {
              level = 'full'; // Delete or approve always requires full access
            } else if (permissions.edit) {
              level = 'edit'; // Edit without create/delete/approve = edit level
            } else if (permissions.view) {
              level = 'view';
            }
          }
          
          backendPermissions[pageId][role] = { access, level };
        });
      });
      
      console.log('Sending permissions to backend:', JSON.stringify(backendPermissions, null, 2));
      
      const response = await apiService.saveCustomPermissions(backendPermissions);
      console.log('Save response:', response);
      
      if (response.success) {
        alert('Permissions saved successfully!');
        setCustomPermissions(backendPermissions);
        setHasChanges(false);
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Failed to save permissions');
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
        
        const response = await apiService.resetPermissions();
        
        if (response.success) {
          setCustomPermissions({});
          setEditablePermissions(permissions);
          setHasChanges(false);
          setIsEditing(false);
          alert('Permissions reset to default successfully!');
        } else {
          throw new Error(response.message || 'Failed to reset permissions');
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

      {/* Enhanced Role Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Select User Role to Manage</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {availableRoles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                selectedRole === role.id
                  ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{role.icon}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                {role.name}
              </span>
              {selectedRole === role.id && (
                <span className="text-xs text-blue-600 font-medium">Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Permissions Matrix for Selected Role */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Permissions Matrix for {availableRoles.find(r => r.id === selectedRole)?.name}
                {isEditing && <span className="ml-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">EDITING MODE</span>}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {isEditing ? 'Check/uncheck boxes to modify permissions for this role' : `View all permissions for ${availableRoles.find(r => r.id === selectedRole)?.name} role`}
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
                {permissionTypes.map(permission => (
                  <th key={permission.id} className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex flex-col items-center">
                      <span className={`mb-1 text-lg ${permission.color}`}>{permission.icon}</span>
                      <span className="text-xs">{permission.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(groupedPages).map(([category, pages]) => (
                <React.Fragment key={category}>
                  {/* Category Header Row */}
                  <tr className="bg-gray-100">
                    <td colSpan={permissionTypes.length + 1} className="px-6 py-3 text-sm font-bold text-gray-800 bg-gradient-to-r from-gray-200 to-gray-100">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {category.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                  {/* Category Pages */}
                  {pages.map((page, index) => {
                    const currentPermissions = getCurrentPermissions();
                    const pagePermissions = currentPermissions[page.id] && currentPermissions[page.id][selectedRole] 
                      ? currentPermissions[page.id][selectedRole] 
                      : getPageAccess(page.id, selectedRole);
                    
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
                        {permissionTypes.map(permission => {
                          const hasPermission = pagePermissions[permission.id] || false;
                          return (
                            <td key={permission.id} className="px-4 py-4 text-center">
                              {isEditing ? (
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={hasPermission}
                                    onChange={(e) => handlePermissionChange(page.id, selectedRole, permission.id, e.target.checked)}
                                    className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                </label>
                              ) : (
                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                  hasPermission 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {hasPermission ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </div>
                              )}
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
        
        {/* Permission Summary */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{systemPages.length}</div>
              <div className="text-xs text-gray-500">Total Pages</div>
            </div>
            {permissionTypes.map(permission => {
              const currentPermissions = getCurrentPermissions();
              const count = systemPages.filter(page => {
                const pagePermissions = currentPermissions[page.id] && currentPermissions[page.id][selectedRole] 
                  ? currentPermissions[page.id][selectedRole] 
                  : getPageAccess(page.id, selectedRole);
                return pagePermissions[permission.id];
              }).length;
              
              return (
                <div key={permission.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className={`text-2xl font-bold ${permission.color}`}>{count}</div>
                  <div className="text-xs text-gray-500">{permission.name} Access</div>
                </div>
              );
            })}
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

      {/* Quick Actions for Bulk Permission Changes */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Quick Actions for {availableRoles.find(r => r.id === selectedRole)?.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const updatedPermissions = { ...editablePermissions };
                systemPages.forEach(page => {
                  if (!updatedPermissions[page.id]) updatedPermissions[page.id] = {};
                  updatedPermissions[page.id][selectedRole] = {
                    create: false, view: true, edit: false, delete: false, approve: false
                  };
                });
                setEditablePermissions(updatedPermissions);
                setHasChanges(true);
              }}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-800 font-medium"
            >
              👁️ Grant View Only Access
            </button>
            <button
              onClick={() => {
                const updatedPermissions = { ...editablePermissions };
                systemPages.forEach(page => {
                  if (!updatedPermissions[page.id]) updatedPermissions[page.id] = {};
                  updatedPermissions[page.id][selectedRole] = {
                    create: true, view: true, edit: true, delete: false, approve: false
                  };
                });
                setEditablePermissions(updatedPermissions);
                setHasChanges(true);
              }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-green-800 font-medium"
            >
              ✏️ Grant Create/Edit Access
            </button>
            <button
              onClick={() => {
                const updatedPermissions = { ...editablePermissions };
                systemPages.forEach(page => {
                  if (!updatedPermissions[page.id]) updatedPermissions[page.id] = {};
                  updatedPermissions[page.id][selectedRole] = {
                    create: true, view: true, edit: true, delete: true, approve: true
                  };
                });
                setEditablePermissions(updatedPermissions);
                setHasChanges(true);
              }}
              className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-purple-800 font-medium"
            >
              ✅ Grant Full Access
            </button>
            <button
              onClick={() => {
                const updatedPermissions = { ...editablePermissions };
                systemPages.forEach(page => {
                  if (!updatedPermissions[page.id]) updatedPermissions[page.id] = {};
                  updatedPermissions[page.id][selectedRole] = {
                    create: false, view: false, edit: false, delete: false, approve: false
                  };
                });
                setEditablePermissions(updatedPermissions);
                setHasChanges(true);
              }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-red-800 font-medium"
            >
              🚫 Remove All Access
            </button>
            <button
              onClick={resetToDefault}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-800 font-medium"
            >
              🔄 Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Permission Types Legend */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Permission Types Guide
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {permissionTypes.map(permission => (
              <div key={permission.id} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-center mb-2">
                  <span className={`text-3xl ${permission.color}`}>{permission.icon}</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">{permission.name}</h4>
                <p className="text-sm text-gray-600">
                  {permission.id === 'create' && 'Add new records and data'}
                  {permission.id === 'view' && 'Browse and see information'}
                  {permission.id === 'edit' && 'Modify existing records'}
                  {permission.id === 'delete' && 'Remove records permanently'}
                  {permission.id === 'approve' && 'Review and approve changes'}
                </p>
              </div>
            ))}
          </div>
          
          {/* Role Hierarchy Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Role Hierarchy & Responsibilities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
              {availableRoles.map(role => (
                <div key={role.id} className="bg-white p-3 rounded border-l-4 border-blue-400">
                  <div className="flex items-center mb-1">
                    <span className="mr-2">{role.icon}</span>
                    <span className="font-medium text-gray-800">{role.name}</span>
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {role.id === 'super_admin' && 'System owner, full control over everything'}
                    {role.id === 'admin' && 'Manages users, inventory, and business operations'}
                    {role.id === 'manager' && 'Handles day-to-day operations and inventory'}
                    {role.id === 'user' && 'Basic access to view reports and data'}
                    {role.id === 'guest' && 'Limited read-only access to public information'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
