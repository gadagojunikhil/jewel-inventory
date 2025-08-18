import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, Edit2, Trash2, Search, Filter, Download, 
  ChevronLeft, ChevronRight, Package, DollarSign,
  AlertCircle, X, ChevronDown, ChevronUp, Gem,
  FileText, Copy, Printer
} from 'lucide-react';

const ViewInventory = () => {
  // State management
  const [jewelryPieces, setJewelryPieces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortField, setSortField] = useState('createdDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Calculate total cost for an item (moved to top to avoid hoisting issues)
  const calculateTotalCost = (item) => {
    if (!item) return 0;
    const materialsCost = item.materials?.reduce((sum, mat) => sum + (mat.totalCost || 0), 0) || 0;
    return materialsCost + (item.laborCost || 0) + (item.otherCosts || 0);
  };

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
      // Set default data if localStorage is corrupted
      setJewelryPieces([]);
      setCategories([]);
    }
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    try {
      const total = jewelryPieces.length;
      const inStock = jewelryPieces.filter(item => item.status === 'In Stock').length;
      const sold = jewelryPieces.filter(item => item.status === 'Sold').length;
      const totalValue = jewelryPieces
        .filter(item => item.status === 'In Stock')
        .reduce((sum, item) => sum + (item.salePrice || 0), 0);
      const totalCost = jewelryPieces
        .filter(item => item.status === 'In Stock')
        .reduce((sum, item) => sum + (item.totalCost || calculateTotalCost(item)), 0);
      
      return {
        total,
        inStock,
        sold,
        totalValue,
        totalCost,
        profit: totalValue - totalCost
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        total: 0,
        inStock: 0,
        sold: 0,
        totalValue: 0,
        totalCost: 0,
        profit: 0
      };
    }
  }, [jewelryPieces]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    try {
      let filtered = [...jewelryPieces];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Category filter
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.category === selectedCategory);
      }

      // Status filter
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(item => item.status === selectedStatus);
      }

      // Price range filter
      if (priceRange.min) {
        filtered = filtered.filter(item => (item.salePrice || 0) >= parseFloat(priceRange.min || 0));
      }
      if (priceRange.max) {
        filtered = filtered.filter(item => (item.salePrice || 0) <= parseFloat(priceRange.max || 0));
      }

      // Date range filter
      if (dateRange.start) {
        filtered = filtered.filter(item => 
          item.createdDate && new Date(item.createdDate) >= new Date(dateRange.start)
        );
      }
      if (dateRange.end) {
        filtered = filtered.filter(item => 
          item.createdDate && new Date(item.createdDate) <= new Date(dateRange.end)
        );
      }

      // Sort
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'salePrice' || sortField === 'totalCost') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }
        
        if (sortField === 'createdDate') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    } catch (error) {
      console.error('Error filtering and sorting items:', error);
      return [];
    }
  }, [jewelryPieces, searchTerm, selectedCategory, selectedStatus, sortField, sortDirection, priceRange, dateRange]);

  // Pagination
  const paginatedItems = useMemo(() => {
    try {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
    } catch (error) {
      console.error('Error paginating items:', error);
      return [];
    }
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle item selection
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedItems.map(item => item.id));
    }
  };

  // View item details
  const viewItemDetails = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  // Delete item
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const deleteItem = () => {
    const updatedItems = jewelryPieces.filter(item => item.id !== itemToDelete.id);
    setJewelryPieces(updatedItems);
    localStorage.setItem('jewelryPieces', JSON.stringify(updatedItems));
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Bulk delete
  const bulkDelete = () => {
    const updatedItems = jewelryPieces.filter(item => !selectedItems.includes(item.id));
    setJewelryPieces(updatedItems);
    localStorage.setItem('jewelryPieces', JSON.stringify(updatedItems));
    setSelectedItems([]);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Item Code', 'Name', 'Category', 'Total Cost', 'Sale Price', 'Status', 'Created Date'];
    const data = filteredAndSortedItems.map(item => [
      item.code,
      item.name,
      item.category,
      calculateTotalCost(item).toFixed(2),
      item.salePrice?.toFixed(2),
      item.status,
      new Date(item.createdDate).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jewelry_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Duplicate item
  const duplicateItem = (item) => {
    const newItem = {
      ...item,
      id: Math.max(...jewelryPieces.map(j => j.id)) + 1,
      code: `${item.code}-COPY`,
      name: `${item.name} (Copy)`,
      createdDate: new Date().toISOString()
    };
    const updatedItems = [...jewelryPieces, newItem];
    setJewelryPieces(updatedItems);
    localStorage.setItem('jewelryPieces', JSON.stringify(updatedItems));
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setPriceRange({ min: '', max: '' });
    setDateRange({ start: '', end: '' });
  };

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="inline ml-1" size={16} /> : 
      <ChevronDown className="inline ml-1" size={16} />;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Jewelry Inventory</h2>
        <p className="text-gray-600">Manage and view all jewelry items in your inventory</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Items</p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{statistics.inStock}</p>
            </div>
            <Gem className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-xl font-bold">${statistics.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="text-yellow-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Cost</p>
              <p className="text-xl font-bold">${statistics.totalCost.toLocaleString()}</p>
            </div>
            <FileText className="text-purple-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Profit Margin</p>
              <p className="text-xl font-bold text-green-600">
                ${statistics.profit.toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters and Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, code, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter size={20} />
            Advanced Filters
          </button>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="999999"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="lg:col-span-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <span className="text-yellow-800">
            {selectedItems.length} item(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={bulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('code')}
                >
                  Item Code <SortIndicator field="code" />
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Name <SortIndicator field="name" />
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  Category <SortIndicator field="category" />
                </th>
                <th 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('salePrice')}
                >
                  Sale Price <SortIndicator field="salePrice" />
                </th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    <Package className="mx-auto mb-4 text-gray-300" size={48} />
                    <p>No items found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{item.code}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${item.salePrice?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                        item.status === 'Sold' ? 'bg-red-100 text-red-800' :
                        item.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => viewItemDetails(item)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => duplicateItem(item)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Duplicate"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(item)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of{' '}
                {filteredAndSortedItems.length} items
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft size={18} />
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === pageNum 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Item Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Item Code</label>
                    <p className="font-medium">{selectedItem.code}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <p className="font-medium">{selectedItem.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Category</label>
                    <p className="font-medium">{selectedItem.category}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      selectedItem.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                      selectedItem.status === 'Sold' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Materials */}
              {selectedItem.materials && selectedItem.materials.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">Materials Used</h4>
                  <table className="w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left border">Material</th>
                        <th className="px-4 py-2 text-right border">Quantity</th>
                        <th className="px-4 py-2 text-right border">Unit</th>
                        <th className="px-4 py-2 text-right border">Cost/Unit</th>
                        <th className="px-4 py-2 text-right border">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.materials.map((material, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 border">{material.materialName}</td>
                          <td className="px-4 py-2 text-right border">{material.quantity}</td>
                          <td className="px-4 py-2 text-right border">{material.unit}</td>
                          <td className="px-4 py-2 text-right border">${material.costPerUnit}</td>
                          <td className="px-4 py-2 text-right border">${material.totalCost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pricing Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Pricing Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Materials Cost</label>
                    <p className="font-medium">
                      ${selectedItem.materials?.reduce((sum, m) => sum + (m.totalCost || 0), 0).toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Labor Cost</label>
                    <p className="font-medium">${selectedItem.laborCost?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Other Costs</label>
                    <p className="font-medium">${selectedItem.otherCosts?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Total Cost</label>
                    <p className="font-medium text-red-600">
                      ${calculateTotalCost(selectedItem).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Sale Price</label>
                    <p className="font-medium text-green-600 text-xl">
                      ${selectedItem.salePrice?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Profit Margin</label>
                    <p className="font-medium text-blue-600">
                      ${(selectedItem.salePrice - calculateTotalCost(selectedItem)).toFixed(2)} 
                      ({((selectedItem.salePrice - calculateTotalCost(selectedItem)) / selectedItem.salePrice * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Additional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Created Date</label>
                    <p className="font-medium">
                      {new Date(selectedItem.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Created Time</label>
                    <p className="font-medium">
                      {new Date(selectedItem.createdDate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    // Print functionality
                    window.print();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print
                </button>
                <button
                  onClick={() => duplicateItem(selectedItem)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Copy size={18} />
                  Duplicate
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete.name}" ({itemToDelete.code})? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={deleteItem}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewInventory;