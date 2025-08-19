// Enhanced storage utility with automatic sync capabilities
import { storageUtils } from './simpleStorage';

class DataManager {
  constructor() {
    this.listeners = new Map();
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.autoSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Subscribe to data changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Notify listeners of data changes
  notify(key, data) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Load data with automatic fallback
  async loadData(key, fallbackData = []) {
    try {
      // For now, let's just use localStorage to avoid API issues
      // We can enable API sync later when backend is fully configured
      const localData = this.getLocal(key, fallbackData);
      return localData;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return fallbackData;
    }
  }

  // Save data with automatic sync
  async saveData(key, data, syncToBackend = false) {
    try {
      // Save to localStorage immediately
      this.saveLocal(key, data);
      
      // Notify all subscribers
      this.notify(key, data);

      // For now, disable backend sync to avoid issues
      // We can enable this later when backend is fully configured
      if (syncToBackend && this.isOnline) {
        try {
          await this.saveToAPI(key, data);
        } catch (error) {
          console.log(`Failed to sync ${key} to backend:`, error);
        }
      }

      return data;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  // Local storage operations
  getLocal(key, defaultValue = []) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  // API operations
  async fetchFromAPI(key) {
    const endpoints = {
      'jewelryMaterials': '/api/materials',
      'jewelryCategories': '/api/categories', 
      'jewelryPieces': '/api/jewelry',
      'jewelryUsers': '/api/users'
    };

    const endpoint = endpoints[key];
    if (!endpoint) return null;

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }

  async saveToAPI(key, data) {
    const endpoints = {
      'jewelryMaterials': '/api/materials',
      'jewelryCategories': '/api/categories',
      'jewelryPieces': '/api/jewelry', 
      'jewelryUsers': '/api/users'
    };

    const endpoint = endpoints[key];
    if (!endpoint) return false;

    const response = await fetch(`${endpoint}/bulk-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data })
    });

    return response.ok;
  }

  // Queue management for offline sync
  queueForSync(key, data) {
    const queue = this.getLocal('syncQueue', {});
    queue[key] = { data, timestamp: Date.now() };
    this.saveLocal('syncQueue', queue);
  }

  async autoSync() {
    const queue = this.getLocal('syncQueue', {});
    
    for (const [key, item] of Object.entries(queue)) {
      try {
        await this.saveToAPI(key, item.data);
        console.log(`Auto-synced ${key} to backend`);
      } catch (error) {
        console.log(`Failed to auto-sync ${key}:`, error);
      }
    }

    // Clear successful syncs
    this.saveLocal('syncQueue', {});
  }

  // Utility methods for specific data types
  async getMaterials() {
    return this.loadData('jewelryMaterials', []);
  }

  async saveMaterials(materials) {
    return this.saveData('jewelryMaterials', materials);
  }

  async getCategories() {
    return this.loadData('jewelryCategories', []);
  }

  async saveCategories(categories) {
    return this.saveData('jewelryCategories', categories);
  }

  async getJewelryPieces() {
    return this.loadData('jewelryPieces', []);
  }

  async saveJewelryPieces(pieces) {
    return this.saveData('jewelryPieces', pieces);
  }

  async getUsers() {
    return this.loadData('jewelryUsers', []);
  }

  async saveUsers(users) {
    return this.saveData('jewelryUsers', users);
  }
}

// Create singleton instance
export const dataManager = new DataManager();
export default dataManager;
