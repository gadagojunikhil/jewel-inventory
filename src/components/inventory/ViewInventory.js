import React, { useState, useEffect } from 'react';
import { Search, Package, DollarSign, Eye, Edit2, Trash2, Filter } from 'lucide-react';
import usePermissions from '../../hooks/usePermissions';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const ViewInventory = ({ onItemCodeClick, onEditItemClick }) => {
  const { hasPermission } = usePermissions();
  
  const [jewelryPieces, setJewelryPieces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmUpdateModalOpen, setConfirmUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Stone management for edit modal
  const [editStoneForm, setEditStoneForm] = useState({
    stoneCode: '',
    stoneName: '',
    unit: 'gram',
    weight: '',
    rate: '',
    stoneCost: 0
  });
  const [showEditStoneForm, setShowEditStoneForm] = useState(false);
  const [editingStoneIndex, setEditingStoneIndex] = useState(null);

  // Load data from database APIs
  useEffect(() => {
    loadAllData();
  }, []);

  // Load data when filters change
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadInventoryData();
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [selectedCategory, selectedStatus, searchTerm, pagination.page]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadInventoryData(),
        loadCategories(),
        loadVendors(),
        loadMaterials()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for inventory data');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/inventory?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Inventory data loaded:', data);
        setJewelryPieces(data.items || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0
        }));
      } else {
        console.warn('Failed to load inventory data, status:', response.status);
        setJewelryPieces([]);
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
      setJewelryPieces([]);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/materials', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  // Helper function to get material type from stones
  const getMaterialTypes = (stonesData) => {
    const parsedStones = parseStones(stonesData);
    if (!parsedStones || parsedStones.length === 0) return [];
    
    const materialTypes = new Set();
    parsedStones.forEach(stone => {
      if (stone.stoneCode) {
        const material = materials.find(m => m.code === stone.stoneCode);
        if (material && material.category) {
          materialTypes.add(material.category);
        }
      }
    });
    
    return Array.from(materialTypes);
  };

  // Helper function to safely parse stones data
  const parseStones = (stonesData) => {
    if (!stonesData) return [];
    // If already an array, map to expected fields
    if (Array.isArray(stonesData)) {
      return stonesData.map(stone => ({
        stoneCode: stone.stone_code || stone.stoneCode || stone.code || '',
        stoneName: stone.stone_name || stone.stoneName || stone.name || '',
        weight: stone.weight || 0,
        rate: stone.cost_price || stone.rate || 0, // Use cost_price for inventory calculations
        stoneCost: (parseFloat(stone.weight || 0) * parseFloat(stone.cost_price || stone.rate || 0)) || 0,
        unit: stone.unit || 'gram',
      }));
    }
    // If it's a string, try to parse it
    if (typeof stonesData === 'string') {
      try {
        const arr = JSON.parse(stonesData);
        return Array.isArray(arr) ? arr.map(stone => ({
          stoneCode: stone.stone_code || stone.stoneCode || stone.code || '',
          stoneName: stone.stone_name || stone.stoneName || stone.name || '',
          weight: stone.weight || 0,
          rate: stone.cost_price || stone.rate || 0, // Use cost_price for inventory calculations
          stoneCost: (parseFloat(stone.weight || 0) * parseFloat(stone.cost_price || stone.rate || 0)) || 0,
          unit: stone.unit || 'gram',
        })) : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  };

  // Helper function to highlight search terms
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.toString().split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Action handlers
  const handleViewItem = (item) => {
    console.log('Selected item:', item);
    console.log('Stones data:', item.stones);
    console.log('Stones type:', typeof item.stones);
    setSelectedItem(item);
    setViewModalOpen(true);
  };

  const handleItemCodeClick = (item) => {
    // Same as view - show complete details
    handleViewItem(item);
  };

  const handleEditItem = (item) => {
    // Set up edit form data with all current values
    setSelectedItem(item);
    const parsedStones = parseStones(item.stones);
    setEditFormData({
      code: item.code || '',
      description: item.description || '',
      vendor_id: item.vendor_id || '',
      category_id: item.category_id || '',
      gross_weight: item.gross_weight || '',
      net_weight: item.net_weight || '',
      gold_purity: item.gold_purity || '',
      gold_rate: item.gold_rate || '',
      making_charges: item.making_charges || '',
      wastage_charges: item.wastage_charges || '',
      wastage_percentage: item.wastage_percentage || '',
      total_cost_value: item.total_cost_value || '',
      sale_price: item.sale_price || '',
      certificate: item.certificate || 'No',
      status: item.status || 'In Stock',
      notes: item.notes || '',
      stones: parsedStones
    });
    setEditModalOpen(true);
  };

  // Stone management functions for edit modal
  const handleEditStoneCodeChange = (stoneCode) => {
    const material = materials.find(m => m.code === stoneCode);
    setEditStoneForm(prev => ({
      ...prev,
      stoneCode,
      stoneName: material ? material.name : '',
      unit: material ? material.unit : 'gram',
      rate: material ? (material.cost_price || material.costPrice || '') : '' // Try both possible field names
    }));
  };

  const handleAddEditStone = () => {
    if (!editStoneForm.stoneCode || !editStoneForm.weight || !editStoneForm.rate) {
      alert('Please fill in all stone details');
      return;
    }

    const newStone = {
      ...editStoneForm,
      weight: parseFloat(editStoneForm.weight),
      rate: parseFloat(editStoneForm.rate),
      stoneCost: parseFloat(editStoneForm.weight) * parseFloat(editStoneForm.rate)
    };

    let updatedStones = [...(editFormData.stones || [])];

    if (editingStoneIndex !== null) {
      // Editing existing stone
      updatedStones[editingStoneIndex] = newStone;
      setEditingStoneIndex(null);
    } else {
      // Adding new stone
      updatedStones.push(newStone);
    }

    setEditFormData(prev => ({ ...prev, stones: updatedStones }));

    // Reset form
    setEditStoneForm({
      stoneCode: '',
      stoneName: '',
      unit: 'gram',
      weight: '',
      rate: '',
      stoneCost: 0
    });
    setShowEditStoneForm(false);
  };

  const handleEditStoneItem = (index) => {
    const stone = editFormData.stones[index];
    setEditStoneForm(stone);
    setEditingStoneIndex(index);
    setShowEditStoneForm(true);
  };

  const handleRemoveStone = (index) => {
    if (window.confirm('Are you sure you want to remove this stone?')) {
      const updatedStones = editFormData.stones.filter((_, i) => i !== index);
      setEditFormData(prev => ({ ...prev, stones: updatedStones }));
    }
  };

  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = () => {
    // Show confirmation modal instead of directly saving
    setConfirmUpdateModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedItem) return;

    setSaving(true);
    setConfirmUpdateModalOpen(false);
    
    try {
      const token = localStorage.getItem('token');
      
      // RECALCULATE ALL VALUES PROPERLY
      const grossWeight = parseFloat(editFormData.gross_weight) || 0;
      const stones = editFormData.stones || [];
      
      // Calculate stone weight (convert all to grams)
      const totalStoneWeight = stones.reduce((total, stone) => {
        let weight = parseFloat(stone.weight) || 0;
        if (stone.unit === 'carat') {
          weight = weight * 0.2; // 1 carat = 0.2 grams
        } else if (stone.unit === 'kg') {
          weight = weight * 1000; // 1 kg = 1000 grams
        }
        return total + weight;
      }, 0);
      
      const netWeight = Math.max(0, grossWeight - totalStoneWeight);
      const goldRate = parseFloat(editFormData.gold_rate) || 0;
      const goldPurity = parseInt(editFormData.gold_purity) || 18;
      const purityFactor = goldPurity / 24;
      
      // Calculate gold price (including wastage)
      const wastagePercentage = parseFloat(editFormData.wastage_percentage) || 0;
      const wastageWeight = netWeight * (wastagePercentage / 100);
      const totalGoldWeight = netWeight + wastageWeight; // Add wastage to net weight
      const totalGoldPrice = totalGoldWeight * goldRate * purityFactor;
      
      // Calculate stone cost
      const totalStoneCost = stones.reduce((total, stone) => {
        return total + (parseFloat(stone.stoneCost) || 0);
      }, 0);
      
      // Calculate wastage (for reference - already included in gold price)
      const wastageCost = wastageWeight * goldRate * purityFactor;
      
      // Calculate making charges
      const makingChargesPerGram = parseFloat(editFormData.making_charges) || 0;
      const totalMakingCharges = netWeight * makingChargesPerGram;
      
      // Calculate certificate cost for diamonds/rounds
      let certificateCost = 0;
      if (editFormData.certificate === 'Yes') {
        const totalDiamondCarats = stones.reduce((total, stone) => {
          if (stone.stoneName && (stone.stoneName.toLowerCase().includes('diamond') || 
                                  stone.stoneName.toLowerCase().includes('round'))) {
            let weight = parseFloat(stone.weight) || 0;
            // Convert to carats if needed
            if (stone.unit === 'gram') {
              weight = weight * 5; // 1 gram = 5 carats
            } else if (stone.unit === 'kg') {
              weight = weight * 5000;
            }
            return total + weight;
          }
          return total;
        }, 0);
        certificateCost = totalDiamondCarats * 700;
      }
      
      // Calculate total cost value (wastage already included in gold price)
      const totalCostValue = totalGoldPrice + totalStoneCost + totalMakingCharges + certificateCost;
      
      console.log('=== EDIT SAVE CALCULATIONS ===');
      console.log(`Gross Weight: ${grossWeight}g`);
      console.log(`Stone Weight: ${totalStoneWeight}g`);
      console.log(`Net Weight: ${netWeight}g`);
      console.log(`Gold Price: ₹${totalGoldPrice.toFixed(2)}`);
      console.log(`Stone Cost: ₹${totalStoneCost.toFixed(2)}`);
      console.log(`Wastage Cost: ₹${wastageCost.toFixed(2)}`);
      console.log(`Making Charges: ₹${totalMakingCharges.toFixed(2)}`);
      console.log(`Certificate Cost: ₹${certificateCost.toFixed(2)}`);
      console.log(`TOTAL COST VALUE: ₹${totalCostValue.toFixed(2)}`);
      
      // Prepare the data with ALL calculated values
      const updateData = {
        code: editFormData.code,
        description: editFormData.description,
        vendor_id: editFormData.vendor_id || null,
        category_id: parseInt(editFormData.category_id) || null,
        gross_weight: grossWeight,
        stone_weight: totalStoneWeight,
        net_weight: netWeight,
        gold_purity: goldPurity,
        gold_rate: goldRate,
        total_gold_price: totalGoldPrice,
        total_stone_cost: totalStoneCost,
        wastage_percentage: wastagePercentage,
        total_wastage: wastageCost,
        making_charges: makingChargesPerGram,
        total_making_charges: totalMakingCharges,
        total_cost_value: totalCostValue,
        sale_price: parseFloat(editFormData.sale_price) || 0,
        certificate: editFormData.certificate || 'No',
        status: editFormData.status || 'In Stock',
        notes: editFormData.notes || '',
        stones: editFormData.stones || []
      };

      console.log('Sending calculated update data:', updateData);

      const response = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await loadInventoryData(); // Refresh the list
        setEditModalOpen(false);
        setSelectedItem(null);
        setEditFormData({});
        alert('Jewelry item updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update item: ${errorData.message || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadInventoryData(); // Refresh the list
        setDeleteModalOpen(false);
        setSelectedItem(null);
        alert('Item deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete item: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Permission checks
  const canView = hasPermission('view-inventory', 'view');
  const canEdit = hasPermission('edit-inventory', 'edit');
  const canDelete = hasPermission('view-inventory', 'delete');

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Access Denied</div>
          <div className="text-gray-600">You don't have permission to view inventory.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-blue-500 text-xl mb-2">Loading...</div>
          <div className="text-gray-600">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto pb-12">
      <PageIdentifier pageId={SCREEN_IDS?.INVENTORY?.VIEW_LIST || 'INV-001'} pageName="View Inventory" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600">View and manage your jewelry inventory</p>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{jewelryPieces.reduce((sum, item) => {
                    const price = parseFloat(item.sale_price || item.total_cost_value || 0);
                    return sum + (isNaN(price) ? 0 : price);
                  }, 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jewelryPieces.filter(item => item.status === 'In Stock').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jewelryPieces.filter(item => item.status === 'Sold').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Search & Filter Jewelry Items</h3>
            <p className="text-sm text-gray-600">Search by item code, description, category, vendor, or any jewelry details</p>
          </div>
          
          <div className="space-y-4">
            {/* Primary Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by item code, description, category, vendor, gold purity, weight..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="min-w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="min-w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Sold">Sold</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Repair">Repair</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Search Results Count */}
              {searchTerm && (
                <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
                  <span className="font-medium">{jewelryPieces.length}</span>
                  <span className="ml-1">items found for "{searchTerm}"</span>
                </div>
              )}

              {/* Clear All Filters */}
              {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Quick Search Suggestions */}
            {!searchTerm && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Quick search:</span>
                {['18K', '22K', 'Diamond', 'Gold', 'In Stock', 'Necklace', 'Ring'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchTerm(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header with Search Results */}
          {searchTerm && (
            <div className="bg-blue-50 px-6 py-3 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">
                    Search Results for "{searchTerm}"
                  </span>
                </div>
                <span className="text-blue-600 text-sm">
                  {jewelryPieces.length} of {pagination.total} items
                </span>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  {(canEdit || canDelete) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jewelryPieces.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => handleItemCodeClick(item)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        title="View item details"
                      >
                        {highlightSearchTerm(item.code, searchTerm)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.gross_weight ? `${parseFloat(item.gross_weight).toFixed(3)}g` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {highlightSearchTerm(item.category_name || 'N/A', searchTerm)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={item.description}>
                      {highlightSearchTerm(item.description || 'No description', searchTerm)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                        item.status === 'Sold' ? 'bg-red-100 text-red-800' :
                        item.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'Repair' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status || 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {highlightSearchTerm(item.vendor_name || 'N/A', searchTerm)}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewItem(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {canEdit && (
                            <button 
                              onClick={() => handleEditItem(item)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit Item"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => handleDeleteItem(item)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Item"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {jewelryPieces.length === 0 && (
              <div className="text-center py-12">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' ? (
                  <>
                    <Search className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search terms or filters
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setSelectedStatus('all');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new item to your inventory.</p>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                    <span className="font-medium">{pagination.pages}</span> ({pagination.total} total items)
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <PageIdentifier pageId={SCREEN_IDS?.INVENTORY?.VIEW_DETAILS_MODAL || 'INV-001M1'} pageName="View Item Details" isModal={true} />
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
                <div className="flex items-center space-x-2">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setViewModalOpen(false);
                        handleEditItem(selectedItem);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Item Code</label>
                    <p className="text-sm text-gray-900">{selectedItem.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gross Weight</label>
                    <p className="text-sm text-gray-900">{selectedItem.gross_weight ? `${parseFloat(selectedItem.gross_weight).toFixed(3)}g` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900">
                      {(() => {
                        const materialTypes = getMaterialTypes(selectedItem.stones);
                        const jewelType = selectedItem.category_name || 'N/A';
                        const materialTypeStr = materialTypes.length > 0 ? materialTypes.join(', ') : '';
                        return materialTypeStr ? `${materialTypeStr} + ${jewelType}` : jewelType;
                      })()}
                    </p>
                    {selectedItem.category_description && (
                      <p className="text-xs text-gray-500 mt-1">{selectedItem.category_description}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedItem.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                      selectedItem.status === 'Sold' ? 'bg-red-100 text-red-800' :
                      selectedItem.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vendor</label>
                    <p className="text-sm text-gray-900">{selectedItem.vendor_name || 'N/A'}</p>
                    {selectedItem.vendor_code && (
                      <p className="text-xs text-gray-500 mt-1">Code: {selectedItem.vendor_code}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedItem.description || 'No description available'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Net Weight</label>
                    <p className="text-sm text-gray-900">{selectedItem.net_weight ? `${parseFloat(selectedItem.net_weight).toFixed(3)}g` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gold Purity</label>
                    <p className="text-sm text-gray-900">{selectedItem.gold_purity ? `${selectedItem.gold_purity}K` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedItem.stones && parseStones(selectedItem.stones).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Stones Details</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost Rate (₹)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost Value (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parseStones(selectedItem.stones).map((stone, index) => {
                          // Get material info to determine proper unit and cost calculation
                          const material = materials.find(m => m.code === stone.stoneCode);
                          const displayUnit = material ? material.unit : (stone.unit || 'gram');
                          // Use cost_price from material if available, otherwise fall back to stored rate
                          const costPrice = material ? (material.cost_price || material.costPrice || stone.rate) : stone.rate;
                          const costValue = parseFloat(stone.weight || 0) * parseFloat(costPrice || 0);
                          
                          return (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{stone.stoneCode || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{stone.stoneName || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{stone.weight || 0} {displayUnit}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">₹{parseFloat(costPrice || 0).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-2 text-sm text-green-600 font-medium">₹{parseFloat(costValue).toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cost Information - Bottom Right */}
              <div className="mt-6 flex justify-end">
                <div className="bg-gray-50 p-4 rounded-lg border w-80">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Cost Breakdown</h4>
                  <div className="space-y-2">
                    {(() => {
                      // Calculate breakdown components
                      const grossWeight = parseFloat(selectedItem.gross_weight || 0);
                      const netWeight = parseFloat(selectedItem.net_weight || 0);
                      const goldRate = parseFloat(selectedItem.gold_rate || 0);
                      const goldPurity = parseInt(selectedItem.gold_purity || 18);
                      const purityFactor = goldPurity / 24;
                      
                      // Calculate total gold cost
                      const totalGoldCost = netWeight * goldRate * purityFactor;
                      
                      // Calculate total stone value from stones data
                      const stones = parseStones(selectedItem.stones);
                      const totalStoneValue = stones.reduce((total, stone) => {
                        const material = materials.find(m => m.code === stone.stoneCode);
                        const costPrice = material ? (material.cost_price || material.costPrice || stone.rate) : stone.rate; // Use cost_price for inventory
                        const costValue = parseFloat(stone.weight || 0) * parseFloat(costPrice || 0);
                        return total + parseFloat(costValue);
                      }, 0);
                      
                      // Calculate making charges
                      const makingChargesPerGram = parseFloat(selectedItem.making_charges || 0);
                      const totalMakingCharges = netWeight * makingChargesPerGram;
                      
                      // Calculate wastage charges
                      const wastagePercentage = parseFloat(selectedItem.wastage_percentage || 0);
                      const wastageCharges = (netWeight * (wastagePercentage / 100)) * goldRate * purityFactor;
                      
                      // Calculate certificate cost for diamonds
                      let certificateCost = 0;
                      if (selectedItem.certificate === 'Yes') {
                        const totalDiamondCarats = stones.reduce((total, stone) => {
                          if (stone.stoneName && (stone.stoneName.toLowerCase().includes('diamond') || 
                                                  stone.stoneName.toLowerCase().includes('round'))) {
                            let weight = parseFloat(stone.weight || 0);
                            const material = materials.find(m => m.code === stone.stoneCode);
                            const unit = material ? material.unit : (stone.unit || 'gram');
                            
                            // Convert to carats if needed
                            if (unit === 'gram') {
                              weight = weight * 5; // 1 gram = 5 carats
                            } else if (unit === 'kg') {
                              weight = weight * 5000;
                            }
                            return total + weight;
                          }
                          return total;
                        }, 0);
                        certificateCost = totalDiamondCarats * 700;
                      }
                      
                      const calculatedTotal = totalGoldCost + totalStoneValue + totalMakingCharges + wastageCharges + certificateCost;
                      
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Gold Cost:</span>
                            <span className="text-sm font-medium">₹{totalGoldCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Stone Value:</span>
                            <span className="text-sm font-medium">₹{totalStoneValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Making Charges:</span>
                            <span className="text-sm font-medium">₹{totalMakingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Wastage Charges:</span>
                            <span className="text-sm font-medium">₹{wastageCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          {certificateCost > 0 && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Certificate Cost:</span>
                              <span className="text-sm font-medium">₹{certificateCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold text-gray-700">Total Cost Value:</span>
                              <span className="text-sm font-bold text-green-600">
                                ₹{calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <PageIdentifier pageId={SCREEN_IDS?.INVENTORY?.EDIT_MODAL || 'INV-001M2'} pageName="Edit Item Modal" isModal={true} />
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-gray-900">Edit Jewelry Item</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Code <span className="text-gray-500">(Read Only)</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.code}
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={editFormData.category_id}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                    <select
                      value={editFormData.vendor_id}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, vendor_id: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Sold">Sold</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Repair">Repair</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Weight and Gold Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Weight & Gold Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gross Weight (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editFormData.gross_weight}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, gross_weight: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Net Weight (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editFormData.net_weight}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, net_weight: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gold Purity</label>
                    <select
                      value={editFormData.gold_purity}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, gold_purity: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Purity</option>
                      <option value="18KT">18KT</option>
                      <option value="22KT">22KT</option>
                      <option value="24KT">24KT</option>
                      <option value="14KT">14KT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gold Rate (₹/g)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.gold_rate}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, gold_rate: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Charges and Pricing */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Charges & Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Making Charges (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.making_charges}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, making_charges: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wastage Charges (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.wastage_charges}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, wastage_charges: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost Value (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.total_cost_value}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, total_cost_value: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      readOnly
                      title="Calculated field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate</label>
                    <select
                      value={editFormData.certificate}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, certificate: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stones Information */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-700">Stones Information</h4>
                  <button
                    type="button"
                    onClick={() => setShowEditStoneForm(true)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>Add Stone</span>
                  </button>
                </div>
                
                {/* Stone Form */}
                {showEditStoneForm && (
                  <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                    <h5 className="text-md font-medium text-gray-700 mb-3">
                      {editingStoneIndex !== null ? 'Edit Stone' : 'Add New Stone'}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stone Code</label>
                        <select
                          value={editStoneForm.stoneCode}
                          onChange={(e) => handleEditStoneCodeChange(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select Code</option>
                          {materials.map(material => (
                            <option key={material.id} value={material.code}>
                              {material.code} - {material.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={editStoneForm.stoneName}
                          onChange={(e) => setEditStoneForm(prev => ({ ...prev, stoneName: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input
                          type="text"
                          value={editStoneForm.unit}
                          className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                        <input
                          type="number"
                          step="0.001"
                          value={editStoneForm.weight}
                          onChange={(e) => setEditStoneForm(prev => ({ ...prev, weight: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editStoneForm.rate}
                          onChange={(e) => setEditStoneForm(prev => ({ ...prev, rate: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div className="flex items-end space-x-2">
                        <button
                          type="button"
                          onClick={handleAddEditStone}
                          className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                        >
                          {editingStoneIndex !== null ? 'Update' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditStoneForm(false);
                            setEditingStoneIndex(null);
                            setEditStoneForm({
                              stoneCode: '',
                              stoneName: '',
                              unit: 'gram',
                              weight: '',
                              rate: '',
                              stoneCost: 0
                            });
                          }}
                          className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Stones Table */}
                {editFormData.stones && editFormData.stones.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate (₹)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost (₹)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editFormData.stones.map((stone, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{stone.stoneCode || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{stone.stoneName || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{stone.weight || 0} {stone.unit || ''}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">₹{parseFloat(stone.rate || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 text-sm text-green-600 font-medium">₹{(stone.stoneCost || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 text-sm">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditStoneItem(index)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit stone"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStone(index)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Remove stone"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No stones added yet. Click "Add Stone" to add stones to this jewelry item.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <PageIdentifier pageId={SCREEN_IDS?.INVENTORY?.DELETE_CONFIRMATION_MODAL || 'INV-001M3'} pageName="Delete Confirmation" isModal={true} />
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Item</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete item "{selectedItem.code}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Confirmation Modal */}
      {confirmUpdateModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <PageIdentifier pageId={SCREEN_IDS?.INVENTORY?.UPDATE_CONFIRMATION_MODAL || 'INV-001M4'} pageName="Update Confirmation" isModal={true} />
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Edit2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Confirm Update</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to update item "{selectedItem.code}"? This will save all changes to the database.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setConfirmUpdateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewInventory;
