import React from 'react';
import SCREEN_IDS, { getScreenInfo, isValidScreenId } from '../../utils/screenIds';

const PageIdentifier = ({ pageId, pageName, isModal = false, currentModule }) => {
  // If currentModule is provided, determine page info dynamically
  if (currentModule && !isModal) {
    const pageInfo = getPageInfo(currentModule);
    pageId = pageInfo.id;
    pageName = pageInfo.name;
  }

  // Validate screen ID format
  if (!isValidScreenId(pageId)) {
    console.warn(`Invalid screen ID format: ${pageId}`);
  }

  if (isModal) {
    // Simple overlay for modals
    return (
      <div className="absolute bottom-2 left-2 z-[9999] bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-mono">
        Screen ID: {pageId}
      </div>
    );
  }

  // Fixed footer at bottom of screen that doesn't cause scroll
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-50 border-t border-gray-200 py-1 px-4">
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span className="font-mono">Screen ID: {pageId}</span>
        <span>© 2025 Jewelry Inventory Manager</span>
      </div>
    </div>
  );
};

// Helper function to map currentModule to page info (updated with new screen IDs)
const getPageInfo = (module) => {
  const pageMap = {
    'dashboard': { id: 'DASH-001', name: 'Dashboard' },
    'view-inventory': { id: 'INV-001', name: 'View Inventory' },
    'add-inventory': { id: 'INV-002', name: 'Add Inventory Item' },
    'edit-inventory': { id: 'INV-003', name: 'Edit Inventory Item' },
    'edit-item-details': { id: 'INV-003', name: 'Edit Item Details' },
    'item-details': { id: 'INV-001M1', name: 'Item Details' },
    'material-management': { id: 'MAT-001', name: 'Material Management' },
    'category-management': { id: 'CAT-001', name: 'Category Management' },
    'vendor-management': { id: 'VEN-001', name: 'Vendor Management' },
    'user-management': { id: 'ADM-001', name: 'User Management' },
    'permissions-management': { id: 'ADM-002', name: 'Permissions Management' },
    'indian-billing': { id: 'BILL-001', name: 'Indian Billing' },
    'us-billing': { id: 'BILL-001', name: 'US Billing' },
    'available-stock': { id: 'REP-001', name: 'Available Stock Report' },
    'vendor-stock': { id: 'REP-004', name: 'Vendor Stock Report' },
    'gold-rate': { id: 'SET-004', name: 'Gold Rate Management' },
    'dollar-rate': { id: 'SET-004', name: 'Dollar Rate Management' },
    'manual-rate-entry': { id: 'SET-004', name: 'Manual Rate Entry' },
    'data-sync': { id: 'UTL-005', name: 'Data Sync' },
    'business-settings': { id: 'SET-002', name: 'Business Settings' },
    'system-settings': { id: 'ADM-003', name: 'System Settings' }
  };
  
  return pageMap[module] || { id: 'SYS-001', name: 'Unknown Page' };
};

export default PageIdentifier;
