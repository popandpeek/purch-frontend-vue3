/**
 * Fallback Data Service
 * Provides static JSON data when the backend API is not available
 */

export class FallbackDataService {
  private static baseUrl = '/data/';

  /**
   * Fetch data from static JSON files as fallback
   */
  static async fetchFallbackData<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Fallback data fetch failed for ${endpoint}:`, error);
      return [];
    }
  }

  /**
   * Get house items data
   */
  static async getHouseItems() {
    return this.fetchFallbackData('house-item-data');
  }

  /**
   * Get vendors data
   */
  static async getVendors() {
    return this.fetchFallbackData('vendor-data');
  }

  /**
   * Get inventories data
   */
  static async getInventories() {
    return this.fetchFallbackData('inventory-data');
  }

  /**
   * Get house orders data
   */
  static async getHouseOrders() {
    return this.fetchFallbackData('house-order-data');
  }

  /**
   * Get vendor orders data
   */
  static async getVendorOrders() {
    return this.fetchFallbackData('vendor-order-data');
  }

  /**
   * Get vendor invoices data
   */
  static async getVendorInvoices() {
    return this.fetchFallbackData('vendor-invoice-data');
  }

  /**
   * Get vendor items data
   */
  static async getVendorItems() {
    return this.fetchFallbackData('vendor-item-data');
  }
}

export const fallbackDataService = new FallbackDataService();
