import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Custom hook for API-based data management
export const useApiData = (apiMethod, dependencies = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiMethod();
      setData(result || []);
    } catch (err) {
      setError(err.message);
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiMethod]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    setData // For optimistic updates
  };
};

// Specific hooks for different data types
export const useMaterials = () => {
  const { data, loading, error, refresh, setData } = useApiData(api.getMaterials);

  const addMaterial = useCallback(async (material) => {
    try {
      const newMaterial = await api.createMaterial(material);
      setData(prev => [...prev, newMaterial]);
      return newMaterial;
    } catch (err) {
      console.error('Failed to add material:', err);
      throw err;
    }
  }, [setData]);

  const updateMaterial = useCallback(async (id, material) => {
    try {
      const updatedMaterial = await api.updateMaterial(id, material);
      setData(prev => prev.map(item => item.id === id ? updatedMaterial : item));
      return updatedMaterial;
    } catch (err) {
      console.error('Failed to update material:', err);
      throw err;
    }
  }, [setData]);

  const deleteMaterial = useCallback(async (id) => {
    try {
      await api.deleteMaterial(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete material:', err);
      throw err;
    }
  }, [setData]);

  return {
    materials: data,
    loading,
    error,
    refresh,
    addMaterial,
    updateMaterial,
    deleteMaterial
  };
};

export const useCategories = () => {
  const { data, loading, error, refresh, setData } = useApiData(api.getCategories);

  const addCategory = useCallback(async (category) => {
    try {
      const newCategory = await api.createCategory(category);
      setData(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Failed to add category:', err);
      throw err;
    }
  }, [setData]);

  const updateCategory = useCallback(async (id, category) => {
    try {
      const updatedCategory = await api.updateCategory(id, category);
      setData(prev => prev.map(item => item.id === id ? updatedCategory : item));
      return updatedCategory;
    } catch (err) {
      console.error('Failed to update category:', err);
      throw err;
    }
  }, [setData]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await api.deleteCategory(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      throw err;
    }
  }, [setData]);

  return {
    categories: data,
    loading,
    error,
    refresh,
    addCategory,
    updateCategory,
    deleteCategory
  };
};

export const useJewelryPieces = () => {
  const { data, loading, error, refresh, setData } = useApiData(api.getJewelryPieces);

  const addJewelryPiece = useCallback(async (piece) => {
    try {
      const newPiece = await api.createJewelryPiece(piece);
      setData(prev => [...prev, newPiece]);
      return newPiece;
    } catch (err) {
      console.error('Failed to add jewelry piece:', err);
      throw err;
    }
  }, [setData]);

  const updateJewelryPiece = useCallback(async (id, piece) => {
    try {
      const updatedPiece = await api.updateJewelryPiece(id, piece);
      setData(prev => prev.map(item => item.id === id ? updatedPiece : item));
      return updatedPiece;
    } catch (err) {
      console.error('Failed to update jewelry piece:', err);
      throw err;
    }
  }, [setData]);

  const deleteJewelryPiece = useCallback(async (id) => {
    try {
      await api.deleteJewelryPiece(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete jewelry piece:', err);
      throw err;
    }
  }, [setData]);

  return {
    jewelryPieces: data,
    loading,
    error,
    refresh,
    addJewelryPiece,
    updateJewelryPiece,
    deleteJewelryPiece
  };
};

export const useUsers = () => {
  const { data, loading, error, refresh, setData } = useApiData(api.getUsers);

  const addUser = useCallback(async (user) => {
    try {
      const newUser = await api.createUser(user);
      setData(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Failed to add user:', err);
      throw err;
    }
  }, [setData]);

  const updateUser = useCallback(async (id, user) => {
    try {
      const updatedUser = await api.updateUser(id, user);
      setData(prev => prev.map(item => item.id === id ? updatedUser : item));
      return updatedUser;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }, [setData]);

  const deleteUser = useCallback(async (id) => {
    try {
      await api.deleteUser(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  }, [setData]);

  return {
    users: data,
    loading,
    error,
    refresh,
    addUser,
    updateUser,
    deleteUser
  };
};

export const useVendors = () => {
  const { data, loading, error, refresh, setData } = useApiData(api.getVendors);

  const addVendor = useCallback(async (vendor) => {
    try {
      const newVendor = await api.createVendor(vendor);
      setData(prev => [...prev, newVendor]);
      return newVendor;
    } catch (err) {
      console.error('Failed to add vendor:', err);
      throw err;
    }
  }, [setData]);

  const updateVendor = useCallback(async (id, vendor) => {
    try {
      const updatedVendor = await api.updateVendor(id, vendor);
      setData(prev => prev.map(item => item.id === id ? updatedVendor : item));
      return updatedVendor;
    } catch (err) {
      console.error('Failed to update vendor:', err);
      throw err;
    }
  }, [setData]);

  const deleteVendor = useCallback(async (id) => {
    try {
      await api.deleteVendor(id);
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete vendor:', err);
      throw err;
    }
  }, [setData]);

  return {
    vendors: data,
    loading,
    error,
    refresh,
    addVendor,
    updateVendor,
    deleteVendor
  };
};
