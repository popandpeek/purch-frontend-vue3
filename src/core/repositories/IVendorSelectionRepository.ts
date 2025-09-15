import type { IRepository } from './IRepository';
import type { VendorSelection } from '../entities/VendorSelection';

/**
 * Vendor Selection Repository Interface
 * Defines vendor selection-specific data access operations
 */
export interface IVendorSelectionRepository extends IRepository<VendorSelection> {
  findByOrderId(orderId: string | number): Promise<VendorSelection[]>;
  findByHouseOrderItemId(itemId: string | number): Promise<VendorSelection | null>;
  findOverriddenSelections(): Promise<VendorSelection[]>;
  findSelectionsByStrategy(strategy: string): Promise<VendorSelection[]>;
  overrideSelection(itemId: string | number, vendorItemId: number): Promise<VendorSelection>;
  resetOverride(itemId: string | number): Promise<VendorSelection>;
}
