import type { IVendorSelectionRepository } from '../../core/repositories/IVendorSelectionRepository';
import { VendorSelection } from '../../core/entities/VendorSelection';
import { ApiClient } from '../api/ApiClient';

/**
 * Vendor Selection Repository Implementation
 * Handles vendor selection data access through the API
 */
export class VendorSelectionRepository implements IVendorSelectionRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: string | number): Promise<VendorSelection | null> {
    try {
      // Note: This endpoint might not exist in the API, but we'll implement it
      // for consistency with the repository pattern
      const data = await this.apiClient.get(`/vendor-selections/${id}`);
      return VendorSelection.fromAPI(data);
    } catch (error) {
      console.error('Error fetching vendor selection by ID:', error);
      return null;
    }
  }

  async findAll(): Promise<VendorSelection[]> {
    try {
      // This would need to be implemented in the API
      const data = await this.apiClient.get<any[]>('/vendor-selections/');
      return data.map((item: any) => VendorSelection.fromAPI(item));
    } catch (error) {
      console.error('Error fetching all vendor selections:', error);
      return [];
    }
  }

  async save(selection: VendorSelection): Promise<VendorSelection> {
    try {
      // This would need to be implemented in the API
      const data = await this.apiClient.post('/vendor-selections/', selection.toJSON());
      return VendorSelection.fromAPI(data);
    } catch (error) {
      console.error('Error saving vendor selection:', error);
      throw error;
    }
  }

  async update(selection: VendorSelection): Promise<VendorSelection> {
    try {
      // This would need to be implemented in the API
      const data = await this.apiClient.put(`/vendor-selections/${selection.id}`, selection.toJSON());
      return VendorSelection.fromAPI(data);
    } catch (error) {
      console.error('Error updating vendor selection:', error);
      throw error;
    }
  }

  async delete(id: string | number): Promise<void> {
    try {
      // This would need to be implemented in the API
      await this.apiClient.delete(`/vendor-selections/${id}`);
    } catch (error) {
      console.error('Error deleting vendor selection:', error);
      throw error;
    }
  }

  async findByOrderId(orderId: string | number): Promise<VendorSelection[]> {
    try {
      const data = await this.apiClient.getVendorSelections(orderId);
      return data.map(item => VendorSelection.fromAPI(item));
    } catch (error) {
      console.error('Error finding vendor selections by order ID:', error);
      return [];
    }
  }

  async findByHouseOrderItemId(itemId: string | number): Promise<VendorSelection | null> {
    try {
      const selections = await this.findAll();
      return selections.find(s => s.houseOrderItemId === Number(itemId)) || null;
    } catch (error) {
      console.error('Error finding vendor selection by house order item ID:', error);
      return null;
    }
  }

  async findOverriddenSelections(): Promise<VendorSelection[]> {
    try {
      const selections = await this.findAll();
      return selections.filter(s => s.isOverridden);
    } catch (error) {
      console.error('Error finding overridden vendor selections:', error);
      return [];
    }
  }

  async findSelectionsByStrategy(strategy: string): Promise<VendorSelection[]> {
    try {
      const selections = await this.findAll();
      return selections.filter(s => s.selectionReason.strategy === strategy);
    } catch (error) {
      console.error('Error finding vendor selections by strategy:', error);
      return [];
    }
  }

  async overrideSelection(itemId: string | number, vendorItemId: number): Promise<VendorSelection> {
    try {
      const data = await this.apiClient.overrideVendorSelection(itemId, vendorItemId);
      return VendorSelection.fromAPI(data);
    } catch (error) {
      console.error('Error overriding vendor selection:', error);
      throw error;
    }
  }

  async resetOverride(itemId: string | number): Promise<VendorSelection> {
    try {
      // This would need to be implemented in the API
      const data = await this.apiClient.post(`/house-orders/items/${itemId}/reset-vendor-selection`);
      return VendorSelection.fromAPI(data);
    } catch (error) {
      console.error('Error resetting vendor selection override:', error);
      throw error;
    }
  }
}
