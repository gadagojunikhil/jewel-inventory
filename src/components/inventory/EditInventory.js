import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Package, Save, X, Eye, Calendar } from 'lucide-react';
import usePermissions from '../../hooks/usePermissions';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const EditInventory = ({ itemId, onBack, onEditItemClick }) => {
  const { hasPermission } = usePermissions();
  
  // Permission checks for edit-inventory page
  const canEdit = hasPermission('edit-inventory', 'edit');
  const canDelete = hasPermission('edit-inventory', 'delete');
  
  const [jewelryPieces, setJewelryPieces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentGoldRate, setCurrentGoldRate] = useState(10000);

  // Edit form state (similar to AddInventory structure)
  const [editingData, setEditingData] = useState({
    id: null,
    // Section 1
    date: new Date().toISOString().split('T')[0],
    itemCode: {
      category: '',
      number: 1
    },
    
    // Section 2
    vendor: '',
    description: '',
    grossWeight: '',
    goldRate: 10000,
    purity: '18KT',
    certificate: 'No',
    totalGoldPrice: 0,
    
    // Section 3 - Stones
    stones: [],
    totalStoneCost: 0,
    
    // Section 4 - Wastage and Making Charges
    wastagePercent: 0,
    totalWastage: 0,
    makingCharges: 0,
    totalMakingCharges: 0,
    totalCostValue: 0
  });

  const [stoneForm, setStoneForm] = useState({
    stoneCode: '',
    stoneName: '',
    unit: 'gram',
    weight: '',
    rate: '',
    stoneCost: 0
  });

  const [editingStoneIndex, setEditingStoneIndex] = useState(null);
  // Modal / view state and saving flag
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, [itemId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show edit form when itemId is provided
  useEffect(() => {
    if (itemId) {
      setShowEditForm(true);
    }
  }, [itemId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Loading all data...');
      await Promise.all([
        loadInventoryData(),
        loadCategories(),
        loadVendors(),
        loadMaterials(),
        loadCurrentGoldRate()
      ]);
      
      // If we have an itemId, load the item data after all reference data is loaded
      if (itemId) {
        console.log('Loading item after all data loaded:', itemId);
        await loadItemForEdit(itemId);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/inventory?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJewelryPieces(data.inventory || []);
      } else {
        console.error('Failed to load inventory data');
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for loading categories');
        return;
      }

      console.log('Loading categories...');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Categories loaded:', data);
        setCategories(data);
      } else {
        console.error('Failed to load categories:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for loading vendors');
        return;
      }

      console.log('Loading vendors...');
      const response = await fetch('/api/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Vendors loaded:', data);
        setVendors(data);
      } else {
        console.error('Failed to load vendors:', response.status, response.statusText);
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
      } else {
        console.error('Failed to load materials');
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const loadCurrentGoldRate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/rates/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.price) {
          setCurrentGoldRate(data.price);
          setEditingData(prev => ({ ...prev, goldRate: data.price }));
        }
      } else {
        console.log('No current rate found, using default');
      }
    } catch (error) {
      console.error('Error loading current gold rate:', error);
    }
  };

  const loadItemForEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for loading item');
        return;
      }

      console.log('Loading item for edit:', id);
      const response = await fetch(`/api/inventory/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const item = await response.json();
        console.log('Item loaded for edit:', item);
        
        // Parse stones if it's a JSON string
        let parsedStones = [];
        if (item.stones) {
          try {
            parsedStones = typeof item.stones === 'string' ? JSON.parse(item.stones) : item.stones;

            // Normalize each stone object to the UI-friendly shape
            if (Array.isArray(parsedStones)) {
              parsedStones = parsedStones.map(s => ({
                stoneCode: s.stone_code || s.stoneCode || s.code || '',
                stoneName: s.stone_name || s.stoneName || s.name || '',
                weight: s.weight != null ? s.weight : (s.wt != null ? s.wt : 0),
                rate: s.sale_price != null ? s.sale_price : (s.rate != null ? s.rate : s.salePrice || 0),
                stoneCost: (parseFloat(s.weight || s.wt || 0) * parseFloat(s.sale_price || s.rate || s.salePrice || 0)) || 0,
                unit: s.unit || 'gram'
              }));

              // Enrich from materials if available so dropdown values match materials
              parsedStones = parsedStones.map(s => {
                const material = materials.find(m => m.code === (s.stoneCode || ''));
                const rateFromMaterial = material ? material.sale_price : undefined;
                const unitFromMaterial = material ? material.unit : undefined;
                return {
                  ...s,
                  stoneName: s.stoneName || (material ? material.name : ''),
                  rate: s.rate || rateFromMaterial || 0,
                  unit: s.unit || unitFromMaterial || 'gram',
                  stoneCost: (parseFloat(s.weight || 0) * parseFloat(s.rate || rateFromMaterial || 0)) || 0
                };
              });

            } else {
              parsedStones = [];
            }
          } catch (error) {
            console.error('Error parsing stones:', error);
            parsedStones = [];
          }
        }

        // Extract category and number from item code
        const codeMatch = item.code ? item.code.match(/^([A-Z]+)-(\d+)$/) : null;
        const category = codeMatch ? codeMatch[1] : '';
        const number = codeMatch ? parseInt(codeMatch[2]) : 1;
        
        console.log('Parsed item code:', { category, number, originalCode: item.code });

        // Set the editing data with the loaded item
        setEditingData({
          id: item.id,
          date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
          itemCode: {
            category: category,
            number: number
          },
          vendor: item.vendor_id || '',
          description: item.description || '',
          grossWeight: item.gross_weight || '',
          goldRate: item.gold_rate || currentGoldRate,
          purity: item.gold_purity || '18KT',
          certificate: item.certificate || 'No',
          totalGoldPrice: item.total_gold_price || 0,
          stones: parsedStones,
          totalStoneCost: item.total_stone_cost || 0,
          wastagePercent: item.wastage_percentage || 0,
          totalWastage: item.total_wastage || 0,
          makingCharges: item.making_charges || 0,
          totalMakingCharges: item.total_making_charges || 0,
          totalCostValue: item.total_cost_value || 0
        });

        console.log('EditingData set:', {
          vendor: item.vendor_id,
          category: category,
          currentVendors: vendors.length,
          currentCategories: categories.length
        });

      } else {
        console.error('Failed to load item for editing:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading item for edit:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = jewelryPieces.filter(jewelry => 
      jewelry.status !== 'Archived' && (
        jewelry.name?.toLowerCase().includes(query.toLowerCase()) ||
        jewelry.code?.toLowerCase().includes(query.toLowerCase()) ||
        jewelry.description?.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    setSearchResults(results);
  };

  const handleEditItem = (item) => {
    // If onEditItemClick is provided, we're in list view - navigate to detail edit page
    if (onEditItemClick) {
      onEditItemClick(item.id);
      return;
    }

    // Otherwise, we're in the search interface - show the edit form directly
    // Parse the item code to get category and number
    const codeMatch = item.code ? item.code.match(/^([A-Z]+)-(\d+)$/) : null;
    const category = codeMatch ? codeMatch[1] : '';
    const number = codeMatch ? parseInt(codeMatch[2]) : 1;

    // Parse stones data safely
    const stonesData = parseStones(item.stones);

    // Populate the editing form with item data
    setEditingData({
      id: item.id,
      // Section 1
      date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      itemCode: {
        category: category,
        number: number
      },
      
      // Section 2
      vendor: item.vendor_id || '',
      description: item.description || '',
      grossWeight: item.gross_weight || '',
      goldRate: item.gold_rate || currentGoldRate,
      purity: item.gold_purity || '18KT',
      certificate: item.certificate || 'No',
      totalGoldPrice: item.gold_cost_value || 0,
      
      // Section 3 - Stones
      stones: stonesData || [],
      totalStoneCost: item.stone_cost_value || 0,
      
      // Section 4 - Wastage and Making Charges
      wastagePercent: item.wastage_percent || 0,
      totalWastage: item.wastage_charges || 0,
      makingCharges: item.making_charges || 0,
      totalMakingCharges: item.making_charges || 0,
      totalCostValue: item.total_cost_value || 0
    });

    setShowEditForm(true);
  };

  // Calculation functions (from AddInventory)
  const calculateNetWeight = () => {
    const gross = parseFloat(editingData.grossWeight) || 0;
    const totalStoneWeight = editingData.stones.reduce((sum, stone) => {
      return sum + (parseFloat(stone.weight) || 0);
    }, 0);
    return Math.max(0, gross - totalStoneWeight);
  };

  const calculateTotalGoldPrice = () => {
    const netWeight = calculateNetWeight();
    const wastagePercent = parseFloat(editingData.wastagePercent) || 0;
    const wastageWeight = netWeight * (wastagePercent / 100);
    const totalGoldWeight = netWeight + wastageWeight; // Add wastage to net weight
    
    const rate = parseFloat(editingData.goldRate) || 0;
    const purityMultiplier = editingData.purity === '18KT' ? 0.75 : editingData.purity === '22KT' ? 0.916 : 1;
    return totalGoldWeight * rate * purityMultiplier;
  };

  const calculateTotalStoneCost = () => {
    return editingData.stones.reduce((sum, stone) => sum + (parseFloat(stone.stoneCost) || 0), 0);
  };

  const calculateTotalMakingCharges = () => {
    return parseFloat(editingData.makingCharges) || 0;
  };

  const calculateTotalCostValue = () => {
    return calculateTotalGoldPrice() + calculateTotalStoneCost() + calculateTotalMakingCharges();
  };

  // Stone management functions
  const handleAddStone = () => {
    if (!stoneForm.stoneCode || !stoneForm.weight || !stoneForm.rate) {
      alert('Please fill in all stone details');
      return;
    }

    const newStone = {
      ...stoneForm,
      weight: parseFloat(stoneForm.weight),
      rate: parseFloat(stoneForm.rate),
      stoneCost: parseFloat(stoneForm.weight) * parseFloat(stoneForm.rate)
    };

    if (editingStoneIndex !== null) {
      // Editing existing stone
      const updatedStones = [...editingData.stones];
      updatedStones[editingStoneIndex] = newStone;
      setEditingData(prev => ({ ...prev, stones: updatedStones }));
      setEditingStoneIndex(null);
    } else {
      // Adding new stone
      setEditingData(prev => ({ ...prev, stones: [...prev.stones, newStone] }));
    }

    // Reset form
    setStoneForm({
      stoneCode: '',
      stoneName: '',
      unit: 'gram',
      weight: '',
      rate: '',
      stoneCost: 0
    });
  };

  const handleRemoveStone = (index) => {
    const updatedStones = editingData.stones.filter((_, i) => i !== index);
    setEditingData(prev => ({ ...prev, stones: updatedStones }));
  };

  const handleEditStone = (index) => {
    const stone = editingData.stones[index];
    setStoneForm({
      stoneCode: stone.stoneCode || stone.stone_code || '',
      stoneName: stone.stoneName || stone.stone_name || '',
      unit: stone.unit || 'gram',
      weight: stone.weight || '',
      rate: stone.rate || '',
      stoneCost: stone.stoneCost || stone.stone_cost || 0
    });
    setEditingStoneIndex(index);
  };

  const handleStoneCodeChange = (stoneCode) => {
    const material = materials.find(m => m.code === stoneCode);
    setStoneForm(prev => ({
      ...prev,
      stoneCode,
      stoneName: material ? material.name : '',
      unit: material ? material.unit : 'gram',
      rate: material ? material.sale_price : ''
    }));
  };

  // Submit function for editing
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingData.itemCode.category || !editingData.grossWeight) {
      alert('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        id: editingData.id,
        date: editingData.date,
        code: `${editingData.itemCode.category}-${editingData.itemCode.number}`,
        vendor_id: editingData.vendor,
        description: editingData.description,
        gross_weight: parseFloat(editingData.grossWeight),
        gold_rate: parseFloat(editingData.goldRate),
        gold_purity: editingData.purity,
        certificate: editingData.certificate,
        stones: JSON.stringify(editingData.stones),
        wastage_percent: parseFloat(editingData.wastagePercent) || 0,
        making_charges: parseFloat(editingData.makingCharges) || 0,
        total_cost_value: calculateTotalCostValue()
      };

      const response = await fetch(`/api/inventory/${editingData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert('Item updated successfully!');
        if (onBack) {
          onBack();
        } else {
          setShowEditForm(false);
          loadInventoryData(); // Reload the data
        }
      } else {
        const errorData = await response.json();
        alert(`Error updating item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to parse stones
  const parseStones = (stonesData) => {
    if (!stonesData) return [];
    
    if (typeof stonesData === 'string') {
      try {
        return JSON.parse(stonesData);
      } catch (error) {
        console.error('Error parsing stones:', error);
        return [];
      }
    }
    
    return Array.isArray(stonesData) ? stonesData : [];
  };

  const handleViewItem = (item) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to archive "${item.code}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Item archived successfully!');
        loadInventoryData(); // Reload the data
      } else {
        const errorData = await response.json();
        alert(`Error archiving item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error archiving item:', error);
      alert('Error archiving item. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto pb-12">
      <PageIdentifier pageId={SCREEN_IDS?.INVENTORY?.EDIT_ITEM || 'INV-003'} pageName="Edit Inventory" />
      {/* If itemId is provided OR showEditForm is true, show edit form directly */}
      {itemId || showEditForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Jewelry Item</h2>
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  setShowEditForm(false);
                }
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-medium flex items-center"
            >
              <X size={20} className="mr-2" />
              Back
            </button>
          </div>
          
          {/* Full edit form */}
          <form onSubmit={handleSubmitEdit} className="space-y-6">
            {/* Form content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="mr-2 inline" size={20} />
                  Date
                </label>
                <input
                  type="date"
                  value={editingData.date}
                  onChange={(e) => setEditingData({ ...editingData, date: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Item Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Code</label>
                {editingData.id ? (
                  /* Read-only display when editing existing item */
                  <div className="flex space-x-2">
                    <div className="flex-1 p-3 border rounded-lg bg-gray-100 text-gray-700">
                      {editingData.itemCode.category}-{editingData.itemCode.number}
                    </div>
                    <div className="text-sm text-gray-500 p-3">
                      (Item code cannot be changed)
                    </div>
                  </div>
                ) : (
                  /* Editable when creating new item */
                  <div className="flex space-x-2">
                    <select
                      value={editingData.itemCode.category}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        itemCode: { ...editingData.itemCode, category: e.target.value }
                      })}
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.filter(cat => cat.type === 'jewelry').map(category => (
                        <option key={category.id} value={category.code}>
                          {category.name} ({category.code})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editingData.itemCode.number}
                      onChange={(e) => setEditingData({
                        ...editingData,
                        itemCode: { ...editingData.itemCode, number: parseInt(e.target.value) || 1 }
                      })}
                      className="w-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>
                )}
              </div>
              
              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <select
                  value={editingData.vendor}
                  onChange={(e) => setEditingData({ ...editingData, vendor: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                {/* Debug info */}
                <div className="text-xs text-gray-500 mt-1">
                  Debug: {vendors.length} vendors loaded, selected: {editingData.vendor}
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={editingData.description}
                  onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                  required
                />
              </div>
              
              {/* Gross Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gross Weight (grams)</label>
                <input
                  type="number"
                  step="0.001"
                  value={editingData.grossWeight}
                  onChange={(e) => setEditingData({ ...editingData, grossWeight: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter gross weight"
                  required
                />
              </div>
              
              {/* Gold Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gold Rate (per gram)</label>
                <input
                  type="number"
                  value={editingData.goldRate}
                  onChange={(e) => setEditingData({ ...editingData, goldRate: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter gold rate"
                  required
                />
              </div>
              
              {/* Purity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gold Purity</label>
                <select
                  value={editingData.purity}
                  onChange={(e) => setEditingData({ ...editingData, purity: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="18KT">18KT (75%)</option>
                  <option value="22KT">22KT (91.6%)</option>
                  <option value="24KT">24KT (99.9%)</option>
                </select>
              </div>
              
              {/* Certificate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certificate</label>
                <select
                  value={editingData.certificate}
                  onChange={(e) => setEditingData({ ...editingData, certificate: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="No">No Certificate</option>
                  <option value="Yes">Has Certificate</option>
                </select>
              </div>
              
              {/* Wastage Percent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wastage Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingData.wastagePercent}
                  onChange={(e) => setEditingData({ ...editingData, wastagePercent: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter wastage percentage"
                />
              </div>
              
              {/* Making Charges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Making Charges</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingData.makingCharges}
                  onChange={(e) => setEditingData({ ...editingData, makingCharges: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter making charges"
                />
              </div>
            </div>
            
            {/* Stones Section */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-4 flex items-center">
                <Package className="mr-2" size={20} />
                Gemstones & Materials
              </h4>
              
              {/* Display existing stones */}
              {editingData.stones && editingData.stones.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Current Stones:</h5>
                  <div className="space-y-2">
                    {editingData.stones.map((stone, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border flex justify-between items-center">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Code:</span>
                            <div>{stone.stoneCode || stone.stone_code || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Name:</span>
                            <div>{stone.stoneName || stone.stone_name || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Weight:</span>
                            <div>{stone.weight || 0} {stone.unit || 'g'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Rate:</span>
                            <div>₹{stone.rate || 0}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Cost:</span>
                            <div className="font-semibold">₹{stone.stoneCost || stone.stone_cost || (stone.weight * stone.rate) || 0}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            type="button"
                            onClick={() => handleEditStone(index)}
                            className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                            title="Edit Stone"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStone(index)}
                            className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                            title="Remove Stone"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right">
                    <span className="font-semibold">Total Stone Cost: ₹{calculateTotalStoneCost().toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              {/* Add/Edit Stone Form */}
              <div className="border-t pt-4">
                <h5 className="font-medium mb-3">
                  {editingStoneIndex !== null ? 'Edit Stone' : 'Add New Stone'}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stone Code</label>
                    <select
                      value={stoneForm.stoneCode}
                      onChange={(e) => handleStoneCodeChange(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Stone</option>
                      {materials.filter(m => (m.type === 'stone' || m.category === 'stone')).map(material => (
                        <option key={material.id} value={material.code}>
                          {material.name} ({material.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stone Name</label>
                    <input
                      type="text"
                      value={stoneForm.stoneName}
                      onChange={(e) => setStoneForm({ ...stoneForm, stoneName: e.target.value })}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Stone name"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <input
                      type="number"
                      step="0.001"
                      value={stoneForm.weight}
                      onChange={(e) => {
                        const weight = parseFloat(e.target.value) || 0;
                        const rate = parseFloat(stoneForm.rate) || 0;
                        setStoneForm({ 
                          ...stoneForm, 
                          weight: e.target.value,
                          stoneCost: weight * rate
                        });
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Weight"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={stoneForm.rate}
                      onChange={(e) => {
                        const rate = parseFloat(e.target.value) || 0;
                        const weight = parseFloat(stoneForm.weight) || 0;
                        setStoneForm({ 
                          ...stoneForm, 
                          rate: e.target.value,
                          stoneCost: weight * rate
                        });
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Rate per unit"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                    <input
                      type="number"
                      value={stoneForm.stoneCost}
                      className="w-full p-2 border rounded bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={handleAddStone}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    {editingStoneIndex !== null ? 'Update Stone' : 'Add Stone'}
                  </button>
                  {editingStoneIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStoneIndex(null);
                        setStoneForm({
                          stoneCode: '',
                          stoneName: '',
                          unit: 'gram',
                          weight: '',
                          rate: '',
                          stoneCost: 0
                        });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Calculations Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Calculations</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Net Weight:</span>
                  <div className="font-semibold">{calculateNetWeight().toFixed(3)} g</div>
                </div>
                <div>
                  <span className="text-gray-600">Gold Price:</span>
                  <div className="font-semibold">₹{calculateTotalGoldPrice().toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Stone Cost:</span>
                  <div className="font-semibold">₹{calculateTotalStoneCost().toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Value:</span>
                  <div className="font-semibold text-lg">₹{calculateTotalCostValue().toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onBack ? onBack() : setShowEditForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center disabled:opacity-50"
              >
                <Save size={20} className="mr-2" />
                {saving ? 'Saving...' : 'Update Item'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Edit Inventory</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Search className="mr-2" size={20} />
              Search Jewelry to Edit
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by jewelry name, code, or category..."
                />
              </div>
              <div className="text-sm text-gray-600">
                <Search size={20} />
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((jewelry) => (
                      <tr key={jewelry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {jewelry.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {jewelry.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {jewelry.gross_weight}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{jewelry.total_cost_value?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            jewelry.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                            jewelry.status === 'Sold' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {jewelry.status || 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewItem(jewelry)}
                              className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-200"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleEditItem(jewelry)}
                                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
                                title="Edit Item"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteItem(jewelry)}
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-200"
                                title="Archive Item"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        </>
      )}

      {/* View Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <PageIdentifier pageId="INV-004" pageName="View Item Details" isModal={true} />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Item Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Code:</span> {viewingItem.code}</div>
                  <div><span className="font-medium">Description:</span> {viewingItem.description}</div>
                  <div><span className="font-medium">Gross Weight:</span> {viewingItem.gross_weight}g</div>
                  <div><span className="font-medium">Status:</span> {viewingItem.status}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pricing Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Gold Rate:</span> ₹{viewingItem.gold_rate}</div>
                  <div><span className="font-medium">Gold Purity:</span> {viewingItem.gold_purity}</div>
                  <div><span className="font-medium">Total Value:</span> ₹{viewingItem.total_cost_value?.toFixed(2)}</div>
                </div>
              </div>
            </div>
            {/* Stones Details Section */}
            {viewingItem.stones && viewingItem.stones.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Stones Details</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewingItem.stones.map((stone, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{stone.stone_code || stone.stoneCode || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{stone.stone_name || stone.stoneName || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{stone.weight || 0}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">₹{parseFloat(stone.sale_price || stone.rate || 0).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2 text-sm text-green-600 font-medium">₹{((parseFloat(stone.weight || 0) * parseFloat(stone.sale_price || stone.rate || 0)) || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditInventory;
