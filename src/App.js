import React, { useState } from 'react';

// Auth Components
import Login from './components/auth/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Admin Components  
import MaterialManagement from './components/admin/MaterialManagement';
import CategoryManagement from './components/admin/CategoryManagement';
import VendorManagement from './components/admin/VendorManagement';
import UserManagement from './components/admin/UserManagement';
import PermissionsManagement from './components/admin/PermissionsManagement';

// Inventory Components
import ViewInventory from './components/inventory/ViewInventory';
import AddInventory from './components/inventory/AddInventory';
import EditInventory from './components/inventory/EditInventory';

// Billing Components
import IndianBilling from './components/billing/IndianBilling';
import USBilling from './components/billing/USBilling';

// Reports Components
import AvailableStock from './components/reports/AvailableStock';
import VendorStock from './components/reports/VendorStock';

// Utilities Components
import DataSync from './components/utilities/DataSync';
import DollarRate from './components/utilities/DollarRate';

// Shared Components
import Sidebar from './components/shared/Sidebar';
import { Dashboard } from './components/shared/Dashboard';

// Icons
import { Menu, LogOut, User } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleMenuClick = (moduleId) => {
    setCurrentModule(moduleId);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Role-based access control
  const hasAccess = (feature) => {
    if (!user) return false;
    
    const { role } = user;
    
    switch (feature) {
      case 'user-management':
      case 'permissions-management':
        return role === 'super_admin';
      case 'material-management':
      case 'category-management':
      case 'vendor-management':
        return ['super_admin', 'admin', 'manager'].includes(role);
      case 'add-inventory':
      case 'edit-inventory':
        return ['super_admin', 'admin', 'manager'].includes(role);
      case 'view-inventory':
      case 'available-stock':
      case 'vendor-stock':
        return true; // All roles can view
      case 'indian-billing':
      case 'us-billing':
        return ['super_admin', 'admin', 'manager'].includes(role);
      case 'dollar-rate':
      case 'data-sync':
        return ['super_admin', 'admin', 'manager'].includes(role);
      default:
        return true;
    }
  };

  const renderContent = () => {
    // Check if user has access to the current module
    if (!hasAccess(currentModule)) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Access Denied</h3>
            <p className="text-red-600">You don't have permission to access this feature.</p>
            <p className="text-sm text-red-500 mt-2">Current role: <span className="font-semibold">{user?.role?.replace('_', ' ').toUpperCase()}</span></p>
          </div>
        </div>
      );
    }

    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'material-management':
        return <MaterialManagement />;
      case 'category-management':
        return <CategoryManagement />;
      case 'vendor-management':
        return <VendorManagement />;
      case 'user-management':
        return <UserManagement />;
      case 'permissions-management':
        return <PermissionsManagement />;
      case 'view-inventory':
        return <ViewInventory />;
      case 'add-inventory':
        return <AddInventory />;
      case 'edit-inventory':
        return <EditInventory />;
      case 'indian-billing':
        return <IndianBilling />;
      case 'us-billing':
        return <USBilling />;
      case 'available-stock':
        return <AvailableStock />;
      case 'vendor-stock':
        return <VendorStock />;
      case 'dollar-rate':
        return <DollarRate />;
      case 'data-sync':
        return <DataSync />;
      // case 'upload-jewelry':
      //   return <UploadJewelry />; // Future Enhancement
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        currentModule={currentModule}
        handleMenuClick={handleMenuClick}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 mr-4"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Jewelry Inventory Manager</h1>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.fullName || user?.username || 'User'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.role || 'user'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Main App with Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
