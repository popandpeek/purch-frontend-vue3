# Frontend Cleanup After Backend Implementation

## Overview
This document outlines the changes needed in the frontend once the backend vendor selection APIs are implemented. The current frontend has temporary 404 error handling that should be removed.

## Files to Modify

### 1. `src/stores/house-orders.ts`

#### Remove 404 Error Handling
**Current Code** (lines 395-399):
```typescript
// If 404, return empty array instead of throwing
if (err.response?.status === 404) {
  console.log('Vendor selections endpoint not implemented, returning empty array');
  return [];
}
```

**Replace With**:
```typescript
// Remove the 404 handling - let the error propagate
```

#### Remove 404 Error Handling from getConfigInheritance
**Current Code** (lines 426-434):
```typescript
// If 404, return default config inheritance instead of throwing
if (err.response?.status === 404) {
  console.log('Config inheritance endpoint not implemented, using default config');
  const defaultConfig = getDefaultVendorSelectionConfig();
  return {
    system_config: defaultConfig,
    resolved_config: defaultConfig
  };
}
```

**Replace With**:
```typescript
// Remove the 404 handling - let the error propagate
```

#### Remove 404 Error Handling from overrideVendorSelection
**Current Code** (lines 416-420):
```typescript
// If 404, just log and continue (endpoint not implemented yet)
if (err.response?.status === 404) {
  console.log('Override vendor selection endpoint not implemented, skipping');
  return;
}
```

**Replace With**:
```typescript
// Remove the 404 handling - let the error propagate
```

#### Remove 404 Error Handling from updateVendorSelectionConfig
**Current Code** (lines 463-467):
```typescript
// If 404, just log and continue (endpoint not implemented yet)
if (err.response?.status === 404) {
  console.log('Update vendor selection config endpoint not implemented, skipping');
  return;
}
```

**Replace With**:
```typescript
// Remove the 404 handling - let the error propagate
```

## Expected Behavior After Cleanup

### 1. Error Handling
- API errors will be properly thrown and caught by components
- Users will see appropriate error messages
- Loading states will be properly managed

### 2. Vendor Selection Flow
- Users can view vendor selections for orders
- Users can override vendor selections
- Users can configure selection preferences
- All operations will work with real backend data

### 3. Configuration Management
- Users can set system-wide preferences
- Users can override preferences at order level
- Users can override preferences at item level
- Configuration inheritance will work properly

## Testing Checklist

After removing the 404 handling, test the following:

- [ ] Order details page loads vendor selections
- [ ] Configuration modal opens and saves settings
- [ ] Vendor override functionality works
- [ ] Error messages display for failed API calls
- [ ] Loading states work properly
- [ ] All vendor selection UI components function correctly

## Rollback Plan

If issues arise after removing the 404 handling:

1. **Temporary Fix**: Re-add the 404 handling code
2. **Debug**: Check backend API responses
3. **Fix**: Address the specific API issues
4. **Re-test**: Remove 404 handling again

## Notes

- The frontend vendor selection UI is fully implemented and ready
- The only changes needed are removing the temporary error handling
- All vendor selection components are properly integrated
- The data models and interfaces are correctly defined
