import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Product, type UnitType } from '@/core/entities/Product';
import { ProductService } from '@/application/services/ProductService';
import type { CreateProductCommand, UpdateProductCommand, StockAdjustmentCommand } from '@/application/services/ProductService';
import type { IProductRepository } from '@/core/repositories/IProductRepository';
import type { IVendorSelectionRepository } from '@/core/repositories/IVendorSelectionRepository';

// Mock repositories
const mockProductRepository: IProductRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByName: vi.fn(),
  findByCategory: vi.fn(),
  findByStorageLocation: vi.fn(),
  findActiveProducts: vi.fn(),
  findLowStockProducts: vi.fn(),
  findOutOfStockProducts: vi.fn(),
  findProductsNeedingReorder: vi.fn(),
  updateStockCount: vi.fn(),
  adjustStockCount: vi.fn()
};

const mockVendorSelectionRepository: IVendorSelectionRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByOrderId: vi.fn(),
  findByHouseOrderItemId: vi.fn(),
  findOverriddenSelections: vi.fn(),
  findSelectionsByStrategy: vi.fn(),
  overrideSelection: vi.fn(),
  resetOverride: vi.fn()
};

describe('ProductService', () => {
  let productService: ProductService;
  let mockProduct: Product;

  beforeEach(() => {
    vi.clearAllMocks();
    productService = new ProductService(mockProductRepository);
    
    // Create a mock product
    mockProduct = new Product(
      1,
      'Test Product',
      10.99,
      'Refrigerator',
      'produce',
      'each' as UnitType,
      50,
      25,
      true
    );
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      // Arrange
      const command: CreateProductCommand = {
        name: 'Test Product',
        price: 10.99,
        storageLocation: 'Refrigerator',
        inventoryCategory: 'produce',
        trackingUnit: 'each' as UnitType,
        parLevel: 50,
        currentCount: 25,
        active: true
      };

      vi.mocked(mockProductRepository.save).mockResolvedValue(mockProduct);

      // Act
      const result = await productService.createProduct(command);

      // Assert
      expect(result).toBe(mockProduct);
      expect(mockProductRepository.save).toHaveBeenCalledWith(expect.any(Product));
    });

    it('should throw error for invalid product name', async () => {
      // Arrange
      const command: CreateProductCommand = {
        name: '',
        price: 10.99,
        storageLocation: 'Refrigerator',
        inventoryCategory: 'produce',
        trackingUnit: 'each' as UnitType,
        parLevel: 50
      };

      // Act & Assert
      await expect(productService.createProduct(command)).rejects.toThrow('Product name is required');
    });

    it('should throw error for negative price', async () => {
      // Arrange
      const command: CreateProductCommand = {
        name: 'Test Product',
        price: -10.99,
        storageLocation: 'Refrigerator',
        inventoryCategory: 'produce',
        trackingUnit: 'each' as UnitType,
        parLevel: 50
      };

      // Act & Assert
      await expect(productService.createProduct(command)).rejects.toThrow('Price cannot be negative');
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      // Arrange
      const command: UpdateProductCommand = {
        id: 1,
        name: 'Updated Product Name',
        price: 12.99
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
      vi.mocked(mockProductRepository.update).mockResolvedValue(mockProduct);

      // Act
      const result = await productService.updateProduct(command);

      // Assert
      expect(result).toBe(mockProduct);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductRepository.update).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw error if product not found', async () => {
      // Arrange
      const command: UpdateProductCommand = {
        id: 999,
        name: 'Updated Product Name'
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(productService.updateProduct(command)).rejects.toThrow('Product not found');
    });
  });

  describe('adjustStock', () => {
    it('should adjust stock successfully', async () => {
      // Arrange
      const command: StockAdjustmentCommand = {
        id: 1,
        adjustment: 10,
        reason: 'Restock'
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
      vi.mocked(mockProductRepository.updateStockCount).mockResolvedValue(mockProduct);

      // Act
      const result = await productService.adjustStock(command);

      // Assert
      expect(result).toBe(mockProduct);
      expect(mockProductRepository.updateStockCount).toHaveBeenCalledWith(1, 35); // 25 + 10
    });

    it('should throw error for negative stock count', async () => {
      // Arrange
      const command: StockAdjustmentCommand = {
        id: 1,
        adjustment: -30 // This would make stock negative (25 - 30 = -5)
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);

      // Act & Assert
      await expect(productService.adjustStock(command)).rejects.toThrow('Stock count cannot be negative');
    });
  });

  describe('getInventorySummary', () => {
    it('should return correct inventory summary', async () => {
      // Arrange
      const products = [
        new Product(1, 'Product 1', 10, 'Refrigerator', 'produce', 'each' as UnitType, 50, 60, true), // Overstocked
        new Product(2, 'Product 2', 15, 'Freezer', 'meat', 'lb' as UnitType, 20, 5, true), // Low stock
        new Product(3, 'Product 3', 8, 'Pantry', 'grains', 'lb' as UnitType, 10, 0, true), // Out of stock
        new Product(4, 'Product 4', 12, 'Refrigerator', 'dairy', 'each' as UnitType, 30, 25, true) // Normal
      ];

      vi.mocked(mockProductRepository.findAll).mockResolvedValue(products);

      // Act
      const summary = await productService.getInventorySummary();

      // Assert
      expect(summary.totalProducts).toBe(4);
      expect(summary.totalValue).toBe(10 * 60 + 15 * 5 + 8 * 0 + 12 * 25); // 600 + 75 + 0 + 300 = 975
      expect(summary.lowStockCount).toBe(1); // Product 2
      expect(summary.outOfStockCount).toBe(1); // Product 3
      expect(summary.overstockedCount).toBe(1); // Product 1
      expect(summary.criticalStockCount).toBe(0);
    });
  });

  describe('searchProducts', () => {
    it('should search products by name', async () => {
      // Arrange
      const products = [
        new Product(1, 'Organic Spinach', 5, 'Refrigerator', 'produce', 'lb' as UnitType, 10, 5, true),
        new Product(2, 'Regular Spinach', 4, 'Refrigerator', 'produce', 'lb' as UnitType, 10, 3, true),
        new Product(3, 'Organic Tomatoes', 6, 'Refrigerator', 'produce', 'lb' as UnitType, 15, 8, true)
      ];

      vi.mocked(mockProductRepository.findAll).mockResolvedValue(products);

      // Act
      const results = await productService.searchProducts('spinach');

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Organic Spinach');
      expect(results[1].name).toBe('Regular Spinach');
    });

    it('should search products by category', async () => {
      // Arrange
      const products = [
        new Product(1, 'Organic Spinach', 5, 'Refrigerator', 'produce', 'lb' as UnitType, 10, 5, true),
        new Product(2, 'Chicken Breast', 8, 'Freezer', 'meat', 'lb' as UnitType, 20, 10, true),
        new Product(3, 'Organic Tomatoes', 6, 'Refrigerator', 'produce', 'lb' as UnitType, 15, 8, true)
      ];

      vi.mocked(mockProductRepository.findAll).mockResolvedValue(products);

      // Act
      const results = await productService.searchProducts('produce');

      // Assert
      expect(results).toHaveLength(2);
      expect(results.every(p => p.inventoryCategory === 'produce')).toBe(true);
    });
  });
});
