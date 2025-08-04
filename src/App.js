import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Package, Gem, Eye, 
  Users, Settings, FileText, DollarSign, Upload, 
  BarChart3, ChevronDown, Menu, Home, Calculator
} from 'lucide-react';

const JewelryManagementSystem = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [jewelryPieces, setJewelryPieces] = useState([]);
  const [users, setUsers] = useState([]);
  const [jewelryCategories, setJewelryCategories] = useState([]);

  // Materials states
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
  
  // Category states
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', code: '', description: '' });

  // Jewelry states
  const [showAddJewelryForm, setShowAddJewelryForm] = useState(false);
  const [showJewelryDetails, setShowJewelryDetails] = useState(null);
  const [editingJewelry, setEditingJewelry] = useState(null);
  const [showEditJewelryForm, setShowEditJewelryForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [inventoryFilter, setInventoryFilter] = useState('all');

  const [newJewelry, setNewJewelry] = useState({
    name: '',
    code: '',
    category: 'Necklace',
    materials: [],
    laborCost: 0,
    otherCosts: 0,
    salePrice: 0,
    status: 'In Stock'
  });

  const categories = ['Diamond', 'Stone', 'Gold', 'Silver', 'Platinum', 'Other'];
  const units = ['each', 'gram', 'carat', 'piece'];
  const statusOptions = ['In Stock', 'Sold', 'On Hold', 'Custom Order'];

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
        },
        {
          id: 3,
          name: 'Gold Ring',
          code: 'R-001',
          category: 'Ring',
          materials: [
            { materialId: 17, materialCode: 'G22-Y', materialName: '22K Yellow Gold', quantity: 8, unit: 'gram', costPerUnit: 50, totalCost: 400 }
          ],
          laborCost: 150,
          otherCosts: 20,
          salePrice: 1200,
          status: 'Sold',
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

  useEffect(() => {
    if (materials.length > 0) {
      localStorage.setItem('jewelryMaterials', JSON.stringify(materials));
    }
  }, [materials]);

  useEffect(() => {
    if (jewelryPieces.length > 0) {
      localStorage.setItem('jewelryPieces', JSON.stringify(jewelryPieces));
    }
  }, [jewelryPieces]);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('jewelryUsers', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (jewelryCategories.length > 0) {
      localStorage.setItem('jewelryCategories', JSON.stringify(jewelryCategories));
    }
  }, [jewelryCategories]);

  const handleMenuClick = (moduleId) => {
    setCurrentModule(moduleId);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdownId) => {
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };

  // Category management functions
  const handleAddCategory = () => {
    if (newCategory.name && newCategory.code) {
      const newId = Math.max(...jewelryCategories.map(c => c.id), 0) + 1;
      const categoryToAdd = { ...newCategory, id: newId };
      setJewelryCategories(prev => [...prev, categoryToAdd]);
      setNewCategory({ name: '', code: '', description: '' });
      setShowAddCategoryForm(false);
    }
  };

  const handleDeleteCategory = (id) => {
    setJewelryCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Material search function for autocomplete
  const searchMaterials = (query) => {
    if (!query || query.length < 1) return [];
    return materials.filter(material => 
      material.name.toLowerCase().includes(query.toLowerCase()) ||
      material.code.toLowerCase().includes(query.toLowerCase()) ||
      material.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  };

  const calculateJewelryTotalCost = (jewelry) => {
    const materialsCost = jewelry.materials.reduce((sum, material) => sum + material.totalCost, 0);
    return materialsCost + jewelry.laborCost + jewelry.otherCosts;
  };

  const calculateJewelryProfit = (jewelry) => {
    const totalCost = calculateJewelryTotalCost(jewelry);
    return jewelry.salePrice - totalCost;
  };

  const calculateJewelryMarkup = (jewelry) => {
    const totalCost = calculateJewelryTotalCost(jewelry);
    return totalCost > 0 ? ((jewelry.salePrice - totalCost) / totalCost * 100) : 0;
  };

  const addMaterialToJewelry = () => {
    const newMaterialEntry = {
      materialId: 0,
      materialCode: '',
      materialName: '',
      quantity: 0,
      unit: 'each',
      costPerUnit: 0,
      totalCost: 0
    };
    setNewJewelry(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterialEntry]
    }));
  };

  const updateJewelryMaterial = (index, field, value) => {
    const updatedMaterials = [...newJewelry.materials];
    updatedMaterials[index][field] = value;
    
    if (field === 'quantity' || field === 'costPerUnit') {
      updatedMaterials[index].totalCost = updatedMaterials[index].quantity * updatedMaterials[index].costPerUnit;
    }
    
    if (field === 'materialId') {
      const selectedMaterial = materials.find(m => m.id === parseInt(value));
      if (selectedMaterial) {
        updatedMaterials[index].materialCode = selectedMaterial.code;
        updatedMaterials[index].materialName = selectedMaterial.name;
        updatedMaterials[index].unit = selectedMaterial.unit;
        updatedMaterials[index].costPerUnit = selectedMaterial.costPrice;
        updatedMaterials[index].totalCost = updatedMaterials[index].quantity * selectedMaterial.costPrice;
      }
    }
    
    setNewJewelry(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const removeMaterialFromJewelry = (index) => {
    const updatedMaterials = newJewelry.materials.filter((_, i) => i !== index);
    setNewJewelry(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const handleAddJewelry = () => {
    if (newJewelry.name && newJewelry.code) {
      const newId = Math.max(...jewelryPieces.map(j => j.id), 0) + 1;
      const jewelryToAdd = {
        ...newJewelry,
        id: newId,
        createdDate: new Date().toISOString()
      };
      setJewelryPieces(prev => [...prev, jewelryToAdd]);
      setNewJewelry({
        name: '',
        code: '',
        category: 'Necklace',
        materials: [],
        laborCost: 0,
        otherCosts: 0,
        salePrice: 0,
        status: 'In Stock'
      });
      setShowAddJewelryForm(false);
    }
  };

  // Search functionality for edit inventory
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = jewelryPieces.filter(jewelry => 
      jewelry.status !== 'Archived' && (
        jewelry.name.toLowerCase().includes(query.toLowerCase()) ||
        jewelry.code.toLowerCase().includes(query.toLowerCase()) ||
        jewelry.category.toLowerCase().includes(query.toLowerCase())
      )
    );
    setSearchResults(results);
  };

  // Confirmation dialog functions
  const showEditConfirmation = (jewelry) => {
    setConfirmAction({
      type: 'edit',
      data: jewelry,
      message: `Are you sure you want to edit "${jewelry.name}" (${jewelry.code})?`,
      onConfirm: () => {
        setEditingJewelry({...jewelry});
        setShowEditJewelryForm(true);
        setShowConfirmDialog(false);
      }
    });
    setShowConfirmDialog(true);
  };

  const showArchiveConfirmation = (jewelry) => {
    setConfirmAction({
      type: 'archive',
      data: jewelry,
      message: `Are you sure you want to archive "${jewelry.name}" (${jewelry.code})? This item will be moved to archived inventory but can be restored later.`,
      onConfirm: () => {
        setJewelryPieces(prev => 
          prev.map(j => 
            j.id === jewelry.id 
              ? { ...j, status: 'Archived', archivedDate: new Date().toISOString() }
              : j
          )
        );
        setShowConfirmDialog(false);
      }
    });
    setShowConfirmDialog(true);
  };

  const handleEditJewelry = () => {
    if (editingJewelry.name && editingJewelry.code) {
      setJewelryPieces(prev => 
        prev.map(j => 
          j.id === editingJewelry.id 
            ? { ...editingJewelry, updatedDate: new Date().toISOString() }
            : j
        )
      );
      setShowEditJewelryForm(false);
      setEditingJewelry(null);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Filter jewelry pieces based on status
  const getFilteredJewelry = () => {
    switch (inventoryFilter) {
      case 'in-stock':
        return jewelryPieces.filter(j => j.status === 'In Stock');
      case 'sold':
        return jewelryPieces.filter(j => j.status === 'Sold');
      case 'on-hold':
        return jewelryPieces.filter(j => j.status === 'On Hold');
      case 'archived':
        return jewelryPieces.filter(j => j.status === 'Archived');
      default:
        return jewelryPieces.filter(j => j.status !== 'Archived');
    }
  };

  const AddMaterialForm = React.memo(() => {
    const [localMaterial, setLocalMaterial] = useState({
      category: 'Diamond',
      name: '',
      code: '',
      costPrice: 0,
      salePrice: 0,
      unit: 'each'
    });

    const handleSubmit = () => {
      if (localMaterial.name && localMaterial.code) {
        const newId = Math.max(...materials.map(m => m.id), 0) + 1;
        const materialToAdd = { ...localMaterial, id: newId };
        setMaterials(prevMaterials => [...prevMaterials, materialToAdd]);
        setLocalMaterial({
          category: 'Diamond',
          name: '',
          code: '',
          costPrice: 0,
          salePrice: 0,
          unit: 'each'
        });
        setShowAddMaterialForm(false);
      }
    };

    return (
      <div className="mb-6 bg-blue-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Add New Material</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={localMaterial.category}
              onChange={(e) => setLocalMaterial(prev => ({...prev, category: e.target.value}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={localMaterial.name}
              onChange={(e) => setLocalMaterial(prev => ({...prev, name: e.target.value}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Material name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              type="text"
              value={localMaterial.code}
              onChange={(e) => setLocalMaterial(prev => ({...prev, code: e.target.value}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="CODE"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost Price</label>
            <input
              type="number"
              value={localMaterial.costPrice}
              onChange={(e) => setLocalMaterial(prev => ({...prev, costPrice: parseFloat(e.target.value) || 0}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sale Price</label>
            <input
              type="number"
              value={localMaterial.salePrice}
              onChange={(e) => setLocalMaterial(prev => ({...prev, salePrice: parseFloat(e.target.value) || 0}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              value={localMaterial.unit}
              onChange={(e) => setLocalMaterial(prev => ({...prev, unit: e.target.value}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Material
          </button>
          <button
            onClick={() => setShowAddMaterialForm(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  });

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

  const Dashboard = () => (
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

  const renderContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'user-management':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                <Plus size={20} />
                <span>Add User</span>
              </button>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 font-medium">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                            <Edit2 size={16} />
                          </button>
                          <button className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'material-management':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Material Management</h2>
              <button
                onClick={() => setShowAddMaterialForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Material</span>
              </button>
            </div>

            {showAddMaterialForm && <AddMaterialForm />}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {materials.map(material => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          material.category === 'Diamond' ? 'bg-blue-100 text-blue-800' :
                          material.category === 'Stone' ? 'bg-green-100 text-green-800' :
                          material.category === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                          material.category === 'Silver' ? 'bg-gray-100 text-gray-800' :
                          material.category === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {material.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{material.name}</td>
                      <td className="px-6 py-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {material.code}
                        </code>
                      </td>
                      <td className="px-6 py-4">${material.costPrice}</td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-semibold">${material.salePrice}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({material.costPrice > 0 ? ((material.salePrice - material.costPrice) / material.costPrice * 100).toFixed(0) : 0}% markup)
                        </span>
                      </td>
                      <td className="px-6 py-4">{material.unit}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setMaterials(prev => prev.filter(m => m.id !== material.id))}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'category-management':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Category Management</h2>
              <button
                onClick={() => setShowAddCategoryForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Category</span>
              </button>
            </div>

            {showAddCategoryForm && (
              <div className="mb-6 bg-blue-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({...prev, name: e.target.value}))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Necklace"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category Code</label>
                    <input
                      type="text"
                      value={newCategory.code}
                      onChange={(e) => setNewCategory(prev => ({...prev, code: e.target.value.toUpperCase()}))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., N"
                      maxLength="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({...prev, description: e.target.value}))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., All types of necklaces"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleAddCategory}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Add Category
                  </button>
                  <button
                    onClick={() => setShowAddCategoryForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jewelry Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jewelryCategories.map(category => {
                    const jewelryCount = jewelryPieces.filter(j => j.category === category.name && j.status !== 'Archived').length;
                    return (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{category.name}</td>
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {category.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{category.description}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {jewelryCount} items
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                              disabled={jewelryCount > 0}
                              title={jewelryCount > 0 ? "Cannot delete category with existing jewelry" : "Delete category"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Category Usage Guide:</h4>
              <div className="text-sm text-yellow-700">
                <p>• Category codes will be used for jewelry item codes (e.g., N-001, R-002)</p>
                <p>• Keep codes short (1-3 characters) and unique</p>
                <p>• Categories with existing jewelry cannot be deleted</p>
                <p>• Use clear, descriptive names for better organization</p>
              </div>
            </div>
          </div>
        );

      case 'view-inventory':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">View Inventory</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={inventoryFilter}
                  onChange={(e) => setInventoryFilter(e.target.value)}
                  className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Active Items</option>
                  <option value="in-stock">In Stock Only</option>
                  <option value="sold">Sold Items</option>
                  <option value="on-hold">On Hold</option>
                  <option value="archived">Archived Items</option>
                </select>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2">
                  <FileText size={20} />
                  <span>Export</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Total Active</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {jewelryPieces.filter(j => j.status !== 'Archived').length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">In Stock</h3>
                <p className="text-2xl font-bold text-green-600">
                  {jewelryPieces.filter(j => j.status === 'In Stock').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Total Value</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  ${getFilteredJewelry().reduce((sum, j) => sum + j.salePrice, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Archived</h3>
                <p className="text-2xl font-bold text-red-600">
                  {jewelryPieces.filter(j => j.status === 'Archived').length}
                </p>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredJewelry().map(jewelry => {
                    const totalCost = calculateJewelryTotalCost(jewelry);
                    const profit = calculateJewelryProfit(jewelry);
                    const markup = calculateJewelryMarkup(jewelry);
                    
                    return (
                      <tr key={jewelry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {jewelry.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 font-medium">{jewelry.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {jewelry.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">${totalCost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-green-600 font-semibold">${jewelry.salePrice}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${profit.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({markup.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            jewelry.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                            jewelry.status === 'Sold' ? 'bg-red-100 text-red-800' :
                            jewelry.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                            jewelry.status === 'Archived' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {jewelry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setShowJewelryDetails(jewelry)}
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'add-inventory':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Add New Jewelry</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <button
                onClick={() => setShowAddJewelryForm(true)}
                className="w-full bg-blue-500 text-white p-8 rounded-lg hover:bg-blue-600 flex flex-col items-center space-y-3"
              >
                <Plus size={48} />
                <span className="text-xl font-semibold">Add New Jewelry Piece</span>
                <span className="text-sm opacity-90">Click to open the jewelry creation form</span>
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Recently Added</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {jewelryPieces
                  .filter(j => j.status !== 'Archived')
                  .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
                  .slice(0, 6)
                  .map(jewelry => (
                    <div key={jewelry.id} className="bg-white p-4 rounded-lg shadow border">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {jewelry.code}
                        </code>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          jewelry.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                          jewelry.status === 'Sold' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {jewelry.status}
                        </span>
                      </div>
                      <h4 className="font-semibold">{jewelry.name}</h4>
                      <p className="text-sm text-gray-600">{jewelry.category}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">${jewelry.salePrice}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'edit-inventory':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Edit Inventory</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4">Search Jewelry to Edit</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by jewelry name, code, or category..."
                  />
                </div>
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h3 className="font-semibold">Search Results ({searchResults.length} found)</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map(jewelry => (
                      <tr key={jewelry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {jewelry.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 font-medium">{jewelry.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {jewelry.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-green-600 font-semibold">${jewelry.salePrice}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            jewelry.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                            jewelry.status === 'Sold' ? 'bg-red-100 text-red-800' :
                            jewelry.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {jewelry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => showEditConfirmation(jewelry)}
                              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => showArchiveConfirmation(jewelry)}
                              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-gray-400 mb-4">
                  <Package size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Results Found</h3>
                <p className="text-gray-500">No jewelry found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        );

      case 'upload-jewelry':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Upload Jewelry</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Bulk Upload Jewelry</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                  <h4 className="text-lg font-medium mb-2">Drop files here or click to upload</h4>
                  <p className="text-gray-600 mb-4">Support for CSV, Excel files</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    id="jewelry-upload"
                  />
                  <label
                    htmlFor="jewelry-upload"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Download Template</h3>
                <p className="text-gray-600 mb-4">
                  Download our template to ensure your data is formatted correctly.
                </p>
                
                <div className="space-y-3">
                  <button className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2">
                    <FileText size={20} />
                    <span>Download CSV Template</span>
                  </button>
                  
                  <button className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2">
                    <FileText size={20} />
                    <span>Download Excel Template</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header />
        
        <main className="min-h-screen">
          {renderContent()}
        </main>
      </div>

      {showAddJewelryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-6xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Jewelry Piece</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={newJewelry.name}
                  onChange={(e) => setNewJewelry(prev => ({...prev, name: e.target.value}))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Diamond Necklace"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  type="text"
                  value={newJewelry.code}
                  onChange={(e) => setNewJewelry(prev => ({...prev, code: e.target.value}))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., N-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newJewelry.category}
                  onChange={(e) => setNewJewelry(prev => ({...prev, category: e.target.value}))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  {jewelryCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newJewelry.status}
                  onChange={(e) => setNewJewelry(prev => ({...prev, status: e.target.value}))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">Materials Used</h4>
                <button
                  onClick={addMaterialToJewelry}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Material</span>
                </button>
              </div>
              
              {newJewelry.materials.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Gem className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-600">No materials added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newJewelry.materials.map((material, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
                          <select
                            value={material.materialId}
                            onChange={(e) => updateJewelryMaterial(index, 'materialId', e.target.value)}
                            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Material</option>
                            {materials.map(mat => (
                              <option key={mat.id} value={mat.id}>
                                {mat.code} - {mat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            step="0.01"
                            value={material.quantity}
                            onChange={(e) => updateJewelryMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                          <input
                            type="text"
                            value={material.unit}
                            readOnly
                            className="w-full p-2 border rounded text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Cost/Unit</label>
                          <input
                            type="number"
                            step="0.01"
                            value={material.costPerUnit}
                            onChange={(e) => updateJewelryMaterial(index, 'costPerUnit', parseFloat(e.target.value) || 0)}
                            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Total Cost</label>
                          <input
                            type="number"
                            value={material.totalCost.toFixed(2)}
                            readOnly
                            className="w-full p-2 border rounded text-sm bg-gray-100 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                          <button
                            onClick={() => removeMaterialFromJewelry(index)}
                            className="bg-red-500 text-white p-2 rounded text-sm hover:bg-red-600 w-full"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Materials Cost</label>
                <input
                  type="number"
                  value={newJewelry.materials.reduce((sum, m) => sum + m.totalCost, 0).toFixed(2)}
                  readOnly
                  className="w-full p-2 border rounded bg-blue-50 font-semibold text-blue-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Labor Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={newJewelry.laborCost}
                  onChange={(e) => setNewJewelry(prev => ({...prev, laborCost: parseFloat(e.target.value) || 0}))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Other Costs</label>
                <input
                  type="number"
                  step="0.01"
                  value={newJewelry.otherCosts}
                  onChange={(e) => setNewJewelry(prev => ({...prev, otherCosts: parseFloat(e.target.value) || 0}))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sale Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newJewelry.salePrice}
                  onChange={(e) => setNewJewelry(prev => ({...prev, salePrice: parseFloat(e.target.value) || 0}))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddJewelry}
                disabled={!newJewelry.name || !newJewelry.code}
                className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                  newJewelry.name && newJewelry.code
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save size={16} />
                <span>Add Jewelry Piece</span>
              </button>
              <button
                onClick={() => setShowAddJewelryForm(false)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {confirmAction.type === 'edit' ? 'Confirm Edit' : 'Confirm Archive'}
            </h3>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex space-x-3">
              <button
                onClick={confirmAction.onConfirm}
                className={`px-4 py-2 rounded-lg font-medium ${
                  confirmAction.type === 'edit' 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {confirmAction.type === 'edit' ? 'Yes, Edit' : 'Yes, Archive'}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JewelryManagementSystem;