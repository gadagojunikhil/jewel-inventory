import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

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
  const { data, loading, error, refresh, setData } = useApiData(apiService.getMaterials);

  const addMaterial = useCallback(async (material) => {
    try {
      const newMaterial = await apiService.createMaterial(material);
      setData(prev => [...prev, newMaterial]);
      return newMaterial;
    } catch (err) {
      console.error('Failed to add material:', err);
      throw err;
    }
  }, [setData]);

  const updateMaterial = useCallback(async (id, material) => {
    try {
      const updatedMaterial = await apiService.updateMaterial(id, material);
      setData(prev => prev.map(item => item.id === id ? updatedMaterial : item));
      return updatedMaterial;
    } catch (err) {
      console.error('Failed to update material:', err);
      throw err;
    }
  }, [setData]);

  const deleteMaterial = useCallback(async (id) => {
    try {
      await apiService.deleteMaterial(id);
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
  const { data, loading, error, refresh, setData } = useApiData(apiService.getCategories);

  const addCategory = useCallback(async (category) => {
    try {
      const newCategory = await apiService.createCategory(category);
      setData(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Failed to add category:', err);
      throw err;
    }
  }, [setData]);

  const updateCategory = useCallback(async (id, category) => {
    try {
      const updatedCategory = await apiService.updateCategory(id, category);
      setData(prev => prev.map(item => item.id === id ? updatedCategory : item));
      return updatedCategory;
    } catch (err) {
      console.error('Failed to update category:', err);
      throw err;
    }
  }, [setData]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await apiService.deleteCategory(id);
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
  const { data, loading, error, refresh, setData } = useApiData(apiService.getJewelryPieces);

  const addJewelryPiece = useCallback(async (piece) => {
    try {
      const newPiece = await apiService.createJewelryPiece(piece);
      setData(prev => [...prev, newPiece]);
      return newPiece;
    } catch (err) {
      console.error('Failed to add jewelry piece:', err);
      throw err;
    }
  }, [setData]);

  const updateJewelryPiece = useCallback(async (id, piece) => {
    try {
      const updatedPiece = await apiService.updateJewelryPiece(id, piece);
      setData(prev => prev.map(item => item.id === id ? updatedPiece : item));
      return updatedPiece;
    } catch (err) {
      console.error('Failed to update jewelry piece:', err);
      throw err;
    }
  }, [setData]);

  const deleteJewelryPiece = useCallback(async (id) => {
    try {
      await apiService.deleteJewelryPiece(id);
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
  const { data, loading, error, refresh, setData } = useApiData(apiService.getUsers);

  const addUser = useCallback(async (user) => {
    try {
      const newUser = await apiService.createUser(user);
      setData(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Failed to add user:', err);
      throw err;
    }
  }, [setData]);

  const updateUser = useCallback(async (id, user) => {
    try {
      const updatedUser = await apiService.updateUser(id, user);
      setData(prev => prev.map(item => item.id === id ? updatedUser : item));
      return updatedUser;
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }, [setData]);

  const deleteUser = useCallback(async (id) => {
    try {
      await apiService.deleteUser(id);
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
