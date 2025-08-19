import React, { useState } from 'react';
import { 
  Home, Settings, Package, FileText, BarChart3, Calculator,
  Users, Gem, Plus, Edit2, DollarSign, Eye, ChevronDown, Building2, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import usePermissions from '../../hooks/usePermissions';

const Sidebar = ({ currentModule, handleMenuClick, sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const { canAccessPage } = usePermissions();
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Permission-based access control
  const hasAccess = (pageId) => {
    if (!user) return false;
    return canAccessPage(pageId);
  };

  const menuItems = [
    {
      id: 'admin',
      title: 'Admin',
      submenu: [
        { id: 'user-management', title: 'User Management', icon: Users },
        { id: 'permissions-management', title: 'User Permissions', icon: Shield },
        { id: 'material-management', title: 'Gemstone & Materials', icon: Gem },
        { id: 'category-management', title: 'Product Categories', icon: Package },
        { id: 'vendor-management', title: 'Vendor Details', icon: Building2 }
      ].filter(item => hasAccess(item.id))
    },
    {
      id: 'inventory',
      title: 'Inventory',
      submenu: [
        { id: 'view-inventory', title: 'View Inventory', icon: Eye },
        { id: 'add-inventory', title: 'Add Inventory', icon: Plus },
        { id: 'edit-inventory', title: 'Edit Inventory', icon: Edit2 }
        // { id: 'upload-jewelry', title: 'Upload Jewelry', icon: Upload } // Future Enhancement
      ].filter(item => hasAccess(item.id))
    },
    {
      id: 'billing',
      title: 'Billing',
      submenu: [
        { id: 'indian-billing', title: 'Indian Billing', icon: DollarSign },
        { id: 'us-billing', title: 'US Billing', icon: DollarSign }
      ].filter(item => hasAccess(item.id))
    },
    {
      id: 'report',
      title: 'Report',
      submenu: [
        { id: 'available-stock', title: 'Available Stock', icon: Package },
        { id: 'vendor-stock', title: 'Vendor Stock', icon: Users }
      ].filter(item => hasAccess(item.id))
    },
    {
      id: 'utilities',
      title: 'Utilities',
      submenu: [
        { id: 'gold-rate', title: 'Gold Rate', icon: Gem },
        { id: 'dollar-rate', title: 'Dollar Rate', icon: DollarSign },
        { id: 'data-sync', title: 'Data Sync', icon: Settings }
      ].filter(item => hasAccess(item.id))
    }
  ].filter(section => section.submenu.length > 0); // Remove empty sections

  const toggleDropdown = (dropdownId) => {
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  return (
    <div className={`bg-gray-800 text-white h-screen fixed left-0 top-0 z-40 transition-transform duration-300 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } w-64`}>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <Gem className="text-blue-400" size={32} />
          <h1 className="text-xl font-bold">Jewelry System</h1>
        </div>
        
        <nav>
          <div className="mb-4">
            <button
              onClick={() => handleMenuClick('dashboard')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                currentModule === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </button>
          </div>

          {menuItems.map((item) => (
            <div key={item.id} className="mb-2">
              <button
                onClick={() => toggleDropdown(item.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {item.id === 'admin' && <Settings size={20} />}
                  {item.id === 'inventory' && <Package size={20} />}
                  {item.id === 'billing' && <FileText size={20} />}
                  {item.id === 'report' && <BarChart3 size={20} />}
                  {item.id === 'utilities' && <Calculator size={20} />}
                  <span>{item.title}</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform ${
                    activeDropdown === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {activeDropdown === item.id && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleMenuClick(subItem.id)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${
                        currentModule === subItem.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                      }`}
                    >
                      <subItem.icon size={16} />
                      <span>{subItem.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;