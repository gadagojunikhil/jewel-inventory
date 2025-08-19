// Simple localStorage utilities with cross-domain sync support
export const storageUtils = {
  // Get data from localStorage with error handling
  get: (key, defaultValue = []) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  // Set data to localStorage with error handling
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      return false;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  // Get all jewelry inventory data
  getAllData: () => {
    return {
      materials: storageUtils.get('jewelryMaterials', []),
      categories: storageUtils.get('jewelryCategories', []),
      jewelryPieces: storageUtils.get('jewelryPieces', []),
      users: storageUtils.get('jewelryUsers', [])
    };
  },

  // Set all jewelry inventory data
  setAllData: (data) => {
    const results = {};
    if (data.materials) results.materials = storageUtils.set('jewelryMaterials', data.materials);
    if (data.categories) results.categories = storageUtils.set('jewelryCategories', data.categories);
    if (data.jewelryPieces) results.jewelryPieces = storageUtils.set('jewelryPieces', data.jewelryPieces);
    if (data.users) results.users = storageUtils.set('jewelryUsers', data.users);
    return results;
  },

  // Export data for backup
  exportBackup: () => {
    const data = storageUtils.getAllData();
    const backup = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return backup;
  },

  // Import data from backup
  importBackup: (backupData) => {
    try {
      // Validate backup structure
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Invalid backup data structure');
      }

      const results = storageUtils.setAllData(backupData);
      return { success: true, results };
    } catch (error) {
      console.error('Error importing backup:', error);
      return { success: false, error: error.message };
    }
  },

  // Download backup file
  downloadBackup: () => {
    try {
      const backup = storageUtils.exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jewelry-inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading backup:', error);
      return false;
    }
  },

  // Check if data exists
  hasData: () => {
    const data = storageUtils.getAllData();
    return data.materials.length > 0 || data.categories.length > 0 || data.jewelryPieces.length > 0;
  },

  // Clear all data
  clearAll: () => {
    const keys = ['jewelryMaterials', 'jewelryCategories', 'jewelryPieces', 'jewelryUsers'];
    keys.forEach(key => storageUtils.remove(key));
    return true;
  }
};
