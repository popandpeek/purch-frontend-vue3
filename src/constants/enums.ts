import enumsService from '../services/enums.service'

// Re-export the service methods for backward compatibility
export const formatStorageLocation = enumsService.formatStorageLocation.bind(enumsService)
export const formatInventoryCategory = enumsService.formatInventoryCategory.bind(enumsService)

// Export the service for components that need dynamic enum values
export { enumsService }

// Type definitions (these will be updated when we get the actual enum values)
export type StorageLocation = string
export type InventoryCategory = string