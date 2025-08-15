const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.clearToken();
        // Optionally redirect to login
        // window.location.href = '/login';
        throw new Error('Unauthorized - Please login again');
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Parse JSON response
      const data = await response.json();

      // Handle errors
      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async logout() {
    this.clearToken();
    // Optionally call a logout endpoint if your backend tracks sessions
    // await this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updatePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // ============================================
  // JEWELRY ENDPOINTS
  // ============================================

  async getJewelry(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/jewelry${queryString ? `?${queryString}` : ''}`);
  }

  async getJewelryById(id) {
    return this.request(`/jewelry/${id}`);
  }

  async createJewelry(data) {
    return this.request('/jewelry', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateJewelry(id, data) {
    return this.request(`/jewelry/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteJewelry(id) {
    return this.request(`/jewelry/${id}`, {
      method: 'DELETE'
    });
  }

  async bulkUploadJewelry(items) {
    return this.request('/jewelry/bulk-upload', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  }

  async searchJewelry(searchTerm) {
    return this.request(`/jewelry/search?q=${encodeURIComponent(searchTerm)}`);
  }

  async getJewelryStatistics() {
    return this.request('/jewelry/statistics');
  }

  // ============================================
  // CATEGORY ENDPOINTS
  // ============================================

  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryById(id) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(data) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCategory(id, data) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // ============================================
  // MATERIAL ENDPOINTS
  // ============================================

  async getMaterials(category = null) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/materials${params}`);
  }

  async getMaterialById(id) {
    return this.request(`/materials/${id}`);
  }

  async createMaterial(data) {
    return this.request('/materials', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateMaterial(id, data) {
    return this.request(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMaterial(id) {
    return this.request(`/materials/${id}`, {
      method: 'DELETE'
    });
  }

  async getMaterialStock() {
    return this.request('/materials/stock');
  }

  async updateMaterialStock(id, quantity) {
    return this.request(`/materials/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  // ============================================
  // SALES ENDPOINTS
  // ============================================

  async getSales(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/sales${queryString ? `?${queryString}` : ''}`);
  }

  async getSaleById(id) {
    return this.request(`/sales/${id}`);
  }

  async createSale(data) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSale(id, data) {
    return this.request(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteSale(id) {
    return this.request(`/sales/${id}`, {
      method: 'DELETE'
    });
  }

  async getSalesReport(startDate, endDate) {
    return this.request(`/sales/report?start=${startDate}&end=${endDate}`);
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  async getUsers() {
    return this.request('/users');
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  async updateUserRole(id, role) {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  // ============================================
  // VENDOR ENDPOINTS
  // ============================================

  async getVendors() {
    return this.request('/vendors');
  }

  async getVendorById(id) {
    return this.request(`/vendors/${id}`);
  }

  async createVendor(data) {
    return this.request('/vendors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateVendor(id, data) {
    return this.request(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteVendor(id) {
    return this.request(`/vendors/${id}`, {
      method: 'DELETE'
    });
  }

  // ============================================
  // REPORTS ENDPOINTS
  // ============================================

  async getInventoryReport() {
    return this.request('/reports/inventory');
  }

  async getStockReport() {
    return this.request('/reports/stock');
  }

  async getVendorReport(vendorId = null) {
    const params = vendorId ? `?vendor=${vendorId}` : '';
    return this.request(`/reports/vendor${params}`);
  }

  async getCategoryReport() {
    return this.request('/reports/category');
  }

  async getFinancialReport(startDate, endDate) {
    return this.request(`/reports/financial?start=${startDate}&end=${endDate}`);
  }

  async exportReport(type, format = 'csv') {
    const response = await fetch(`${API_URL}/reports/export/${type}?format=${format}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ============================================
  // FILE UPLOAD ENDPOINTS
  // ============================================

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  }

  async uploadBulkFile(file, type = 'jewelry') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch(`${API_URL}/upload/bulk`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    return response.json();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async getDashboardData() {
    return this.request('/dashboard');
  }

  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async getActivityLog(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/activity-log${queryString ? `?${queryString}` : ''}`);
  }

  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async getDollarRate() {
    return this.request('/utilities/dollar-rate');
  }

  async getBackupData() {
    const response = await fetch(`${API_URL}/backup`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Backup failed');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jewelry_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async restoreData(file) {
    const formData = new FormData();
    formData.append('backup', file);
    
    const response = await fetch(`${API_URL}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Restore failed');
    }
    
    return response.json();
  }

  // ============================================
  // SEARCH ENDPOINTS
  // ============================================

  async globalSearch(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  async advancedSearch(filters) {
    return this.request('/search/advanced', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;