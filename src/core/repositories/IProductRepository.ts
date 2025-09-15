import type { IRepository } from './IRepository';
import type { Product } from '../entities/Product';

/**
 * Product Repository Interface
 * Defines product-specific data access operations
 */
export interface IProductRepository extends IRepository<Product> {
  findByName(name: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  findByStorageLocation(location: string): Promise<Product[]>;
  findActiveProducts(): Promise<Product[]>;
  findLowStockProducts(): Promise<Product[]>;
  findOutOfStockProducts(): Promise<Product[]>;
  findProductsNeedingReorder(): Promise<Product[]>;
  updateStockCount(id: string | number, newCount: number): Promise<Product>;
  adjustStockCount(id: string | number, adjustment: number): Promise<Product>;
}
