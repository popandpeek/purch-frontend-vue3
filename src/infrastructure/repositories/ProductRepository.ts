import type { IProductRepository } from '../../core/repositories/IProductRepository';
import { Product } from '../../core/entities/Product';
import { ApiClient } from '../api/ApiClient';

/**
 * Product Repository Implementation
 * Handles product data access through the API
 */
export class ProductRepository implements IProductRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: string | number): Promise<Product | null> {
    try {
      const data = await this.apiClient.getHouseItem(id);
      return Product.fromAPI(data);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const data = await this.apiClient.getHouseItems();
      return data.map(item => Product.fromAPI(item));
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  }

  async save(product: Product): Promise<Product> {
    try {
      const data = await this.apiClient.createHouseItem(product.toJSON());
      return Product.fromAPI(data);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  async update(product: Product): Promise<Product> {
    try {
      const data = await this.apiClient.updateHouseItem(product.id, product.toJSON());
      return Product.fromAPI(data);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async delete(id: string | number): Promise<void> {
    try {
      await this.apiClient.deleteHouseItem(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Product | null> {
    try {
      const products = await this.findAll();
      return products.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
    } catch (error) {
      console.error('Error finding product by name:', error);
      return null;
    }
  }

  async findByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.findAll();
      return products.filter(p => p.inventoryCategory.toLowerCase() === category.toLowerCase());
    } catch (error) {
      console.error('Error finding products by category:', error);
      return [];
    }
  }

  async findByStorageLocation(location: string): Promise<Product[]> {
    try {
      const data = await this.apiClient.getInventoryByLocation(location);
      return data.map(item => Product.fromAPI(item));
    } catch (error) {
      console.error('Error finding products by storage location:', error);
      return [];
    }
  }

  async findActiveProducts(): Promise<Product[]> {
    try {
      const products = await this.findAll();
      return products.filter(p => p.active);
    } catch (error) {
      console.error('Error finding active products:', error);
      return [];
    }
  }

  async findLowStockProducts(): Promise<Product[]> {
    try {
      const products = await this.findAll();
      return products.filter(p => p.isLowStock());
    } catch (error) {
      console.error('Error finding low stock products:', error);
      return [];
    }
  }

  async findOutOfStockProducts(): Promise<Product[]> {
    try {
      const products = await this.findAll();
      return products.filter(p => p.isOutOfStock());
    } catch (error) {
      console.error('Error finding out of stock products:', error);
      return [];
    }
  }

  async findProductsNeedingReorder(): Promise<Product[]> {
    try {
      const products = await this.findAll();
      return products.filter(p => p.needsReorder());
    } catch (error) {
      console.error('Error finding products needing reorder:', error);
      return [];
    }
  }

  async updateStockCount(id: string | number, newCount: number): Promise<Product> {
    try {
      const product = await this.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      
      product.updateCurrentCount(newCount);
      return await this.update(product);
    } catch (error) {
      console.error('Error updating stock count:', error);
      throw error;
    }
  }

  async adjustStockCount(id: string | number, adjustment: number): Promise<Product> {
    try {
      const product = await this.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }
      
      product.adjustCount(adjustment);
      return await this.update(product);
    } catch (error) {
      console.error('Error adjusting stock count:', error);
      throw error;
    }
  }
}
