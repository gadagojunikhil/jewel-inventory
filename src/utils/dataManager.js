// Database-first data manager
import { apiService } from '../services/api';

class DataManager {
  constructor() {
    this.listeners = new Map();
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyConnectionChange(true);
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyConnectionChange(false);
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

  // Notify listeners of connection changes
  notifyConnectionChange(isOnline) {
    const callbacks = this.listeners.get('connection');
    if (callbacks) {
      callbacks.forEach(callback => callback({ isOnline }));
    }
  }

  // Load data directly from database via API
  async loadData(key, fallbackData = []) {
    try {
      if (!this.isOnline) {
        console.warn(`No internet connection - cannot load ${key}`);
        return fallbackData;
      }

      const apiMethods = {
        'jewelryMaterials': () => apiService.getMaterials(),
        'jewelryCategories': () => apiService.getCategories(),
        'jewelryPieces': () => apiService.getJewelryPieces(),
        'jewelryUsers': () => apiService.getUsers(),
        'estimates': () => apiService.getEstimates()
      };

      const method = apiMethods[key];
      if (method) {
        const data = await method();
        return Array.isArray(data) ? data : fallbackData;
      }

      return fallbackData;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return fallbackData;
    }
  }

  // Save data directly to database via API
  async saveData(key, data) {
    try {
      if (!this.isOnline) {
        throw new Error('No internet connection - cannot save data');
      }

      // Notify all subscribers immediately with optimistic update
      this.notify(key, data);

      const apiMethods = {
        'jewelryMaterials': (items) => Promise.all(items.map(item => 
          item.id ? apiService.updateMaterial(item.id, item) : apiService.createMaterial(item)
        )),
        'jewelryCategories': (items) => Promise.all(items.map(item => 
          item.id ? apiService.updateCategory(item.id, item) : apiService.createCategory(item)
        )),
        'jewelryPieces': (items) => Promise.all(items.map(item => 
          item.id ? apiService.updateJewelryPiece(item.id, item) : apiService.createJewelryPiece(item)
        )),
        'estimates': (items) => Promise.all(items.map(item => 
          item.id ? apiService.updateEstimate(item.id, item) : apiService.createEstimate(item)
        ))
      };

      const method = apiMethods[key];
      if (method && Array.isArray(data)) {
        await method(data);
      }

      return data;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
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

  async getEstimates() {
    return this.loadData('estimates', []);
  }

  async saveEstimates(estimates) {
    return this.saveData('estimates', estimates);
  }
}

// Create singleton instance
export const dataManager = new DataManager();
export default dataManager;
