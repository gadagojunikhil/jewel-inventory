import React, { useState } from 'react';
import { Search, Edit2, Trash2, Package } from 'lucide-react';

const EditInventory = ({ jewelryPieces, setJewelryPieces, materials, jewelryCategories }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

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

  const showEditConfirmation = (jewelry) => {
    setConfirmAction({
      type: 'edit',
      data: jewelry,
      message: `Are you sure you want to edit "${jewelry.name}" (${jewelry.code})?`,
      onConfirm: () => {
        console.log('Edit jewelry:', jewelry);
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
        setSearchResults(prev => prev.filter(j => j.id !== jewelry.id));
      }
    });
    setShowConfirmDialog(true);
  };

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
            <Search size={20} />
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

      {/* Confirmation Dialog */}
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