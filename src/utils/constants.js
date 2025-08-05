
export const USER_ROLES = ['Admin', 'Manager', 'Employee', 'Viewer'];

export const USER_STATUSES = ['Active', 'Inactive', 'Suspended'];

export const MATERIAL_CATEGORIES = ['Diamond', 'Stone', 'Gold', 'Silver', 'Platinum', 'Other'];

export const MATERIAL_UNITS = ['each', 'gram', 'carat', 'piece', 'ounce', 'kilogram'];

export const CURRENCY_SYMBOLS = {
  USD: ',
  EUR: '€',
  GBP: '£',
  INR: '₹'
};

export const DEFAULT_MATERIALS = [
  { id: 1, category: 'Diamond', name: 'Flat Diamonds', code: 'FD', costPrice: 150, salePrice: 400, unit: 'each' },
  { id: 2, category: 'Diamond', name: 'Round Diamonds', code: 'RD', costPrice: 200, salePrice: 500, unit: 'each' },
  { id: 3, category: 'Diamond', name: 'Princess Cut Diamonds', code: 'PD', costPrice: 180, salePrice: 450, unit: 'each' },
  { id: 4, category: 'Stone', name: 'Ruby', code: 'RU', costPrice: 100, salePrice: 300, unit: 'each' },
  { id: 5, category: 'Stone', name: 'Sapphire', code: 'SA', costPrice: 80, salePrice: 250, unit: 'each' },
  { id: 6, category: 'Stone', name: 'Emerald', code: 'EM', costPrice: 120, salePrice: 350, unit: 'each' },
  { id: 11, category: 'Gold', name: '14K Yellow Gold', code: 'G14-Y', costPrice: 30, salePrice: 45, unit: 'gram' },
  { id: 14, category: 'Gold', name: '18K Yellow Gold', code: 'G18-Y', costPrice: 40, salePrice: 60, unit: 'gram' },
  { id: 17, category: 'Gold', name: '22K Yellow Gold', code: 'G22-Y', costPrice: 50, salePrice: 75, unit: 'gram' },
  { id: 18, category: 'Silver', name: 'Sterling Silver 925', code: 'SS-925', costPrice: 2, salePrice: 3, unit: 'gram' }
];

export const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Necklace', code: 'N', description: 'All types of necklaces' },
  { id: 2, name: 'Ring', code: 'R', description: 'All types of rings' },
  { id: 3, name: 'Earrings', code: 'E', description: 'All types of earrings' },
  { id: 4, name: 'Bracelet', code: 'B', description: 'All types of bracelets' },
  { id: 5, name: 'Pendant', code: 'P', description: 'All types of pendants' },
  { id: 6, name: 'Brooch', code: 'BR', description: 'All types of brooches' }
];

export const DEFAULT_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@jewelry.com', role: 'Admin', status: 'Active', createdDate: new Date().toISOString() },
  { id: 2, name: 'Manager User', email: 'manager@jewelry.com', role: 'Manager', status: 'Active', createdDate: new Date().toISOString() }
];