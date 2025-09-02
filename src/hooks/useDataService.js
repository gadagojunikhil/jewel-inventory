import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

/**
 * Custom hook for database-first data fetching
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Configuration options
 */
const useDataService = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Auto-refresh when coming online
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (options.autoRefreshOnline !== false) {
        refetch();
      }
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [options.autoRefreshOnline]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Map endpoints to API service methods
      const apiMethods = {
        'materials': () => apiService.getMaterials(),
        'categories': () => apiService.getCategories(),
        'jewelry': () => apiService.getJewelryPieces(),
        'users': () => apiService.getUsers(),
        'estimates': () => apiService.getEstimates()
      };

      const method = apiMethods[endpoint];
      if (method) {
        const result = await method();
        setData(result);
      } else {
        throw new Error(`Unknown endpoint: ${endpoint}`);
      }
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save data function
  const saveData = useCallback(async (newData) => {
    try {
      setError(null);
      
      const apiMethods = {
        'materials': (data) => apiService.createMaterial(data),
        'categories': (data) => apiService.createCategory(data),
        'jewelry': (data) => apiService.createJewelryPiece(data),
        'estimates': (data) => apiService.createEstimate(data)
      };

      const method = apiMethods[endpoint];
      if (method) {
        const result = await method(newData);
        
        // Update local state with new data
        if (Array.isArray(data)) {
          setData(prevData => [...(prevData || []), result]);
        } else {
          setData(result);
        }
        
        return result;
      } else {
        throw new Error(`Save not supported for endpoint: ${endpoint}`);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [endpoint, data]);

  // Update data function
  const updateData = useCallback(async (updatedData) => {
    try {
      setError(null);
      
      const apiMethods = {
        'materials': (data) => apiService.updateMaterial(data.id, data),
        'categories': (data) => apiService.updateCategory(data.id, data),
        'jewelry': (data) => apiService.updateJewelryPiece(data.id, data),
        'estimates': (data) => apiService.updateEstimate(data.id, data)
      };

      const method = apiMethods[endpoint];
      if (method) {
        const result = await method(updatedData);
        
        // Update local state
        if (Array.isArray(data)) {
          setData(prevData => 
            prevData.map(item => 
              item.id === updatedData.id ? result : item
            )
          );
        } else {
          setData(result);
        }
        
        return result;
      } else {
        throw new Error(`Update not supported for endpoint: ${endpoint}`);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [endpoint, data]);

  // Delete data function
  const deleteData = useCallback(async (id) => {
    try {
      setError(null);
      
      const apiMethods = {
        'materials': (id) => apiService.deleteMaterial(id),
        'categories': (id) => apiService.deleteCategory(id),
        'jewelry': (id) => apiService.deleteJewelryPiece(id),
        'estimates': (id) => apiService.deleteEstimate(id)
      };

      const method = apiMethods[endpoint];
      if (method) {
        await method(id);
        
        // Update local state
        if (Array.isArray(data)) {
          setData(prevData => prevData.filter(item => item.id !== id));
        } else {
          setData(null);
        }
      } else {
        throw new Error(`Delete not supported for endpoint: ${endpoint}`);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [endpoint, data]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isOffline,
    saveData,
    updateData,
    deleteData,
    refetch
  };
};

export default useDataService;
