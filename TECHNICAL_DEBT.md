# Technical Debt & TODOs

## 🔒 Authentication & Security

### HIGH PRIORITY: Remove Dummy Token Authentication
**Status:** 🔴 Critical - Must fix before production

**Issue:** 
- Currently using "dummy-token" for development convenience
- Bypasses proper JWT authentication flow
- Security risk if left in production code

**Location:** 
- `server/middleware/auth.js` (lines 10-16)
- Various frontend components that auto-set dummy-token

**Impact:**
- Anyone can access admin functions with "dummy-token"
- Inconsistent authentication state
- Makes testing real auth flows difficult

**Solution Options:**
1. **Remove dummy token entirely** - Force proper login flow
2. **Environment-based dummy token** - Only allow in development
3. **Create proper test admin user** - Use real credentials for testing

**Workaround Applied:**
- ✅ Removed foreign key constraint on `custom_permissions.created_by` 
- ✅ User Permissions page now fully functional with dummy token

**Assigned:** TBD
**Priority:** High
**Estimated Effort:** 2-4 hours

---

## 🟡 Partially Working Features

### User Permissions Management
**Status:** 🟡 PARTIAL - August 18, 2025
- ✅ Fixed authentication middleware order (auth + superAdminAuth)
- ✅ Resolved foreign key constraint issues in custom_permissions table
- ✅ All CRUD operations working: GET, POST, DELETE
- ✅ Permission matrix display and editing fully functional
- ❌ **Unable to update User Permissions through UI** - Backend API works but frontend save functionality has issues

**Current Issue:**
- API endpoints respond correctly (confirmed via curl testing)
- Frontend permission editing interface loads properly
- Save button triggers API call but changes don't persist in UI
- No error messages shown to user

**Investigation Needed:**
- Check frontend-backend data synchronization
- Verify state management in PermissionsManagement.js
- Ensure proper error handling and user feedback

**Priority:** Medium
**Estimated Effort:** 1-2 hours

## ✅ Recently Completed

### Vendor Management CRUD
**Status:** ✅ COMPLETED 
- Full create, read, update, delete operations
- Direct API calls replacing problematic hook system
- Simplified vendor fields (company-focused, no mandatory email)

---

## 🧹 Code Cleanup

### Remove Duplicate/Backup Files
**Status:** ✅ Completed
- Cleaned up duplicate API files and backup components

### API Service Consistency
**Status:** 🟡 In Progress
- Some components use API service, others use direct fetch
- Should standardize approach across all components

---

## 📋 Future Enhancements

### User Management
- Implement proper role-based permissions
- Add user creation/editing workflows
- Add password reset functionality

### Vendor Management  
- ✅ Basic CRUD operations completed
- Add vendor performance metrics
- Add vendor document management

### Inventory Management
- Enhance search and filtering
- Add bulk operations
- Add inventory alerts/notifications

---

**Last Updated:** August 18, 2025
**Next Review:** Before production deployment
