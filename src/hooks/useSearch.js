import { useState, useMemo } from 'react';

const useSearch = (data, searchFields = ['name']) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], item);
          return fieldValue?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          const itemValue = key.split('.').reduce((obj, k) => obj?.[k], item);
          return itemValue === value;
        });
      }
    });

    return filtered;
  }, [data, searchQuery, filters, searchFields]);

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    filteredData
  };
};

export default useSearch;
