import React, { useState, useEffect } from 'react';
import api from '../../services/api';


const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [newVendor, setNewVendor] = useState({ name: '', contact: '', email: '' });
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [editingVendor, setEditingVendor] = useState({ name: '', contact: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await api.getVendors();
      setVendors(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch vendors');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setNewVendor({ ...newVendor, [e.target.name]: e.target.value });
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createVendor(newVendor);
      setNewVendor({ name: '', contact: '', email: '' });
      await fetchVendors();
      setError('');
    } catch (err) {
      setError('Failed to add vendor');
    }
    setLoading(false);
  };

  const handleEditClick = (vendor) => {
    setEditingVendorId(vendor.id);
    setEditingVendor({ name: vendor.name, contact: vendor.contact, email: vendor.email });
  };

  const handleEditChange = (e) => {
    setEditingVendor({ ...editingVendor, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (id) => {
    setLoading(true);
    try {
      await api.updateVendor(id, editingVendor);
      setEditingVendorId(null);
      setEditingVendor({ name: '', contact: '', email: '' });
      await fetchVendors();
      setError('');
    } catch (err) {
      setError('Failed to update vendor');
    }
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setEditingVendorId(null);
    setEditingVendor({ name: '', contact: '', email: '' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Vendor Management</h2>
      </div>

      {/* Add Vendor Form */}
      <div className="mb-6 bg-blue-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Add New Vendor</h3>
        <form onSubmit={handleAddVendor} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Vendor Name"
            value={newVendor.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            value={newVendor.contact}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newVendor.email}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Vendor
          </button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>

      {/* Vendor List Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
            ) : vendors.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">No vendors found.</td></tr>
            ) : (
              vendors.map((vendor) => {
                const isEditing = editingVendorId === vendor.id;
                return (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editingVendor.name}
                          onChange={handleEditChange}
                          className="border p-2 rounded w-full"
                        />
                      ) : (
                        vendor.name
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="contact"
                          value={editingVendor.contact}
                          onChange={handleEditChange}
                          className="border p-2 rounded w-full"
                        />
                      ) : (
                        vendor.contact
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editingVendor.email}
                          onChange={handleEditChange}
                          className="border p-2 rounded w-full"
                        />
                      ) : (
                        vendor.email
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(vendor.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(vendor)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorManagement;
