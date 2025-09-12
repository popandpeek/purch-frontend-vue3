import api from '../http-common'

export interface EnumValues {
  storage_locations: string[]
  inventory_categories: string[]
}

class EnumsService {
  async getEnumValues(): Promise<EnumValues> {
    // Fetch house items to extract enum values
    const response = await api.get('/house-items/')
    const items = response.data

    // Extract unique values
    const storage_locations = [...new Set(items.map((item: any) => item.storage_location).filter(Boolean))] as string[]
    const inventory_categories = [...new Set(items.map((item: any) => item.inventory_category).filter(Boolean))] as string[]

    return {
      storage_locations: storage_locations.sort(),
      inventory_categories: inventory_categories.sort()
    }
  }

  // Helper methods for formatting display values
  formatStorageLocation(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  formatInventoryCategory(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

}

export default new EnumsService()
