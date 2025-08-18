const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = {
  // Vendors
  getVendors: async () => {
    const response = await fetch(`${API_BASE_URL}/vendors`);
    if (!response.ok) throw new Error('Failed to fetch vendors');
    return response.json();
  },

  createVendor: async (data) => {
    const response = await fetch(`${API_BASE_URL}/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add vendor');
    return response.json();
  },

  updateVendor: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update vendor');
    return response.json();
  },

  deleteVendor: async (id) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete vendor');
    return response.json();
  },

  // Materials
  getMaterials: async () => {
    const response = await fetch(`${API_BASE_URL}/materials`);
    if (!response.ok) throw new Error('Failed to fetch materials');
    return response.json();
  },
  
  createMaterial: async (data) => {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create material');
    return response.json();
  },
  
  updateMaterial: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update material');
    return response.json();
  },
  
  deleteMaterial: async (id) => {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete material');
    return response.json();
  },

  // Jewelry
  getJewelry: async () => {
    const response = await fetch(`${API_BASE_URL}/jewelry`);
    if (!response.ok) throw new Error('Failed to fetch jewelry');
    return response.json();
  },

  createJewelry: async (data) => {
    const response = await fetch(`${API_BASE_URL}/jewelry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create jewelry');
    return response.json();
  },

  updateJewelry: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/jewelry/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update jewelry');
    return response.json();
  },

  deleteJewelry: async (id) => {
    const response = await fetch(`${API_BASE_URL}/jewelry/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete jewelry');
    return response.json();
  },

  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  createCategory: async (data) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  updateCategory: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  deleteCategory: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  createUser: async (data) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  updateUser: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  // Auth - temporarily disabled
  login: async () => {
    // Login functionality is temporarily disabled
    return Promise.resolve({ token: 'dummy-token', user: { id: 1, email: 'admin@jewelry.com', name: 'Admin', role: 'admin' } });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default api;