import { useState, useEffect, useCallback, useRef } from 'react';
import { dataManager } from '../utils/dataManager';

// Custom hook for synchronized data management
export const useDataSync = (dataKey, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const initialDataRef = useRef(initialData);
  
  // Update ref when initialData changes
  initialDataRef.current = initialData;

  // Load data on mount
  useEffect(() => {
    mounted.current = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedData = await dataManager.loadData(dataKey, initialDataRef.current);
        if (mounted.current) {
          setData(loadedData);
        }
      } catch (err) {
        if (mounted.current) {
          setError(err.message);
          setData(initialDataRef.current);
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Subscribe to data changes from other components
    const unsubscribe = dataManager.subscribe(dataKey, (newData) => {
      if (mounted.current) {
        setData(newData);
      }
    });

    return () => {
      mounted.current = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]); // Only dataKey in dependencies

  // Save data with automatic sync
  const saveData = useCallback(async (newData) => {
    try {
      setError(null);
      const savedData = await dataManager.saveData(dataKey, newData);
      setData(savedData);
      return savedData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [dataKey]);

  // Add item to data array
  const addItem = useCallback(async (item) => {
    const newData = [...data, item];
    return saveData(newData);
  }, [data, saveData]);

  // Update item in data array
  const updateItem = useCallback(async (id, updatedItem) => {
    const newData = data.map(item => 
      item.id === id ? { ...updatedItem, id } : item
    );
    return saveData(newData);
  }, [data, saveData]);

  // Remove item from data array
  const removeItem = useCallback(async (id) => {
    const newData = data.filter(item => item.id !== id);
    return saveData(newData);
  }, [data, saveData]);

  // Replace entire dataset
  const replaceData = useCallback(async (newData) => {
    return saveData(newData);
  }, [saveData]);

  return {
    data,
    loading,
    error,
    saveData,
    addItem,
    updateItem,
    removeItem,
    replaceData,
    refresh: () => dataManager.loadData(dataKey, initialDataRef.current).then(setData)
  };
};

// Specific hooks for different data types
export const useMaterials = () => {
  return useDataSync('jewelryMaterials', []);
};

export const useCategories = () => {
  return useDataSync('jewelryCategories', []);
};

export const useJewelryPieces = () => {
  return useDataSync('jewelryPieces', []);
};

export const useUsers = () => {
  return useDataSync('jewelryUsers', []);
};
