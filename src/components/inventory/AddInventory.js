import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Calendar, Hash, Building2, FileText, Scale, Gem, DollarSign, Award, CheckCircle } from 'lucide-react';
import usePermissions from '../../hooks/usePermissions';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const AddInventory = () => {
  const { hasPermission, getPermissionLevel } = usePermissions();
  
  // Permission checks for add-inventory page
  const canCreate = hasPermission('add-inventory', 'create');
  const canView = hasPermission('add-inventory', 'view');
  const permissionLevel = getPermissionLevel('add-inventory');

  // State management for component data
  const [jewelryPieces, setJewelryPieces] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [jewelryCategories, setJewelryCategories] = useState([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [currentGoldRate, setCurrentGoldRate] = useState(10000); // Default rate from dpgold.com
  
  // Load data from database
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load jewelry pieces from database
      await loadJewelryPieces();
      await loadMaterials();
      await loadCategories();
      await loadVendors();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadJewelryPieces = async () => {
    try {
      const response = await fetch('/api/jewelry', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setJewelryPieces(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading jewelry pieces:', error);
      setJewelryPieces([]);
    }
  };
  const loadMaterials = async () => {
    try {
      const response = await fetch('/api/materials', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMaterials(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
      setMaterials([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setJewelryCategories(data);
          setCategories(data);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setJewelryCategories([]);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await fetch('/api/vendors', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      setVendors([]);
    }
  };

  const loadCurrentGoldRate = async () => {
    try {
      const response = await fetch('/api/rates/gold/today', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.rate) {
          const goldRatePerGram = data.rate.gold_24k_per_10g / 10; // Convert from per 10g to per gram
          setCurrentGoldRate(goldRatePerGram);
        }
      }
    } catch (error) {
      console.error('Error loading gold rate:', error);
    }
  };

  
  // Form state based on your requirements
  const [inventoryData, setInventoryData] = useState({
    // Section 1
    date: new Date().toISOString().split('T')[0], // Current date but editable
    itemCode: {
      category: '',
      number: ''
    },
    
    // Section 2
    vendorCode: '',
    description: '',
    grossWeight: 0,
    netWeight: 0,
    goldRate: 10000, // 24KT gold rate in Indian Currency
    pcs: 1,
    purity: '22KT', // Gold purity
    certificate: 'No',
    totalGoldPrice: 0,
    
    // Additional fields for future expansion
    stoneWeight: 0, // For stone weight calculation in carats
    makingCharges: 0,
    wastagePercentage: 0,
    otherCosts: 0
  });

  // Purity options with their numeric values for calculation
  const purityOptions = [
    { label: '14KT', value: '14KT', numeric: 14 },
    { label: '18KT', value: '18KT', numeric: 18 },
    { label: '22KT', value: '22KT', numeric: 22 },
    { label: '24KT', value: '24KT', numeric: 24 }
  ];

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadCategories();
    loadVendors();
    loadCurrentGoldRate();
    
    // Set default sample data only if no data is available after 3 seconds
    const fallbackTimer = setTimeout(() => {
      if (categories.length === 0 && !categoriesLoading) {
        console.log('No categories loaded from API, using default categories');
        const defaultCategories = [
          { id: 1, name: 'Necklace', code: 'N', description: 'All types of necklaces' },
          { id: 2, name: 'Ring', code: 'R', description: 'All types of rings' },
          { id: 3, name: 'Earrings', code: 'E', description: 'All types of earrings' },
          { id: 4, name: 'Bracelet', code: 'B', description: 'All types of bracelets' },
          { id: 5, name: 'Pendant', code: 'P', description: 'All types of pendants' }
        ];
        setCategories(defaultCategories);
        setJewelryCategories(defaultCategories);
      }
      
      if (vendors.length === 0) {
        console.log('No vendors loaded from API, using default vendors');
        const defaultVendors = [
          { id: 1, name: 'Sample Vendor', company: 'Sample Vendor Co.', city: 'Sample City' }
        ];
        setVendors(defaultVendors);
      }
    }, 3000); // Wait 3 seconds for API calls to complete

    return () => clearTimeout(fallbackTimer);
  }, []);

  // Form state based on your requirements

  // Load vendors


  // Generate sequential item number based on category and current date
  const generateItemNumber = (categoryCode) => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month with leading zero
    
    // Find existing items with same category in current month for sequence
    const existingItems = (jewelryPieces || []).filter(item => 
      item.code && item.code.startsWith(`${categoryCode}-${year}${month}`)
    );
    
    const sequence = (existingItems.length + 1).toString().padStart(3, '0');
    return `${categoryCode}-${year}${month}${sequence}`;
  };

  // Handle category selection and auto-generate item number
  const handleCategoryChange = (categoryCode) => {
    const itemNumber = generateItemNumber(categoryCode);
    setInventoryData(prev => ({
      ...prev,
      itemCode: {
        category: categoryCode,
        number: itemNumber
      }
    }));
  };

  // Calculate net weight (Gross Weight - Stone Weight converted to grams)
  const calculateNetWeight = (grossWeight, stoneWeightCarats) => {
    const stoneWeightGrams = stoneWeightCarats * 0.2; // 1 carat = 0.2 grams
    return Math.max(0, grossWeight - stoneWeightGrams);
  };

  // Calculate total gold price using the formula: Net Weight * Gold Rate * Purity / 24
  const calculateTotalGoldPrice = (netWeight, goldRate, purity) => {
    const purityData = purityOptions.find(p => p.value === purity);
    if (!purityData) return 0;
    
    const purityFactor = purityData.numeric / 24;
    return netWeight * goldRate * purityFactor;
  };

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setInventoryData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Recalculate dependent fields
      if (field === 'grossWeight' || field === 'stoneWeight') {
        newData.netWeight = calculateNetWeight(
          field === 'grossWeight' ? value : prev.grossWeight,
          field === 'stoneWeight' ? value : prev.stoneWeight
        );
      }
      
      // Recalculate total gold price when relevant fields change
      if (field === 'grossWeight' || field === 'stoneWeight' || field === 'goldRate' || field === 'purity') {
        const netWeight = field === 'grossWeight' || field === 'stoneWeight' 
          ? newData.netWeight 
          : prev.netWeight;
        
        newData.totalGoldPrice = calculateTotalGoldPrice(
          netWeight,
          field === 'goldRate' ? value : prev.goldRate,
          field === 'purity' ? value : prev.purity
        );
      }
      
      return newData;
    });
  };

  // Handle save inventory
  const handleSaveInventory = async () => {
    // Validation
    if (!inventoryData.itemCode.category || !inventoryData.vendorCode) {
      alert('Please fill in required fields: Category and Vendor Code');
      return;
    }

    if (inventoryData.grossWeight <= 0) {
      alert('Please enter a valid gross weight');
      return;
    }

    try {
      // Create inventory item object
      const newInventoryItem = {
        id: Math.max(...(jewelryPieces || []).map(j => j.id), 0) + 1,
        code: inventoryData.itemCode.number,
        name: `${inventoryData.itemCode.category} - ${inventoryData.itemCode.number}`,
        category: inventoryData.itemCode.category,
        date: inventoryData.date,
        vendorCode: inventoryData.vendorCode,
        description: inventoryData.description,
        grossWeight: inventoryData.grossWeight,
        netWeight: inventoryData.netWeight,
        stoneWeight: inventoryData.stoneWeight,
        goldRate: inventoryData.goldRate,
        pcs: inventoryData.pcs,
        purity: inventoryData.purity,
        certificate: inventoryData.certificate,
        totalGoldPrice: inventoryData.totalGoldPrice,
        makingCharges: inventoryData.makingCharges,
        wastagePercentage: inventoryData.wastagePercentage,
        otherCosts: inventoryData.otherCosts,
        status: 'In Stock',
        createdDate: new Date().toISOString(),
        materials: [] // Will be expanded in stones section
      };

      const updatedJewelryPieces = [...(jewelryPieces || []), newInventoryItem];
      setJewelryPieces(updatedJewelryPieces);
      

      // Reset form
      setInventoryData({
        date: new Date().toISOString().split('T')[0],
        itemCode: { category: '', number: '' },
        vendorCode: '',
        description: '',
        grossWeight: 0,
        netWeight: 0,
        goldRate: currentGoldRate,
        pcs: 1,
        purity: '22KT',
        certificate: 'No',
        totalGoldPrice: 0,
        stoneWeight: 0,
        makingCharges: 0,
        wastagePercentage: 0,
        otherCosts: 0
      });

      setShowAddForm(false);
      alert('Inventory item added successfully!');

    } catch (error) {
      console.error('Error saving inventory:', error);
      alert('Failed to save inventory item. Please try again.');
    }
  };

  return (
    <div className="p-6 pb-12">
      <PageIdentifier pageId={SCREEN_IDS?.INVENTORY?.ADD_ITEM || 'INV-002'} pageName="Add Inventory" />
      <h2 className="text-2xl font-bold mb-6">Add New Inventory</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <button
          onClick={() => setShowAddForm(true)}
          disabled={!canCreate}
          className={`w-full p-8 rounded-lg flex flex-col items-center space-y-3 ${
            canCreate 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={!canCreate ? `No permission to add inventory (Level: ${permissionLevel})` : ''}
        >
          <Plus size={48} />
          <span className="text-xl font-semibold">Add New Inventory Item</span>
          <span className="text-sm opacity-90">
            {canCreate ? 'Click to open the inventory creation form' : 'You do not have permission to add inventory'}
          </span>
        </button>
      </div>

      {/* Recent Inventory Items */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recently Added Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(jewelryPieces || [])
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
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Weight:</span> {jewelry.grossWeight}g
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Purity:</span> {jewelry.purity}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{jewelry.totalGoldPrice?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            ))}
        </div>
        {(!jewelryPieces || jewelryPieces.length === 0) && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">No inventory items added yet</p>
          </div>
        )}
      </div>

      {/* Add Inventory Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-6xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">Add New Inventory Item</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Section 1: Basic Information */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Section 1: Basic Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-1" size={16} />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={inventoryData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Purchase date (editable)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline mr-1" size={16} />
                    Category *
                  </label>
                  <select
                    value={inventoryData.itemCode.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.code}>{cat.name} ({cat.code})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline mr-1" size={16} />
                    Item Number (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value={inventoryData.itemCode.number}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                    placeholder="Select category to generate"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: Category-YY-MM-XXX</p>
                </div>
              </div>
            </div>

            {/* Section 2: Inventory Details */}
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <Gem className="mr-2" size={20} />
                Section 2: Inventory Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="inline mr-1" size={16} />
                    Vendor Code *
                  </label>
                  <select
                    value={inventoryData.vendorCode}
                    onChange={(e) => handleInputChange('vendorCode', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.company}>
                        {vendor.company} - {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline mr-1" size={16} />
                    Pieces
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inventoryData.pcs}
                    onChange={(e) => handleInputChange('pcs', parseInt(e.target.value) || 1)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="inline mr-1" size={16} />
                    Purity
                  </label>
                  <select
                    value={inventoryData.purity}
                    onChange={(e) => handleInputChange('purity', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {purityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle className="inline mr-1" size={16} />
                    Certificate
                  </label>
                  <select
                    value={inventoryData.certificate}
                    onChange={(e) => handleInputChange('certificate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline mr-1" size={16} />
                  Description
                </label>
                <textarea
                  value={inventoryData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Vendor tag information or other details for reference"
                />
              </div>
            </div>

            {/* Weight and Pricing Section */}
            <div className="bg-yellow-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                <Scale className="mr-2" size={20} />
                Weight & Pricing Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Scale className="inline mr-1" size={16} />
                    Gross Weight (grams) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={inventoryData.grossWeight}
                    onChange={(e) => handleInputChange('grossWeight', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="0.000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Gem className="inline mr-1" size={16} />
                    Stone Weight (carats)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={inventoryData.stoneWeight}
                    onChange={(e) => handleInputChange('stoneWeight', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="0.000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Converted to grams for calculation</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Scale className="inline mr-1" size={16} />
                    Net Weight (grams)
                  </label>
                  <input
                    type="number"
                    value={inventoryData.netWeight.toFixed(3)}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated: Gross - Stone Weight</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline mr-1" size={16} />
                    Gold Rate (₹/gram, 24KT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={inventoryData.goldRate}
                    onChange={(e) => handleInputChange('goldRate', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current rate from dpgold.com</p>
                </div>
              </div>
            </div>

            {/* Calculation Summary */}
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <DollarSign className="mr-2" size={20} />
                Price Calculation
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-700 mb-2">Calculation Formula:</h5>
                    <p className="text-sm text-gray-600 font-mono">
                      Gold Price = Net Weight × Gold Rate × (Purity / 24)
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {inventoryData.netWeight.toFixed(3)}g × ₹{inventoryData.goldRate} × ({purityOptions.find(p => p.value === inventoryData.purity)?.numeric || 0}/24)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-700 mb-2">Total Gold Price:</h5>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{inventoryData.totalGoldPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      For {inventoryData.pcs} piece(s)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveInventory}
                disabled={!inventoryData.itemCode.category || !inventoryData.vendorCode || inventoryData.grossWeight <= 0}
                className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                  inventoryData.itemCode.category && inventoryData.vendorCode && inventoryData.grossWeight > 0
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save size={20} />
                <span>Save Inventory Item</span>
              </button>
              
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium flex items-center space-x-2"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddInventory;