import React, { useState, useEffect } from 'react';
import { Search, Package, DollarSign } from 'lucide-react';

const ViewInventory = () => {
  const [jewelryPieces, setJewelryPieces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load data from localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedJewelry = localStorage.getItem('jewelryPieces');
      const savedCategories = localStorage.getItem('jewelryCategories');
      
      if (savedJewelry) {
        setJewelryPieces(JSON.parse(savedJewelry));
      }
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setJewelryPieces([]);
      setCategories([]);
    }
  };

  // Filter items
  const filteredItems = jewelryPieces.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Inventory Management</h1>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-lg font-semibold text-gray-900">{jewelryPieces.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Stock</p>
                <p className="text-lg font-semibold text-gray-900">
                  {jewelryPieces.filter(item => item.status === 'In Stock').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Sold</p>
                <p className="text-lg font-semibold text-gray-900">
                  {jewelryPieces.filter(item => item.status === 'Sold').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${jewelryPieces.filter(item => item.status === 'In Stock').reduce((sum, item) => sum + (item.salePrice || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, code, or category..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="min-w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sale Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No jewelry items found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.code || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(item.salePrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'In Stock' 
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'Sold'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {filteredItems.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {filteredItems.length} of {jewelryPieces.length} items
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInventory;
