// Utility to sync localStorage data between different hostnames
// This helps when accessing the same app via localhost vs IP address

const STORAGE_KEYS = [
  'jewelryPieces',
  'jewelryMaterials', 
  'jewelryCategories',
  'jewelryUsers'
];

export const exportLocalStorage = () => {
  const data = {};
  STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch (e) {
        data[key] = value;
      }
    }
  });
  return data;
};

export const importLocalStorage = (data) => {
  Object.keys(data).forEach(key => {
    if (STORAGE_KEYS.includes(key)) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  });
};

export const downloadBackup = () => {
  const data = exportLocalStorage();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jewelry-inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const uploadBackup = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        importLocalStorage(data);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid backup file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Auto-sync with a central storage (could be enhanced to use a backend API)
export const syncWithRemote = async () => {
  try {
    // If backend is available, sync with it
    const response = await fetch('/api/sync/export', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const remoteData = await response.json();
      importLocalStorage(remoteData);
      return true;
    }
  } catch (error) {
    console.log('Remote sync not available, using localStorage only');
  }
  return false;
};

export const pushToRemote = async () => {
  try {
    const localData = exportLocalStorage();
    const response = await fetch('/api/sync/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(localData)
    });
    
    return response.ok;
  } catch (error) {
    console.log('Remote sync not available');
    return false;
  }
};
