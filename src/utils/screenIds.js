// Screen ID Configuration for Jewelry Inventory Management System
// This file defines all screen IDs and page identifiers used throughout the application

export const SCREEN_IDS = {
  // Authentication & User Management
  AUTHENTICATION: {
    LOGIN: 'AUTH-001',
    REGISTER: 'AUTH-002',
    FORGOT_PASSWORD: 'AUTH-003',
    RESET_PASSWORD: 'AUTH-004',
    PROFILE: 'AUTH-005'
  },

  // Dashboard & Main Navigation
  DASHBOARD: {
    MAIN: 'DASH-001',
    ANALYTICS: 'DASH-002',
    REPORTS_OVERVIEW: 'DASH-003'
  },

  // Inventory Management
  INVENTORY: {
    VIEW_LIST: 'INV-001',
    ADD_ITEM: 'INV-002',
    EDIT_ITEM: 'INV-003',
    VIEW_DETAILS_MODAL: 'INV-001M1',
    EDIT_MODAL: 'INV-001M2',
    DELETE_CONFIRMATION_MODAL: 'INV-001M3',
    UPDATE_CONFIRMATION_MODAL: 'INV-001M4',
    BULK_IMPORT: 'INV-004',
    BULK_EXPORT: 'INV-005'
  },

  // Category Management
  CATEGORIES: {
    MAIN: 'CAT-001',
    ADD_CATEGORY_MODAL: 'CAT-001M1',
    EDIT_CATEGORY_MODAL: 'CAT-001M2',
    DELETE_CATEGORY_MODAL: 'CAT-001M3',
    HIERARCHY_VIEW: 'CAT-002'
  },

  // Materials Management
  MATERIALS: {
    MAIN: 'MAT-001',
    ADD_MATERIAL: 'MAT-002',
    EDIT_MATERIAL: 'MAT-003',
    VIEW_MATERIAL_MODAL: 'MAT-001M1',
    DELETE_MATERIAL_MODAL: 'MAT-001M2',
    BULK_UPDATE: 'MAT-004'
  },

  // Vendor Management
  VENDORS: {
    MAIN: 'VEN-001',
    ADD_VENDOR: 'VEN-002',
    EDIT_VENDOR: 'VEN-003',
    VIEW_VENDOR_MODAL: 'VEN-001M1',
    DELETE_VENDOR_MODAL: 'VEN-001M2',
    VENDOR_PERFORMANCE: 'VEN-004'
  },

  // Billing & Sales
  BILLING: {
    CREATE_BILL: 'BILL-001',
    VIEW_BILLS: 'BILL-002',
    EDIT_BILL: 'BILL-003',
    BILL_DETAILS_MODAL: 'BILL-002M1',
    PAYMENT_MODAL: 'BILL-002M2',
    RECEIPT_MODAL: 'BILL-002M3',
    CUSTOMER_SELECTION: 'BILL-004'
  },

  // Reports & Analytics
  REPORTS: {
    INVENTORY_REPORT: 'REP-001',
    SALES_REPORT: 'REP-002',
    FINANCIAL_REPORT: 'REP-003',
    VENDOR_REPORT: 'REP-004',
    CUSTOM_REPORT: 'REP-005',
    EXPORT_MODAL: 'REP-001M1'
  },

  // Administration
  ADMINISTRATION: {
    USER_MANAGEMENT: 'ADM-001',
    PERMISSIONS: 'ADM-002',
    SYSTEM_SETTINGS: 'ADM-003',
    BACKUP_RESTORE: 'ADM-004',
    AUDIT_LOGS: 'ADM-005',
    ADD_USER_MODAL: 'ADM-001M1',
    EDIT_USER_MODAL: 'ADM-001M2',
    PERMISSIONS_MODAL: 'ADM-002M1'
  },

  // Settings & Configuration
  SETTINGS: {
    GENERAL: 'SET-001',
    BUSINESS_INFO: 'SET-002',
    TAX_RATES: 'SET-003',
    RATE_SCHEDULER: 'SET-004',
    NOTIFICATIONS: 'SET-005',
    INTEGRATIONS: 'SET-006'
  },

  // Rate Management
  RATES: {
    GOLD_RATE: 'RATE-001',
    DOLLAR_RATE: 'RATE-002',
    MANUAL_ENTRY: 'RATE-003',
    RATE_HISTORY: 'RATE-004'
  },

  // Utilities & Tools
  UTILITIES: {
    CALCULATOR: 'UTL-001',
    RATE_CONVERTER: 'UTL-002',
    WEIGHT_CONVERTER: 'UTL-003',
    BACKUP_TOOL: 'UTL-004',
    DATA_SYNC: 'UTL-005'
  },

  // Error & System Pages
  SYSTEM: {
    ERROR_404: 'SYS-404',
    ERROR_500: 'SYS-500',
    ACCESS_DENIED: 'SYS-403',
    MAINTENANCE: 'SYS-503',
    LOADING: 'SYS-001'
  }
};

// Helper function to get screen info
export const getScreenInfo = (screenId) => {
  // Find the screen ID in the nested structure
  for (const [category, screens] of Object.entries(SCREEN_IDS)) {
    for (const [screenName, id] of Object.entries(screens)) {
      if (id === screenId) {
        return {
          id: screenId,
          category,
          screenName,
          isModal: screenId.includes('M'),
          categoryCode: screenId.split('-')[0],
          screenNumber: screenId.split('-')[1]
        };
      }
    }
  }
  return null;
};

// Helper function to validate screen ID format
export const isValidScreenId = (screenId) => {
  const pattern = /^[A-Z]{2,4}-\d{3}(M\d+)?$/;
  return pattern.test(screenId);
};

// Get all screen IDs as a flat array
export const getAllScreenIds = () => {
  const ids = [];
  for (const category of Object.values(SCREEN_IDS)) {
    ids.push(...Object.values(category));
  }
  return ids;
};

export default SCREEN_IDS;
