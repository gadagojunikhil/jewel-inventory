export const exportToCSV = (data, filename = 'export.csv', headers = []) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // If no headers provided, use keys from first object
  const csvHeaders = headers.length > 0 ? headers : Object.keys(data[0]);
  
  const csvContent = [
    csvHeaders,
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = typeof header === 'string' ? row[header] : '';
        // Handle values that might contain commas
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      })
    )
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportJewelryToCSV = (jewelryData) => {
  const processedData = jewelryData.map(jewelry => ({
    Code: jewelry.code,
    Name: jewelry.name,
    Category: jewelry.category,
    'Total Cost': calculateJewelryTotalCost(jewelry).toFixed(2),
    'Sale Price': jewelry.salePrice.toFixed(2),
    'Profit': calculateJewelryProfit(jewelry).toFixed(2),
    'Markup %': calculateJewelryMarkup(jewelry).toFixed(2),
    Status: jewelry.status,
    'Created Date': new Date(jewelry.createdDate).toLocaleDateString()
  }));

  exportToCSV(processedData, `jewelry_inventory_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportMaterialsToCSV = (materialsData) => {
  const processedData = materialsData.map(material => ({
    Category: material.category,
    Name: material.name,
    Code: material.code,
    'Cost Price': material.costPrice.toFixed(2),
    'Sale Price': material.salePrice.toFixed(2),
    'Markup %': calculateMaterialMarkup(material).toFixed(2),
    Unit: material.unit
  }));

  exportToCSV(processedData, `materials_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportUsersToCSV = (usersData) => {
  const processedData = usersData.map(user => ({
    Name: user.name,
    Email: user.email,
    Role: user.role,
    Status: user.status,
    'Created Date': new Date(user.createdDate).toLocaleDateString()
  }));

  exportToCSV(processedData, `users_${new Date().toISOString().split('T')[0]}.csv`);
};

// Helper function to generate unique IDs
export const generateId = (existingItems) => {
  return Math.max(...existingItems.map(item => item.id), 0) + 1;
};

// Helper function to format dates consistently
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Helper function to get status colors
export const getStatusColor = (status, type = 'jewelry') => {
  const colorMaps = {
    jewelry: {
      'In Stock': 'bg-green-100 text-green-800',
      'Sold': 'bg-red-100 text-red-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      'Archived': 'bg-gray-100 text-gray-800',
      'Custom Order': 'bg-blue-100 text-blue-800'
    },
    user: {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Suspended': 'bg-red-100 text-red-800'
    },
    material: {
      'Diamond': 'bg-blue-100 text-blue-800',
      'Stone': 'bg-green-100 text-green-800',
      'Gold': 'bg-yellow-100 text-yellow-800',
      'Silver': 'bg-gray-100 text-gray-800',
      'Platinum': 'bg-purple-100 text-purple-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
  };

  return colorMaps[type]?.[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to debounce search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};