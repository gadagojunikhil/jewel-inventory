import React, { useState, useEffect } from 'react';

// Only import components that exist - we'll add others gradually
 //Admin Components (These exist if you've created them)
// import UserManagement from './components/admin/UserManagement';
 import MaterialManagement from './components/admin/MaterialManagement';
 import CategoryManagement from './components/admin/CategoryManagement';

// Inventory Components (Create these step by step)
// import ViewInventory from './components/inventory/ViewInventory';
// import AddInventory from './components/inventory/AddInventory';
// import EditInventory from './components/inventory/EditInventory';
 import UploadJewelry from './components/inventory/UploadJewelry';

// Billing Components (Not created yet)
// import IndianBilling from './components/billing/IndianBilling';
// import USBilling from './components/billing/USBilling';

// Reports Components (Not created yet)
// import AvailableStock from './components/reports/AvailableStock';
// import VendorStock from './components/reports/VendorStock';

// Utilities Components (Not created yet)
// import DollarRate from './components/utilities/DollarRate';

// Shared Components (Create these first)
// import Sidebar from './components/shared/Sidebar';
// import Header from './components/shared/Header';
// import Dashboard from './components/shared/Dashboard';

// Hooks (Create this first)
// import useLocalStorage from './hooks/useLocalStorage';

// Icons (these should work from your existing setup)
import { 
  Plus, Edit2, Trash2, Save, X, Package, Gem, Eye, 
  Users, Settings, FileText, DollarSign, Upload, 
  BarChart3, ChevronDown, Menu, Home, Calculator,
  Search, Filter
} from 'lucide-react';

const App = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Keep your existing state management for now
  const [materials, setMaterials] = useState([]);
  const [jewelryPieces, setJewelryPieces] = useState([]);
  const [users, setUsers] = useState([]);
  const [jewelryCategories, setJewelryCategories] = useState([]);

  // Keep your existing useEffect for data initialization
  useEffect(() => {
    const savedMaterials = localStorage.getItem('jewelryMaterials');
    const savedJewelry = localStorage.getItem('jewelryPieces');
    const savedUsers = localStorage.getItem('jewelryUsers');
    const savedCategories = localStorage.getItem('jewelryCategories');
    
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    } else {
      const defaultMaterials = [
        { id: 1, category: 'Diamond', name: 'Flat Diamonds', code: 'FD', costPrice: 150, salePrice: 400, unit: 'each' },
        { id: 2, category: 'Diamond', name: 'Round Diamonds', code: 'RD', costPrice: 200, salePrice: 500, unit: 'each' },
        { id: 3, category: 'Diamond', name: 'Princess Cut Diamonds', code: 'PD', costPrice: 180, salePrice: 450, unit: 'each' },
        { id: 4, category: 'Stone', name: 'Ruby', code: 'RU', costPrice: 100, salePrice: 300, unit: 'each' },
        { id: 5, category: 'Stone', name: 'Sapphire', code: 'SA', costPrice: 80, salePrice: 250, unit: 'each' },
        { id: 6, category: 'Stone', name: 'Emerald', code: 'EM', costPrice: 120, salePrice: 350, unit: 'each' },
        { id: 11, category: 'Gold', name: '14K Yellow Gold', code: 'G14-Y', costPrice: 30, salePrice: 45, unit: 'gram' },
        { id: 14, category: 'Gold', name: '18K Yellow Gold', code: 'G18-Y', costPrice: 40, salePrice: 60, unit: 'gram' },
        { id: 17, category: 'Gold', name: '22K Yellow Gold', code: 'G22-Y', costPrice: 50, salePrice: 75, unit: 'gram' },
        { id: 18, category: 'Silver', name: 'Sterling Silver 925', code: 'SS-925', costPrice: 2, salePrice: 3, unit: 'gram' }
      ];
      setMaterials(defaultMaterials);
      localStorage.setItem('jewelryMaterials', JSON.stringify(defaultMaterials));
    }

    if (savedCategories) {
      setJewelryCategories(JSON.parse(savedCategories));
    } else {
      const defaultCategories = [
        { id: 1, name: 'Necklace', code: 'N', description: 'All types of necklaces' },
        { id: 2, name: 'Ring', code: 'R', description: 'All types of rings' },
        { id: 3, name: 'Earrings', code: 'E', description: 'All types of earrings' },
        { id: 4, name: 'Bracelet', code: 'B', description: 'All types of bracelets' },
        { id: 5, name: 'Pendant', code: 'P', description: 'All types of pendants' },
        { id: 6, name: 'Brooch', code: 'BR', description: 'All types of brooches' }
      ];
      setJewelryCategories(defaultCategories);
      localStorage.setItem('jewelryCategories', JSON.stringify(defaultCategories));
    }

    if (savedJewelry) {
      setJewelryPieces(JSON.parse(savedJewelry));
    } else {
      const sampleJewelry = [
        {
          id: 1,
          name: 'Diamond Ruby Necklace',
          code: 'N-001',
          category: 'Necklace',
          materials: [
            { materialId: 14, materialCode: 'G18-Y', materialName: '18K Yellow Gold', quantity: 10, unit: 'gram', costPerUnit: 40, totalCost: 400 },
            { materialId: 2, materialCode: 'RD', materialName: 'Round Diamonds', quantity: 2.32, unit: 'each', costPerUnit: 200, totalCost: 464 },
            { materialId: 4, materialCode: 'RU', materialName: 'Ruby', quantity: 1.25, unit: 'each', costPerUnit: 100, totalCost: 125 }
          ],
          laborCost: 400,
          otherCosts: 50,
          salePrice: 3500,
          status: 'In Stock',
          createdDate: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Diamond Earrings',
          code: 'E-001',
          category: 'Earrings',
          materials: [
            { materialId: 14, materialCode: 'G18-Y', materialName: '18K Yellow Gold', quantity: 5, unit: 'gram', costPerUnit: 40, totalCost: 200 },
            { materialId: 2, materialCode: 'RD', materialName: 'Round Diamonds', quantity: 1.5, unit: 'each', costPerUnit: 200, totalCost: 300 }
          ],
          laborCost: 250,
          otherCosts: 25,
          salePrice: 1800,
          status: 'In Stock',
          createdDate: new Date().toISOString()
        }
      ];
      setJewelryPieces(sampleJewelry);
      localStorage.setItem('jewelryPieces', JSON.stringify(sampleJewelry));
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const defaultUsers = [
        { id: 1, name: 'Admin User', email: 'admin@jewelry.com', role: 'Admin', status: 'Active', createdDate: new Date().toISOString() },
        { id: 2, name: 'Manager User', email: 'manager@jewelry.com', role: 'Manager', status: 'Active', createdDate: new Date().toISOString() }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('jewelryUsers', JSON.stringify(defaultUsers));
    }
  }, []);

  // Keep your existing menu items
  const menuItems = [
    {
      id: 'admin',
      title: 'Admin',
      submenu: [
        { id: 'user-management', title: 'User Management' },
        { id: 'material-management', title: 'Material Management' },
        { id: 'category-management', title: 'Category Management' }
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      submenu: [
        { id: 'view-inventory', title: 'View Inventory' },
        { id: 'add-inventory', title: 'Add Inventory' },
        { id: 'edit-inventory', title: 'Edit Inventory' },
        { id: 'upload-jewelry', title: 'Upload Jewelry' }
      ]
    },
    {
      id: 'billing',
      title: 'Billing',
      submenu: [
        { id: 'indian-billing', title: 'Indian Billing' },
        { id: 'us-billing', title: 'US Billing' }
      ]
    },
    {
      id: 'report',
      title: 'Report',
      submenu: [
        { id: 'available-stock', title: 'Available Stock' },
        { id: 'vendor-stock', title: 'Vendor Stock' }
      ]
    },
    {
      id: 'utilities',
      title: 'Utilities',
      submenu: [
        { id: 'dollar-rate', title: 'Get Dollar Rate' }
      ]
    }
  ];

  const handleMenuClick = (moduleId) => {
    setCurrentModule(moduleId);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdownId) => {
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  // Temporary placeholder component for missing modules
  const PlaceholderComponent = ({ title }) => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Settings className="text-yellow-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800">Component Under Development</h3>
            <p className="text-yellow-700">This module will be implemented in the next phase.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Simple Dashboard component (will be replaced with separate component later)
  const SimpleDashboard = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Materials</p>
              <p className="text-3xl font-bold text-blue-700">{materials.length}</p>
            </div>
            <Gem className="text-blue-500" size={40} />
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Jewelry Pieces</p>
              <p className="text-3xl font-bold text-green-700">{jewelryPieces.length}</p>
            </div>
            <Package className="text-green-500" size={40} />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold text-yellow-700">
                ${jewelryPieces.reduce((sum, j) => sum + j.salePrice, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-yellow-500" size={40} />
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Categories</p>
              <p className="text-3xl font-bold text-purple-700">{jewelryCategories.length}</p>
            </div>
            <Users className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Jewelry</h3>
          <div className="space-y-3">
            {jewelryPieces.slice(0, 5).map(jewelry => (
              <div key={jewelry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{jewelry.name}</p>
                  <p className="text-sm text-gray-600">{jewelry.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${jewelry.salePrice}</p>
                  <p className="text-xs text-gray-500">{jewelry.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Jewelry Categories</h3>
          <div className="space-y-3">
            {jewelryCategories.map(category => {
              const count = jewelryPieces.filter(j => j.category === category.name && j.status !== 'Archived').length;
              return (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Keep your existing renderContent but use placeholders for missing components
  const renderContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return <SimpleDashboard />;
      
      // For now, use placeholders - you'll replace these as you create components
      case 'user-management':
        return <PlaceholderComponent title="User Management" />;
      
      case 'material-management':
        return (
    <MaterialManagement 
      materials={materials}
      setMaterials={setMaterials}
    />
  );
      
      case 'category-management':
        return (
    <CategoryManagement 
      jewelryCategories={jewelryCategories}
      setJewelryCategories={setJewelryCategories}
      jewelryPieces={jewelryPieces}
    />
  );

      case 'view-inventory':
        return <PlaceholderComponent title="View Inventory" />;
      
      case 'add-inventory':
        return <PlaceholderComponent title="Add Inventory" />;
      
      case 'edit-inventory':
        return <PlaceholderComponent title="Edit Inventory" />;
      
      case 'upload-jewelry':
        return <UploadJewelry />;

      case 'indian-billing':
        return <PlaceholderComponent title="Indian Billing" />;
      
      case 'us-billing':
        return <PlaceholderComponent title="US Billing" />;

      case 'available-stock':
        return <PlaceholderComponent title="Available Stock Report" />;
      
      case 'vendor-stock':
        return <PlaceholderComponent title="Vendor Stock Report" />;

      case 'dollar-rate':
        return <PlaceholderComponent title="Dollar Rate Utility" />;

      default:
        return <SimpleDashboard />;
    }
  };

  // Keep your existing Sidebar component inline for now
  const Sidebar = () => (
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
                      {subItem.id === 'user-management' && <Users size={16} />}
                      {subItem.id === 'material-management' && <Gem size={16} />}
                      {subItem.id === 'category-management' && <Package size={16} />}
                      {subItem.id === 'view-inventory' && <Eye size={16} />}
                      {subItem.id === 'add-inventory' && <Plus size={16} />}
                      {subItem.id === 'edit-inventory' && <Edit2 size={16} />}
                      {subItem.id === 'upload-jewelry' && <Upload size={16} />}
                      {subItem.id === 'indian-billing' && <DollarSign size={16} />}
                      {subItem.id === 'us-billing' && <DollarSign size={16} />}
                      {subItem.id === 'available-stock' && <Package size={16} />}
                      {subItem.id === 'vendor-stock' && <Users size={16} />}
                      {subItem.id === 'dollar-rate' && <DollarSign size={16} />}
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

  // Keep your existing Header component inline for now
  const Header = () => (
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header />
        
        <main className="min-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;