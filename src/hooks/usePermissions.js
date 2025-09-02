import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, [user]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCustomPermissions();
      
      if (response.success) {
        setPermissions(response.data);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default permissions if no custom permissions are set
  const getDefaultPermissions = (pageId, role) => {
    const defaultPermissions = {
      dashboard: { access: true, level: 'view' },
      'user-management': role === 'super_admin' ? { access: true, level: 'full' } : { access: false, level: 'none' },
      'material-management': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'edit' },
        user: { access: true, level: 'view' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'vendor-management': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'edit' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'category-management': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'edit' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'add-inventory': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'edit' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'edit-inventory': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'edit' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'view-inventory': { access: true, level: 'view' },
      'indian-billing': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'edit' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'us-billing': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'edit' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'available-stock': { access: true, level: 'view' },
      'vendor-stock': { access: true, level: 'view' },
      'dollar-rate': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'view' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'gold-rate': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'view' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'manual-rate-entry': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: false, level: 'none' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' },
      'data-sync': {
        super_admin: { access: true, level: 'full' },
        admin: { access: true, level: 'full' },
        manager: { access: true, level: 'view' },
        user: { access: false, level: 'none' },
        guest: { access: false, level: 'none' }
      }[role] || { access: false, level: 'none' }
    };

    return defaultPermissions[pageId] || { access: false, level: 'none' };
  };

  // Check if user has permission for a specific page and action
  const hasPermission = (pageId, action = 'view') => {
    if (!user) return false;

    const userRole = user.role;
    
    // Super admin always has full access
    if (userRole === 'super_admin') return true;

    // Get permissions for this page and role
    const pagePermissions = permissions[pageId]?.[userRole] || getDefaultPermissions(pageId, userRole);

    if (!pagePermissions.access) return false;

    // Check specific actions based on permission level
    switch (action) {
      case 'view':
        return pagePermissions.access;
      case 'create':
        return pagePermissions.level === 'full'; // Only full access can create
      case 'edit':
        return ['full', 'edit'].includes(pagePermissions.level);
      case 'delete':
        return pagePermissions.level === 'full'; // Only full access can delete
      case 'approve':
        return pagePermissions.level === 'full';
      default:
        return pagePermissions.access;
    }
  };

  // Check if user can access a page at all
  const canAccessPage = (pageId) => {
    return hasPermission(pageId, 'view');
  };

  // Get user's permission level for a page
  const getPermissionLevel = (pageId) => {
    if (!user) return 'none';

    const userRole = user.role;
    
    if (userRole === 'super_admin') return 'full';

    const pagePermissions = permissions[pageId]?.[userRole] || getDefaultPermissions(pageId, userRole);
    return pagePermissions.access ? pagePermissions.level : 'none';
  };

  return {
    permissions,
    loading,
    hasPermission,
    canAccessPage,
    getPermissionLevel,
    loadPermissions
  };
};

export default usePermissions;
