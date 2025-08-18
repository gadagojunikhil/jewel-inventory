import React, { useState, useEffect } from 'react';

// Admin Components  
import MaterialManagement from './components/admin/MaterialManagement';
import CategoryManagement from './components/admin/CategoryManagement';

// Inventory Components
import ViewInventory from './components/inventory/ViewInventory';
// import UploadJewelry from './components/inventory/UploadJewelry'; // Future Enhancement

// Shared Components
import Sidebar from './components/shared/Sidebar';

// Icons
import { Menu } from 'lucide-react';

function App() {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [jewelryPieces, setJewelryPieces] = useState([]);
  const [jewelryCategories, setJewelryCategories] = useState([]);

  // Data initialization
  useEffect(() => {
    const savedMaterials = localStorage.getItem('jewelryMaterials');
    const savedJewelry = localStorage.getItem('jewelryPieces');
    const savedCategories = localStorage.getItem('jewelryCategories');
    
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    } else {
      const defaultMaterials = [
        { id: 1, category: 'Diamond', name: 'Flat Diamonds', code: 'FD', costPrice: 150, salePrice: 400, unit: 'each' },
        { id: 2, category: 'Diamond', name: 'Round Diamonds', code: 'RD', costPrice: 200, salePrice: 500, unit: 'each' }
      ];
      setMaterials(defaultMaterials);
      localStorage.setItem('jewelryMaterials', JSON.stringify(defaultMaterials));
    }

    if (savedCategories) {
      setJewelryCategories(JSON.parse(savedCategories));
    } else {
      const defaultCategories = [
        { id: 1, name: 'Necklace', code: 'N', description: 'All types of necklaces' },
        { id: 2, name: 'Ring', code: 'R', description: 'All types of rings' }
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
          name: 'Test Necklace',
          code: 'N-001',
          category: 'Necklace',
          salePrice: 1000,
          status: 'In Stock',
          createdDate: new Date().toISOString()
        }
      ];
      setJewelryPieces(sampleJewelry);
      localStorage.setItem('jewelryPieces', JSON.stringify(sampleJewelry));
    }
  }, []);

  const handleMenuClick = (moduleId) => {
    setCurrentModule(moduleId);
  };

  // Simple test component
  const TestDashboard = () => (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Dashboard</h1>
      <div className="bg-blue-100 p-4 rounded-lg shadow">
        <p className="text-lg">Materials: {materials.length}</p>
        <p className="text-lg">Categories: {jewelryCategories.length}</p>
        <p className="text-lg">Jewelry: {jewelryPieces.length}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return <TestDashboard />;
      case 'material-management':
        return <MaterialManagement materials={materials} setMaterials={setMaterials} />;
      case 'category-management':
        return <CategoryManagement jewelryCategories={jewelryCategories} setJewelryCategories={setJewelryCategories} />;
      case 'view-inventory':
        return <ViewInventory />;
      // case 'upload-jewelry':
      //   return <UploadJewelry />; // Future Enhancement
      default:
        return <TestDashboard />;
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
        <div className="bg-white shadow-sm p-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 mr-4"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Jewelry Inventory Manager</h1>
        </div>
        
        {/* Main Content Area */}
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
