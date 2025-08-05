import React, { useState } from 'react';
import { Plus, Save, X, Gem, Trash2 } from 'lucide-react';

const AddInventory = ({ jewelryPieces, setJewelryPieces, materials, jewelryCategories }) => {
  const [showAddJewelryForm, setShowAddJewelryForm] = useState(false);
  const [newJewelry, setNewJewelry] = useState({
    name: '',
    code: '',
    category: jewelryCategories[0]?.name || 'Necklace',
    materials: [],
    laborCost: 0,
    otherCosts: 0,
    salePrice: 0,
    status: 'In Stock'
  });

  const statusOptions = ['In Stock', 'Sold', 'On Hold', 'Custom Order'];

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
        category: jewelryCategories[0]?.name || 'Necklace',
        materials: [],
        laborCost: 0,
        otherCosts: 0,
        salePrice: 0,
        status: 'In Stock'
      });
      setShowAddJewelryForm(false);
    }
  };

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

      {/* Add Jewelry Form Modal */}
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
    </div>
  );
};