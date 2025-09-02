import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Phone, Mail, Shield } from 'lucide-react';
import usePermissions from '../../hooks/usePermissions';
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const VendorManagement = () => {
  const { hasPermission, getPermissionLevel } = usePermissions();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permission checks
  const canCreate = hasPermission('vendor-management', 'create');
  const canEdit = hasPermission('vendor-management', 'edit');
  const canDelete = hasPermission('vendor-management', 'delete');
  const permissionLevel = getPermissionLevel('vendor-management');
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    contact_person: '',
    website: '',
    gst_number: '',
    payment_terms: 'Net 30',
    notes: '',
    creditLimit: 0
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting vendor fetch...');
        
        // Get auth token
        let token = localStorage.getItem('token');
        if (!token) {
          token = 'dummy-token';
          localStorage.setItem('token', token);
        }
        
        console.log('Token:', token);
        console.log('Fetching from:', '/api/vendors');

        const response = await fetch('/api/vendors', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch vendors: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Vendors data:', data);
        setVendors(data || []);
      } catch (err) {
        console.error('Vendor fetch error details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // CRUD Operations
  const handleAddVendor = async () => {
    if (!newVendor.name.trim()) {
      setError('Vendor name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send name to both name and company fields since they represent the same thing
      const vendorData = {
        ...newVendor,
        company: newVendor.name // Use name as company name too
      };
      
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(vendorData)
      });

      if (response.ok) {
        const vendor = await response.json();
        setVendors([...vendors, vendor]);
        setNewVendor({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          postalCode: '',
          contactPerson: '',
          website: '',
          gstNumber: '',
          paymentTerms: '',
          creditLimit: 0,
          notes: '',
          rating: 0
        });
        setShowAddForm(false);
        alert('Vendor added successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add vendor');
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      setError('Failed to add vendor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVendor = async () => {
    if (!editingVendor.name) {
      alert('Please fill in the required field (Vendor Name)');
      return;
    }

    try {
      let token = localStorage.getItem('token');
      if (!token) {
        token = 'dummy-token';
        localStorage.setItem('token', token);
      }

      // Send name to both name and company fields since they represent the same thing
      const vendorData = {
        ...editingVendor,
        company: editingVendor.name // Use name as company name too
      };

      const response = await fetch(`/api/vendors/${editingVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vendorData)
      });

      if (!response.ok) {
        throw new Error('Failed to update vendor');
      }

      const updatedVendor = await response.json();
      setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
      setEditingVendor(null);
      alert('Vendor updated successfully!');
    } catch (err) {
      console.error('Update vendor error:', err);
      alert('Failed to update vendor. Please try again.');
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      let token = localStorage.getItem('token');
      if (!token) {
        token = 'dummy-token';
        localStorage.setItem('token', token);
      }

      const response = await fetch(`/api/vendors/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete vendor');
      }

      setVendors(prev => prev.filter(v => v.id !== id));
      alert('Vendor deleted successfully!');
    } catch (err) {
      console.error('Delete vendor error:', err);
      alert('Failed to delete vendor. Please try again.');
    }
  };

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => 
    vendor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading vendors...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Vendors</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-12">
      <PageIdentifier pageId={SCREEN_IDS?.VENDORS?.MAIN || 'VEN-001'} pageName="Vendor Management" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Vendor Details</h2>
          <p className="text-gray-600 text-sm mt-1">
            Permission Level: 
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {permissionLevel.toUpperCase()} ACCESS
            </span>
          </p>
        </div>
        {canCreate ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Vendor
          </button>
        ) : (
          <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg flex items-center gap-2">
            <Shield size={20} />
            Add Vendor (No Permission)
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search vendors by company, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{vendor.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.email && (
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail size={16} className="mr-1 text-gray-400" />
                        {vendor.email}
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone size={16} className="mr-1 text-gray-400" />
                        {vendor.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vendor.city}{vendor.city && vendor.country ? ', ' : ''}{vendor.country}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {canEdit ? (
                      <button
                        onClick={() => setEditingVendor(vendor)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit vendor"
                      >
                        <Edit2 size={16} />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-gray-400 cursor-not-allowed mr-3"
                        title="No edit permission"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete ? (
                      <button
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete vendor"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-gray-400 cursor-not-allowed"
                        title="No delete permission"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Summary</h3>
        <p className="text-blue-700">
          Total Vendors: {filteredVendors.length}
        </p>
      </div>

      {/* Add Vendor Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Vendor</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Company Name *</label>
                <input
                  type="text"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Raj Jewelers, Gold Palace Pvt Ltd"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newVendor.address}
                  onChange={(e) => setNewVendor({...newVendor, address: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={newVendor.city}
                  onChange={(e) => setNewVendor({...newVendor, city: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={newVendor.state}
                  onChange={(e) => setNewVendor({...newVendor, state: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={newVendor.country}
                  onChange={(e) => setNewVendor({...newVendor, country: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={newVendor.postal_code}
                  onChange={(e) => setNewVendor({...newVendor, postal_code: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newVendor.contact_person}
                  onChange={(e) => setNewVendor({...newVendor, contact_person: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={newVendor.website}
                  onChange={(e) => setNewVendor({...newVendor, website: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={newVendor.gst_number}
                  onChange={(e) => setNewVendor({...newVendor, gst_number: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select
                  value={newVendor.payment_terms}
                  onChange={(e) => setNewVendor({...newVendor, payment_terms: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="COD">COD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                <input
                  type="number"
                  value={newVendor.creditLimit}
                  onChange={(e) => setNewVendor({...newVendor, creditLimit: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newVendor.notes}
                  onChange={(e) => setNewVendor({...newVendor, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={16} />
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Vendor</h3>
              <button
                onClick={() => setEditingVendor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Company Name *</label>
                <input
                  type="text"
                  value={editingVendor.name}
                  onChange={(e) => setEditingVendor({...editingVendor, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Raj Jewelers, Gold Palace Pvt Ltd"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingVendor.email}
                  onChange={(e) => setEditingVendor({...editingVendor, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingVendor.phone}
                  onChange={(e) => setEditingVendor({...editingVendor, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editingVendor.address}
                  onChange={(e) => setEditingVendor({...editingVendor, address: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={editingVendor.city}
                  onChange={(e) => setEditingVendor({...editingVendor, city: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={editingVendor.state}
                  onChange={(e) => setEditingVendor({...editingVendor, state: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={editingVendor.country}
                  onChange={(e) => setEditingVendor({...editingVendor, country: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={editingVendor.postal_code}
                  onChange={(e) => setEditingVendor({...editingVendor, postal_code: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editingVendor.contact_person}
                  onChange={(e) => setEditingVendor({...editingVendor, contact_person: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={editingVendor.website}
                  onChange={(e) => setEditingVendor({...editingVendor, website: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={editingVendor.gst_number}
                  onChange={(e) => setEditingVendor({...editingVendor, gst_number: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select
                  value={editingVendor.payment_terms}
                  onChange={(e) => setEditingVendor({...editingVendor, payment_terms: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="COD">COD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                <input
                  type="number"
                  value={editingVendor.creditLimit}
                  onChange={(e) => setEditingVendor({...editingVendor, creditLimit: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editingVendor.notes}
                  onChange={(e) => setEditingVendor({...editingVendor, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingVendor(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditVendor}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={16} />
                Update Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
