export const calculateJewelryTotalCost = (jewelry) => {
  const materialsCost = jewelry.materials?.reduce((sum, material) => sum + material.totalCost, 0) || 0;
  return materialsCost + (jewelry.laborCost || 0) + (jewelry.otherCosts || 0);
};

export const calculateJewelryProfit = (jewelry) => {
  const totalCost = calculateJewelryTotalCost(jewelry);
  return (jewelry.salePrice || 0) - totalCost;
};

export const calculateJewelryMarkup = (jewelry) => {
  const totalCost = calculateJewelryTotalCost(jewelry);
  return totalCost > 0 ? ((jewelry.salePrice - totalCost) / totalCost * 100) : 0;
};

export const calculateMaterialMarkup = (material) => {
  return material.costPrice > 0 ? ((material.salePrice - material.costPrice) / material.costPrice * 100) : 0;
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};