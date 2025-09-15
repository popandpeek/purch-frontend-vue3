import { Product } from '../../core/entities/Product';
import type { IProductRepository } from '../../core/repositories/IProductRepository';
import type { IVendorSelectionRepository } from '../../core/repositories/IVendorSelectionRepository';

export interface CreateProductCommand {
  name: string;
  price: number;
  storageLocation: string;
  inventoryCategory: string;
  trackingUnit: string;
  parLevel: number;
  currentCount?: number;
  active?: boolean;
  defaultVendorItemId?: number;
}

export interface UpdateProductCommand {
  id: string | number;
  name?: string;
  price?: number;
  storageLocation?: string;
  inventoryCategory?: string;
  trackingUnit?: string;
  parLevel?: number;
  currentCount?: number;
  active?: boolean;
  defaultVendorItemId?: number;
}

export interface StockAdjustmentCommand {
  id: string | number;
  adjustment: number;
  reason?: string;
}

/**
 * Product Service
 * Handles business logic for product operations
 */
export class ProductService {
  constructor(
    private productRepository: IProductRepository
    // private vendorSelectionRepository: IVendorSelectionRepository // Temporarily disabled
  ) {}

  /**
   * Create a new product
   */
  async createProduct(command: CreateProductCommand): Promise<Product> {
    // Validation
    if (!command.name.trim()) {
      throw new Error('Product name is required');
    }
    if (command.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (!command.storageLocation.trim()) {
      throw new Error('Storage location is required');
    }
    if (!command.inventoryCategory.trim()) {
      throw new Error('Inventory category is required');
    }
    if (command.parLevel < 0) {
      throw new Error('Par level cannot be negative');
    }

    // Create entity
    const product = new Product(
      Date.now(), // Temporary ID, will be replaced by repository
      command.name,
      command.price,
      command.storageLocation,
      command.inventoryCategory,
      command.trackingUnit as any,
      command.parLevel,
      command.currentCount || 0,
      command.active ?? true,
      command.defaultVendorItemId
    );

    // Save to repository
    const savedProduct = await this.productRepository.save(product);
    return savedProduct;
  }

  /**
   * Update an existing product
   */
  async updateProduct(command: UpdateProductCommand): Promise<Product> {
    const product = await this.productRepository.findById(command.id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Update fields if provided
    if (command.name !== undefined) {
      product.updateName(command.name);
    }
    if (command.price !== undefined) {
      product.updatePrice(command.price);
    }
    if (command.storageLocation !== undefined) {
      product.updateStorageLocation(command.storageLocation);
    }
    if (command.parLevel !== undefined) {
      product.updateParLevel(command.parLevel);
    }
    if (command.currentCount !== undefined) {
      product.updateCurrentCount(command.currentCount);
    }
    if (command.active !== undefined) {
      if (command.active) {
        product.activate();
      } else {
        product.deactivate();
      }
    }
    if (command.defaultVendorItemId !== undefined) {
      product.setDefaultVendorItem(command.defaultVendorItemId);
    }

    return await this.productRepository.update(product);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string | number): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    await this.productRepository.delete(id);
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string | number): Promise<Product | null> {
    return await this.productRepository.findById(id);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    return await this.productRepository.findByCategory(category);
  }

  /**
   * Get products by storage location
   */
  async getProductsByLocation(location: string): Promise<Product[]> {
    return await this.productRepository.findByStorageLocation(location);
  }

  /**
   * Get active products only
   */
  async getActiveProducts(): Promise<Product[]> {
    return await this.productRepository.findActiveProducts();
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<Product[]> {
    return await this.productRepository.findLowStockProducts();
  }

  /**
   * Get out of stock products
   */
  async getOutOfStockProducts(): Promise<Product[]> {
    return await this.productRepository.findOutOfStockProducts();
  }

  /**
   * Get products that need reordering
   */
  async getProductsNeedingReorder(): Promise<Product[]> {
    return await this.productRepository.findProductsNeedingReorder();
  }

  /**
   * Adjust stock count for a product
   */
  async adjustStock(command: StockAdjustmentCommand): Promise<Product> {
    const product = await this.productRepository.findById(command.id);
    if (!product) {
      throw new Error('Product not found');
    }

    const newCount = product.currentCount + command.adjustment;
    if (newCount < 0) {
      throw new Error('Stock count cannot be negative');
    }

    return await this.productRepository.updateStockCount(command.id, newCount);
  }

  /**
   * Set stock count for a product
   */
  async setStockCount(id: string | number, count: number): Promise<Product> {
    if (count < 0) {
      throw new Error('Stock count cannot be negative');
    }

    return await this.productRepository.updateStockCount(id, count);
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary(): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    criticalStockCount: number;
    overstockedCount: number;
  }> {
    const products = await this.productRepository.findAll();
    
    const summary = products.reduce((acc, product) => {
      acc.totalProducts++;
      acc.totalValue += product.price * product.currentCount;
      
      const status = product.getStockStatus();
      switch (status) {
        case 'low_stock':
          acc.lowStockCount++;
          break;
        case 'out_of_stock':
          acc.outOfStockCount++;
          break;
        case 'critical':
          acc.criticalStockCount++;
          break;
        case 'overstocked':
          acc.overstockedCount++;
          break;
      }
      
      return acc;
    }, {
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      criticalStockCount: 0,
      overstockedCount: 0
    });

    return summary;
  }

  /**
   * Search products by name
   */
  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.productRepository.findAll();
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.inventoryCategory.toLowerCase().includes(searchTerm) ||
      product.storageLocation.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get products with vendor selection data
   */
  async getProductsWithVendorData(): Promise<Product[]> {
    const products = await this.productRepository.findAll();
    
    // This could be enhanced to include vendor selection information
    // For now, just return the products
    return products;
  }
}
