import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package, ChevronDown, ChevronRight, Gem, Award } from 'lucide-react';

const CategoryManagement = ({
  jewelryCategories,
  setJewelryCategories
}) => {
  const [showCreateNewMaterial, setShowCreateNewMaterial] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [categoryType, setCategoryType] = useState('parent'); // 'parent' or 'child'
  const [newCategory, setNewCategory] = useState({
    name: '',
    code: '',
    description: '',
    wastageCharges: 0,
    makingCharges: 0,
    parentId: null,
    type: 'parent' // 'parent' or 'child'
  });
  const [editingCategory, setEditingCategory] = useState({
    name: '',
    code: '',
    description: '',
    wastageCharges: 0,
    makingCharges: 0,
    parentId: null,
    type: 'parent'
  });

  // Get parent categories (Material Types)
  const getParentCategories = () => {
    return jewelryCategories.filter(cat => cat.type === 'parent' || !cat.parentId);
  };

  // Get child categories for a specific parent
  const getChildCategories = (parentId) => {
    return jewelryCategories.filter(cat => cat.parentId === parentId);
  };

  // Toggle expansion of parent category
  const toggleExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    // For parent categories, only name is required
    // For child categories, both name and code are required
    const isValid = categoryType === 'parent'
      ? newCategory.name
      : newCategory.name && newCategory.code;

    if (isValid) {
      // Check if code already exists (only for child categories)
      if (categoryType === 'child' && newCategory.code) {
        const codeExists = jewelryCategories.some(cat =>
          cat.code && cat.code.toLowerCase() === newCategory.code.toLowerCase()
        );

        if (codeExists) {
          alert('Category code already exists. Please use a different code.');
          return;
        }
      }

      const newId = Math.max(...jewelryCategories.map(c => c.id), 0) + 1;
      const categoryToAdd = {
        ...newCategory,
        id: newId,
        type: categoryType,
        parentId: categoryType === 'child' ? newCategory.parentId : null,
        code: categoryType === 'parent' ? null : newCategory.code // No code for parents
      };
      setJewelryCategories(prev => [...prev, categoryToAdd]);
      setNewCategory({
        name: '',
        code: '',
        description: '',
        wastageCharges: 0,
        makingCharges: 0,
        parentId: null,
        type: 'parent'
      });
      setCategoryType('parent');
      setShowAddCategoryForm(false);
    }
  };

  const handleCreateNewMaterial = () => {
    if (newMaterialName.trim()) {
      const newId = Math.max(...jewelryCategories.map(c => c.id), 0) + 1;
      const newMaterial = {
        id: newId,
        name: newMaterialName.trim(),
        code: null,
        description: '',
        wastageCharges: 0,
        makingCharges: 0,
        parentId: null,
        type: 'parent'
      };

      setJewelryCategories(prev => [...prev, newMaterial]);
      setNewCategory(prev => ({ ...prev, parentId: newId }));
      setNewMaterialName('');
      setShowCreateNewMaterial(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategory({ ...category });
  };

  const handleSaveEdit = () => {
    const isValid = editingCategory.type === 'parent'
      ? editingCategory.name
      : editingCategory.name && editingCategory.code;

    if (isValid) {
      // Check if code already exists (only for child categories, excluding current category)
      if (editingCategory.type === 'child' && editingCategory.code) {
        const codeExists = jewelryCategories.some(cat =>
          cat.id !== editingCategoryId &&
          cat.code &&
          cat.code.toLowerCase() === editingCategory.code.toLowerCase()
        );

        if (codeExists) {
          alert('Category code already exists. Please use a different code.');
          return;
        }
      }

      setJewelryCategories(prev =>
        prev.map(cat =>
          cat.id === editingCategoryId
            ? {
              ...editingCategory,
              id: editingCategoryId,
              code: editingCategory.type === 'parent' ? null : editingCategory.code
            }
            : cat
        )
      );
      setEditingCategoryId(null);
      setEditingCategory({
        name: '',
        code: '',
        description: '',
        wastageCharges: 0,
        makingCharges: 0,
        parentId: null,
        type: 'parent'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategory({
      name: '',
      code: '',
      description: '',
      wastageCharges: 0,
      makingCharges: 0,
      parentId: null,
      type: 'parent'
    });
  };

  const handleDeleteCategory = (id) => {
    const category = jewelryCategories.find(cat => cat.id === id);

    // Check if it's a parent with children
    if (category.type === 'parent' || !category.parentId) {
      const childrenCount = getChildCategories(id).length;
      if (childrenCount > 0) {
        alert(`Cannot delete "${category.name}" because it has ${childrenCount} sub-categories. Please remove or reassign the sub-categories first.`);
        return;
      }
    }

    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      setJewelryCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const renderCategoryRow = (category, level = 0) => {
    const isEditing = editingCategoryId === category.id;
    const children = getChildCategories(category.id);
    const isExpanded = expandedCategories.has(category.id);
    const isParent = category.type === 'parent' || !category.parentId;

    return (
      <React.Fragment key={category.id}>
        <tr className={`hover:bg-gray-50 ${level > 0 ? 'bg-blue-50' : ''}`}>
          <td className="px-6 py-4">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {isParent && children.length > 0 && (
                <button
                  onClick={() => toggleExpansion(category.id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              {isParent ? <Gem className="mr-2 text-blue-500" size={16} /> : <Award className="mr-2 text-green-500" size={16} />}
              {isEditing ? (
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Category name"
                />
              ) : (
                <span className={`font-medium ${isParent ? 'text-blue-800' : 'text-green-800'}`}>
                  {category.name}
                </span>
              )}
            </div>
          </td>
          <td className="px-6 py-4">
            {isEditing ? (
              // Only show code input for child categories
              editingCategory.type === 'child' || editingCategory.parentId ? (
                <input
                  type="text"
                  value={editingCategory.code || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="CODE"
                  maxLength="10"
                />
              ) : (
                <span className="text-gray-400 italic text-sm">No code needed</span>
              )
            ) : (
              // Display code only for child categories
              (category.type === 'child' || category.parentId) && category.code ? (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {category.code}
                </code>
              ) : (
                <span className="text-gray-400 italic text-sm">—</span>
              )
            )}
          </td>
          <td className="px-6 py-4">
            {isEditing ? (
              <input
                type="text"
                value={editingCategory.description}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Description"
              />
            ) : (
              <span className="text-gray-600">{category.description}</span>
            )}
          </td>
          <td className="px-6 py-4">
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editingCategory.wastageCharges || 0}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, wastageCharges: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            ) : (
              <span className="text-orange-600 font-medium">
                {(category.wastageCharges || 0).toFixed(2)}%
              </span>
            )}
          </td>
          <td className="px-6 py-4">
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                min="0"
                value={editingCategory.makingCharges || 0}
                onChange={(e) => setEditingCategory(prev => ({ ...prev, makingCharges: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            ) : (
              <span className="text-green-600 font-medium">
                ₹{(category.makingCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </td>
          <td className="px-6 py-4">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editingCategory.name || !editingCategory.code}
                  className={`p-2 rounded ${editingCategory.name && editingCategory.code
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
                  onClick={() => handleEditCategory(category)}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  title="Edit category"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  title="Delete category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </td>
        </tr>
        {/* Render children if expanded */}
        {isParent && isExpanded && children.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const parentCategories = getParentCategories();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setCategoryType('child');
              setShowAddCategoryForm(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
          >
            <Award size={20} />
            <span>Add Jewelry Type</span>
          </button>
          <button
            onClick={() => {
              setCategoryType('parent');
              setShowAddCategoryForm(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Material Type</span>
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddCategoryForm && (
        <div className="mb-6 bg-blue-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {categoryType === 'parent' ? 'Add New Material Type' : 'Add New Jewelry Type'}
          </h3>

          {/* Category Type Display */}
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <div className="flex items-center">
              {categoryType === 'parent' ? (
                <>
                  <Gem className="mr-2 text-blue-500" size={20} />
                  <span className="font-medium text-blue-700">Creating Material Type</span>
                  <span className="ml-2 text-sm text-gray-600">(e.g., Diamond, Gold, Kundan)</span>
                </>
              ) : (
                <>
                  <Award className="mr-2 text-green-500" size={20} />
                  <span className="font-medium text-green-700">Creating Jewelry Type</span>
                  <span className="ml-2 text-sm text-gray-600">(e.g., Necklace, Ring, Earring)</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Parent Selection for Child Categories */}
            {categoryType === 'child' && (
              <div>
                <label className="block text-sm font-medium mb-1">Parent Material *</label>
                <div className="space-y-2">
                  <select
                    value={newCategory.parentId || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, parentId: parseInt(e.target.value) || null }))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Parent Material</option>
                    {parentCategories.map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                  </select>

                  {/* Quick Create New Material Option */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateNewMaterial(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Plus size={14} className="mr-1" />
                      Create new material type
                    </button>
                  </div>

                  {/* Inline Create New Material */}
                  {showCreateNewMaterial && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <label className="block text-sm font-medium mb-1 text-yellow-800">
                        New Material Type Name
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMaterialName}
                          onChange={(e) => setNewMaterialName(e.target.value)}
                          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-yellow-500"
                          placeholder="e.g., Silver, Platinum"
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateNewMaterial()}
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewMaterial}
                          disabled={!newMaterialName.trim()}
                          className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-300"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateNewMaterial(false);
                            setNewMaterialName('');
                          }}
                          className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                {categoryType === 'parent' ? 'Material Name *' : 'Jewelry Type *'}
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder={categoryType === 'parent' ? 'e.g., Diamond, Gold' : 'e.g., Necklace, Ring'}
              />
            </div>

            {/* Only show code field for child categories */}
            {categoryType === 'child' && (
              <div>
                <label className="block text-sm font-medium mb-1">Category Code *</label>
                <input
                  type="text"
                  value={newCategory.code}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., DIA-N"
                  maxLength="10"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Category description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Wastage Charges (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={newCategory.wastageCharges}
                onChange={(e) => setNewCategory(prev => ({ ...prev, wastageCharges: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Making Charges (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newCategory.makingCharges}
                onChange={(e) => setNewCategory(prev => ({ ...prev, makingCharges: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.name || (categoryType === 'child' && (!newCategory.code || !newCategory.parentId))}
              className={`px-4 py-2 rounded font-medium flex items-center space-x-1 ${newCategory.name && (categoryType === 'parent' || (newCategory.code && newCategory.parentId))
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <Save size={16} />
              <span>
                {categoryType === 'parent' ? 'Add Material Type' : 'Add Jewelry Type'}
              </span>
            </button>
            <button
              onClick={() => {
                setShowAddCategoryForm(false);
                setNewCategory({
                  name: '',
                  code: '',
                  description: '',
                  wastageCharges: 0,
                  makingCharges: 0,
                  parentId: null,
                  type: 'parent'
                });
                setCategoryType('parent');
                setShowCreateNewMaterial(false);
                setNewMaterialName('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center space-x-1"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Category Hierarchy</h3>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Gem className="mr-1 text-blue-500" size={16} />
                <span>Material Types</span>
              </div>
              <div className="flex items-center">
                <Award className="mr-1 text-green-500" size={16} />
                <span>Jewelry Types</span>
              </div>
              <div className="text-gray-600">
                Click <Award size={14} className="inline mx-1" /> above to add jewelry types quickly
              </div>
            </div>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wastage (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Making (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parentCategories.map(category => renderCategoryRow(category))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Material Types</p>
              <p className="text-2xl font-bold text-blue-700">{parentCategories.length}</p>
            </div>
            <Gem className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Jewelry Types</p>
              <p className="text-2xl font-bold text-green-700">
                {jewelryCategories.filter(cat => cat.type === 'child' || cat.parentId).length}
              </p>
            </div>
            <Award className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Avg Wastage</p>
              <p className="text-2xl font-bold text-orange-700">
                {jewelryCategories.length > 0
                  ? (jewelryCategories.reduce((sum, cat) => sum + (cat.wastageCharges || 0), 0) / jewelryCategories.length).toFixed(1)
                  : 0
                }%
              </p>
            </div>
            <Package className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Categories</p>
              <p className="text-2xl font-bold text-purple-700">
                {jewelryCategories.length}
              </p>
            </div>
            <Package className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">Hierarchical Category Guide:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• <strong>Quick Add:</strong> Use "Add Jewelry Type" button for faster workflow - most common operation</p>
          <p>• <strong>Create Material On-the-fly:</strong> When adding jewelry types, create new material types instantly if needed</p>
          <p>• <strong>Material Types:</strong> Diamond, Gold, Kundan, etc. - No codes needed, used for grouping</p>
          <p>• <strong>Jewelry Types:</strong> Necklace, Ring, Earring, etc. - Require unique codes for identification</p>
          <p>• <strong>Expand/Collapse:</strong> Click the arrow to expand parent categories and see their jewelry types</p>
          <p>• <strong>Code Format:</strong> Only jewelry types need codes like DIA-N (Diamond Necklace), GOLD-R (Gold Ring)</p>
          <p>• <strong>Charges:</strong> Set material-specific wastage and making charges for accurate pricing</p>
          <p>• <strong>Delete Protection:</strong> Cannot delete parent categories that have subcategories</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;