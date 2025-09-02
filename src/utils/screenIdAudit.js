// Screen ID Audit Tool
// This tool helps identify components that are missing screen IDs

import { getAllScreenIds, getScreenInfo } from './screenIds';

// Function to check if a component has proper screen ID implementation
export const auditComponentScreenId = (componentName, hasPageIdentifier, screenId) => {
  const audit = {
    componentName,
    hasPageIdentifier,
    screenId,
    isValid: false,
    issues: [],
    recommendations: []
  };

  // Check if component has PageIdentifier
  if (!hasPageIdentifier) {
    audit.issues.push('Missing PageIdentifier component');
    audit.recommendations.push('Add <PageIdentifier pageId="..." pageName="..." /> component');
  }

  // Check if screen ID is provided
  if (!screenId) {
    audit.issues.push('No screen ID specified');
    audit.recommendations.push('Assign a unique screen ID from the SCREEN_IDS mapping');
  } else {
    // Validate screen ID format
    const screenInfo = getScreenInfo(screenId);
    if (!screenInfo) {
      audit.issues.push('Invalid screen ID format or ID not found in mapping');
      audit.recommendations.push('Use proper format: XXX-001 or XXX-001M1 for modals');
    } else {
      audit.isValid = true;
    }
  }

  return audit;
};

// Function to generate screen ID suggestions based on component type
export const suggestScreenId = (componentPath, isModal = false) => {
  const suggestions = [];
  
  // Parse component path to determine category
  if (componentPath.includes('/admin/')) {
    suggestions.push('ADM-0XX - Admin/Management screens');
  }
  if (componentPath.includes('/inventory/')) {
    suggestions.push('INV-0XX - Inventory related screens');
  }
  if (componentPath.includes('/billing/')) {
    suggestions.push('BILL-0XX - Billing/Sales screens');
  }
  if (componentPath.includes('/reports/')) {
    suggestions.push('REP-0XX - Reports and analytics');
  }
  if (componentPath.includes('/auth/')) {
    suggestions.push('AUTH-0XX - Authentication screens');
  }
  if (componentPath.includes('/settings/')) {
    suggestions.push('SET-0XX - Settings and configuration');
  }

  if (isModal) {
    suggestions.push('Add M1, M2, M3... suffix for modals');
  }

  return suggestions;
};

// Function to scan for components missing screen IDs
export const findComponentsMissingScreenIds = (componentList) => {
  const results = {
    total: componentList.length,
    withScreenIds: 0,
    missingScreenIds: [],
    invalidScreenIds: [],
    recommendations: []
  };

  componentList.forEach(component => {
    const audit = auditComponentScreenId(
      component.name, 
      component.hasPageIdentifier, 
      component.screenId
    );

    if (audit.isValid) {
      results.withScreenIds++;
    } else {
      if (!component.screenId) {
        results.missingScreenIds.push({
          component: component.name,
          path: component.path,
          suggestions: suggestScreenId(component.path, component.isModal)
        });
      } else {
        results.invalidScreenIds.push({
          component: component.name,
          screenId: component.screenId,
          issues: audit.issues
        });
      }
    }
  });

  // Generate overall recommendations
  if (results.missingScreenIds.length > 0) {
    results.recommendations.push(
      `${results.missingScreenIds.length} components need screen IDs assigned`
    );
  }
  if (results.invalidScreenIds.length > 0) {
    results.recommendations.push(
      `${results.invalidScreenIds.length} components have invalid screen IDs`
    );
  }

  return results;
};

// Function to generate Screen ID implementation guide
export const generateImplementationGuide = () => {
  return {
    steps: [
      '1. Import PageIdentifier: import PageIdentifier from "../shared/PageIdentifier"',
      '2. Import screen IDs: import SCREEN_IDS from "../../utils/screenIds"',
      '3. Add to component: <PageIdentifier pageId={SCREEN_IDS.CATEGORY.SCREEN_NAME} pageName="Page Name" />',
      '4. For modals: <PageIdentifier pageId={SCREEN_IDS.CATEGORY.MODAL_NAME} pageName="Modal Name" isModal={true} />'
    ],
    examples: [
      {
        type: 'Main Page',
        code: `
// In component
import PageIdentifier from '../shared/PageIdentifier';
import SCREEN_IDS from '../../utils/screenIds';

const ViewInventory = () => {
  return (
    <div>
      <PageIdentifier pageId={SCREEN_IDS.INVENTORY.VIEW_LIST} pageName="View Inventory" />
      {/* Rest of component */}
    </div>
  );
};`
      },
      {
        type: 'Modal',
        code: `
// In modal component
<PageIdentifier 
  pageId={SCREEN_IDS.INVENTORY.VIEW_DETAILS_MODAL} 
  pageName="Item Details" 
  isModal={true} 
/>`
      }
    ],
    bestPractices: [
      'Use consistent naming conventions',
      'Group related screens under same category',
      'Use M1, M2, M3 suffix for modals',
      'Keep screen names descriptive but concise',
      'Update SCREEN_IDS mapping when adding new screens'
    ]
  };
};

export default {
  auditComponentScreenId,
  suggestScreenId,
  findComponentsMissingScreenIds,
  generateImplementationGuide
};
