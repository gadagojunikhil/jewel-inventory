import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Gem, Search } from 'lucide-react';

const MaterialManagement = ({ materials, setMaterials }) => {
  const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newMaterial, setNewMaterial] = useState({
    category: 'Diamond',
    name: '',
    code: '',
    costPrice: 0,
    salePrice: 0,
    unit: 'each'
  });
  const [editingMaterial, setEditingMaterial] = useState({
    category: 'Diamond',
    name: '',
    code: '',
    costPrice: 0,
    salePrice: 0,
    unit: 'each'
  });

  const categories = ['Diamond', 'Stone', 'Gold', 'Silver', 'Platinum', 'Other'];
  const units = ['each', 'gram', 'carat', 'piece', 'ounce', 'kilogram'];

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.code) {
      // Check if code already exists
      const codeExists = materials.some(material => 
        material.code.toLowerCase() === newMaterial.code.toLowerCase()
      );
      
      if (codeExists) {
        alert('Material code already exists. Please use a different code.');
        return;
      }

      const newId = Math.max(...materials.map(m => m.id), 0) + 1;
      const materialToAdd = { 
        ...newMaterial, 
        id: newId,
        createdDate: new Date().toISOString()
      };
      setMaterials(prev => [...prev, materialToAdd]);
      setNewMaterial({
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

  const handleEditMaterial = (material) => {
    setEditingMaterialId(material.id);
    setEditingMaterial({ ...material });
  };

  const handleSaveEdit = () => {
    if (editingMaterial.name && editingMaterial.code) {
      // Check if code already exists (excluding current material)
      const codeExists = materials.some(material => 
        material.id !== editingMaterialId && 
        material.code.toLowerCase() === editingMaterial.code.toLowerCase()
      );
      
      if (codeExists) {
        alert('Material code already exists. Please use a different code.');
        return;
      }

      setMaterials(prev => 
        prev.map(material => 
          material.id === editingMaterialId 
            ? { ...editingMaterial, id: editingMaterialId, updatedDate: new Date().toISOString() }
            : material
        )
      );
      setEditingMaterialId(null);
      setEditingMaterial({
        category: 'Diamond',
        name: '',
        code: '',
        costPrice: 0,
        salePrice: 0,
        unit: 'each'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingMaterialId(null);
    setEditingMaterial({
      category: 'Diamond',
      name: '',
      code: '',
      costPrice: 0,
      salePrice: 0,
      unit: 'each'
    });
  };

  const handleDeleteMaterial = (id) => {
    const material = materials.find(m => m.id === id);
    
    if (window.confirm(`Are you sure you want to delete material "${material.name}" (${material.code})?`)) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  const getFilteredMaterials = () => {
    let filtered = materials;
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Diamond': return 'bg-blue-100 text-blue-800';
      case 'Stone': return 'bg-green-100 text-green-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMarkup = (costPrice, salePrice) => {
    return costPrice > 0 ? ((salePrice - costPrice) / costPrice * 100) : 0;
  };

  const filteredMaterials = getFilteredMaterials();

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

      {/* Search and Filter Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Search Materials</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name, code, or category..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredMaterials.length} of {materials.length} materials</span>
          {(searchQuery || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Add Material Form */}
      {showAddMaterialForm && (
        <div className="mb-6 bg-blue-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Add New Material</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={newMaterial.category}
                onChange={(e) => setNewMaterial(prev => ({...prev, category: e.target.value}))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial(prev => ({...prev, name: e.target.value}))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Material name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                value={newMaterial.code}
                onChange={(e) => setNewMaterial(prev => ({...prev, code: e.target.value.toUpperCase()}))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="CODE"
                maxLength="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newMaterial.costPrice}
                onChange={(e) => setNewMaterial(prev => ({...prev, costPrice: parseFloat(e.target.value) || 0}))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newMaterial.salePrice}
                onChange={(e) => setNewMaterial(prev => ({...prev, salePrice: parseFloat(e.target.value) || 0}))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial(prev => ({...prev, unit: e.target.value}))}
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
              onClick={handleAddMaterial}
              disabled={!newMaterial.name || !newMaterial.code}
              className={`px-4 py-2 rounded font-medium flex items-center space-x-1 ${
                newMaterial.name && newMaterial.code
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={16} />
              <span>Add Material</span>
            </button>
            <button
              onClick={() => {
                setShowAddMaterialForm(false);
                setNewMaterial({
                  category: 'Diamond',
                  name: '',
                  code: '',
                  costPrice: 0,
                  salePrice: 0,
                  unit: 'each'
                });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center space-x-1"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Materials Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Price (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Markup</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMaterials.map(material => {
              const isEditing = editingMaterialId === material.id;
              const markup = calculateMarkup(material.costPrice, material.salePrice);
              
              return (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <select
                        value={editingMaterial.category}
                        onChange={(e) => setEditingMaterial(prev => ({...prev, category: e.target.value}))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(material.category)}`}>
                        {material.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingMaterial.name}
                        onChange={(e) => setEditingMaterial(prev => ({...prev, name: e.target.value}))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Material name"
                      />
                    ) : (
                      <span className="font-medium">{material.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingMaterial.code}
                        onChange={(e) => setEditingMaterial(prev => ({...prev, code: e.target.value.toUpperCase()}))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="CODE"
                        maxLength="10"
                      />
                    ) : (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {material.code}
                      </code>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingMaterial.costPrice}
                        onChange={(e) => setEditingMaterial(prev => ({...prev, costPrice: parseFloat(e.target.value) || 0}))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span>₹{material.costPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingMaterial.salePrice}
                        onChange={(e) => setEditingMaterial(prev => ({...prev, salePrice: parseFloat(e.target.value) || 0}))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-green-600 font-semibold">₹{material.salePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${markup >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {markup.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <select
                        value={editingMaterial.unit}
                        onChange={(e) => setEditingMaterial(prev => ({...prev, unit: e.target.value}))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{material.unit}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editingMaterial.name || !editingMaterial.code}
                          className={`p-2 rounded ${
                            editingMaterial.name && editingMaterial.code
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title="Save changes"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                          title="Cancel editing"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMaterial(material)}
                          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                          title="Edit material"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                          title="Delete material"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredMaterials.length === 0 && (
          <div className="text-center py-8">
            <Gem className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Materials Found</h3>
            <p className="text-gray-500">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first material'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Materials</p>
              <p className="text-2xl font-bold text-blue-700">{materials.length}</p>
            </div>
            <Gem className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Avg Markup</p>
              <p className="text-2xl font-bold text-green-700">
                {materials.length > 0 
                  ? (materials.reduce((sum, m) => sum + calculateMarkup(m.costPrice, m.salePrice), 0) / materials.length).toFixed(0)
                  : 0
                }%
              </p>
            </div>
            <Gem className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold text-yellow-700">
                ₹{materials.reduce((sum, m) => sum + m.salePrice, 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <Gem className="text-yellow-500" size={32} />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Categories</p>
              <p className="text-2xl font-bold text-purple-700">
                {new Set(materials.map(m => m.category)).size}
              </p>
            </div>
            <Gem className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">Material Management Guide:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• <strong>Search:</strong> Use the search bar to find materials by name, code, or category</p>
          <p>• <strong>Markup:</strong> Automatically calculated as (Sale Price - Cost Price) / Cost Price × 100</p>
          <p>• <strong>Codes:</strong> Must be unique and are automatically converted to uppercase</p>
          <p>• <strong>Units:</strong> Choose appropriate units for each material type (each, gram, carat, etc.)</p>
          <p>• <strong>Categories:</strong> Use consistent categories for better organization and filtering</p>
          <p>• <strong>Pricing:</strong> All prices are in Indian Rupees (₹)</p>
        </div>
      </div>
    </div>
  );
};

export default MaterialManagement;