const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const api = {
  // Vendors
  getVendors: async () => {
    const response = await fetch(`${API_BASE_URL}/vendors`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch vendors');
    return response.json();
  },

  createVendor: async (data) => {
    const response = await fetch(`${API_BASE_URL}/vendors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add vendor');
    return response.json();
  },

  updateVendor: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update vendor');
    return response.json();
  },

  deleteVendor: async (id) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete vendor');
    return response.json();
  },

  // Materials
  getMaterials: async () => {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch materials');
    return response.json();
  },
  
  createMaterial: async (data) => {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create material');
    return response.json();
  },
  
  updateMaterial: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update material');
    return response.json();
  },
  
  deleteMaterial: async (id) => {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete material');
    return response.json();
  },

  // Jewelry
  getJewelry: async () => {
    const response = await fetch(`${API_BASE_URL}/jewelry`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch jewelry');
    return response.json();
  },

  createJewelry: async (data) => {
    const response = await fetch(`${API_BASE_URL}/jewelry`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create jewelry');
    return response.json();
  },

  updateJewelry: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/jewelry/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update jewelry');
    return response.json();
  },

  deleteJewelry: async (id) => {
    const response = await fetch(`${API_BASE_URL}/jewelry/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete jewelry');
    return response.json();
  },

  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  createCategory: async (data) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  updateCategory: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  deleteCategory: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  createUser: async (data) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  updateUser: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  // Authentication
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    return data;
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user info');
    }
    
    return response.json();
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }
    
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Create a more comprehensive API service for database operations
export const apiService = {
  // Vendors
  async getVendors() {
    const response = await fetch(`${API_BASE_URL}/vendors`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch vendors');
    return response.json();
  },

  async createVendor(vendor) {
    const response = await fetch(`${API_BASE_URL}/vendors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vendor),
    });
    if (!response.ok) throw new Error('Failed to create vendor');
    return response.json();
  },

  async updateVendor(id, vendor) {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(vendor),
    });
    if (!response.ok) throw new Error('Failed to update vendor');
    return response.json();
  },

  async deleteVendor(id) {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete vendor');
    return response.json();
  },

  async getVendorStats(id) {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch vendor statistics');
    return response.json();
  },

  // Materials
  async getMaterials() {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch materials');
    return response.json();
  },

  async createMaterial(material) {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(material),
    });
    if (!response.ok) throw new Error('Failed to create material');
    return response.json();
  },

  async updateMaterial(id, material) {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(material),
    });
    if (!response.ok) throw new Error('Failed to update material');
    return response.json();
  },

  async deleteMaterial(id) {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete material');
    return response.json();
  },

  // Categories
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createCategory(category) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  async updateCategory(id, category) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  async deleteCategory(id) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },

  // Jewelry/Inventory
  async getJewelryPieces() {
    const response = await fetch(`${API_BASE_URL}/jewelry`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch jewelry pieces');
    return response.json();
  },

  async createJewelryPiece(piece) {
    const response = await fetch(`${API_BASE_URL}/jewelry`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(piece),
    });
    if (!response.ok) throw new Error('Failed to create jewelry piece');
    return response.json();
  },

  async updateJewelryPiece(id, piece) {
    const response = await fetch(`${API_BASE_URL}/jewelry/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(piece),
    });
    if (!response.ok) throw new Error('Failed to update jewelry piece');
    return response.json();
  },

  async deleteJewelryPiece(id) {
    const response = await fetch(`${API_BASE_URL}/jewelry/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete jewelry piece');
    return response.json();
  },

  // Users
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async createUser(user) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  async updateUser(id, user) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  // Permissions
  getCustomPermissions: async () => {
    const response = await fetch('/api/permissions', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch custom permissions');
    return response.json();
  },

  saveCustomPermissions: async (permissions) => {
    const response = await fetch('/api/permissions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    });
    if (!response.ok) throw new Error('Failed to save custom permissions');
    return response.json();
  },

  resetPermissions: async () => {
    const response = await fetch('/api/permissions', {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to reset permissions');
    return response.json();
  }
};

export default api;