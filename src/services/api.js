const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Session-based authentication
  // This could be implemented with secure httpOnly cookies or session management
  return {
    'Content-Type': 'application/json'
    // Authorization header will be handled by the server session or other secure method
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'API request failed');
  }
  
  const data = await response.json();
  
  // Handle new API response format
  if (data.success !== undefined) {
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    return data.data || data;
  }
  
  // Handle legacy format
  return data;
};

// Helper function for API calls
const apiCall = async (url, options = {}) => {
  const config = {
    headers: getAuthHeaders(),
    credentials: 'include', // Include cookies for session management
    ...options
  };
  
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, config);
  return handleResponse(response);
};

const api = {
  // Vendors
  getVendors: async () => {
    return apiCall('/vendors');
  },

  createVendor: async (data) => {
    return apiCall('/vendors', {
      method: 'POST',
      body: data
    });
  },

  updateVendor: async (id, data) => {
    return apiCall(`/vendors/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  deleteVendor: async (id) => {
    return apiCall(`/vendors/${id}`, {
      method: 'DELETE'
    });
  },

  // Materials
  getMaterials: async () => {
    return apiCall('/materials');
  },
  
  createMaterial: async (data) => {
    return apiCall('/materials', {
      method: 'POST',
      body: data
    });
  },
  
  updateMaterial: async (id, data) => {
    return apiCall(`/materials/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  
  deleteMaterial: async (id) => {
    return apiCall(`/materials/${id}`, {
      method: 'DELETE'
    });
  },

  // Jewelry
  getJewelry: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiCall(`/jewelry?${searchParams.toString()}`);
  },

  createJewelry: async (data) => {
    return apiCall('/jewelry', {
      method: 'POST',
      body: data
    });
  },

  updateJewelry: async (id, data) => {
    return apiCall(`/jewelry/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  deleteJewelry: async (id) => {
    return apiCall(`/jewelry/${id}`, {
      method: 'DELETE'
    });
  },

  // Categories
  getCategories: async () => {
    return apiCall('/categories');
  },

  createCategory: async (data) => {
    return apiCall('/categories', {
      method: 'POST',
      body: data
    });
  },

  updateCategory: async (id, data) => {
    return apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  deleteCategory: async (id) => {
    return apiCall(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Users
  getUsers: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiCall(`/users?${searchParams.toString()}`);
  },

  createUser: async (data) => {
    return apiCall('/users', {
      method: 'POST',
      body: data
    });
  },

  updateUser: async (id, data) => {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  deleteUser: async (id) => {
    return apiCall(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Authentication
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({ username, password })
    });
    
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session management
    });
    
    return handleResponse(response);
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    return handleResponse(response);
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear any client-side state if needed
  },

  // Estimates
  getEstimates: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiCall(`/estimates?${searchParams.toString()}`);
  },

  createEstimate: async (data) => {
    return apiCall('/estimates', {
      method: 'POST',
      body: data
    });
  },

  updateEstimate: async (id, data) => {
    return apiCall(`/estimates/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  deleteEstimate: async (id) => {
    return apiCall(`/estimates/${id}`, {
      method: 'DELETE'
    });
  },

  // Statistics and Reports
  getJewelryStatistics: async () => {
    return apiCall('/jewelry/statistics');
  },

  getUserStatistics: async () => {
    return apiCall('/users/statistics');
  },

  getInventoryValuation: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiCall(`/jewelry/valuation?${searchParams.toString()}`);
  },

  // Search functionality
  searchJewelry: async (searchTerm, params = {}) => {
    const searchParams = new URLSearchParams({ q: searchTerm, ...params });
    return apiCall(`/jewelry/search?${searchParams.toString()}`);
  },

  searchUsers: async (searchTerm, params = {}) => {
    const searchParams = new URLSearchParams({ q: searchTerm, ...params });
    return apiCall(`/users/search?${searchParams.toString()}`);
  },

  // Pricing calculations
  calculateJewelryPricing: async (pricingData) => {
    return apiCall('/jewelry/calculate-pricing', {
      method: 'POST',
      body: pricingData
    });
  }
};

// Enhanced API service with better error handling and consistency
export const apiService = {
  // Vendors
  async getVendors(params = {}) {
    return api.getVendors(params);
  },

  async createVendor(vendor) {
    return api.createVendor(vendor);
  },

  async updateVendor(id, vendor) {
    return api.updateVendor(id, vendor);
  },

  async deleteVendor(id) {
    return api.deleteVendor(id);
  },

  // Materials
  async getMaterials(params = {}) {
    return api.getMaterials(params);
  },

  async createMaterial(material) {
    return api.createMaterial(material);
  },

  async updateMaterial(id, material) {
    return api.updateMaterial(id, material);
  },

  async deleteMaterial(id) {
    return api.deleteMaterial(id);
  },

  // Categories
  async getCategories(params = {}) {
    return api.getCategories(params);
  },

  async createCategory(category) {
    return api.createCategory(category);
  },

  async updateCategory(id, category) {
    return api.updateCategory(id, category);
  },

  async deleteCategory(id) {
    return api.deleteCategory(id);
  },

  // Jewelry/Inventory
  async getJewelryPieces(params = {}) {
    return api.getJewelry(params);
  },

  async createJewelryPiece(piece) {
    return api.createJewelry(piece);
  },

  async updateJewelryPiece(id, piece) {
    return api.updateJewelry(id, piece);
  },

  async deleteJewelryPiece(id) {
    return api.deleteJewelry(id);
  },

  // Users
  async getUsers(params = {}) {
    return api.getUsers(params);
  },

  async createUser(user) {
    return api.createUser(user);
  },

  async updateUser(id, user) {
    return api.updateUser(id, user);
  },

  async deleteUser(id) {
    return api.deleteUser(id);
  },

  // Estimates
  async getEstimates(params = {}) {
    return api.getEstimates(params);
  },

  async createEstimate(estimate) {
    return api.createEstimate(estimate);
  },

  async updateEstimate(id, estimate) {
    return api.updateEstimate(id, estimate);
  },

  async deleteEstimate(id) {
    return api.deleteEstimate(id);
  },

  // Statistics
  async getJewelryStatistics() {
    return api.getJewelryStatistics();
  },

  async getUserStatistics() {
    return api.getUserStatistics();
  },

  async getInventoryValuation(params = {}) {
    return api.getInventoryValuation(params);
  },

  // Search
  async searchJewelry(searchTerm, params = {}) {
    return api.searchJewelry(searchTerm, params);
  },

  async searchUsers(searchTerm, params = {}) {
    return api.searchUsers(searchTerm, params);
  },

  // Pricing
  async calculateJewelryPricing(pricingData) {
    return api.calculateJewelryPricing(pricingData);
  },

  // Permissions
  getCustomPermissions: async () => {
    return apiCall('/permissions');
  },

  saveCustomPermissions: async (permissions) => {
    return apiCall('/permissions', {
      method: 'POST',
      body: { permissions }
    });
  },

  resetPermissions: async () => {
    return apiCall('/permissions', {
      method: 'DELETE'
    });
  }
};

export default api;