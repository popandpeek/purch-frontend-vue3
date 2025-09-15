import { describe, it, expect, beforeEach } from 'vitest';
import { Product, type UnitType } from '@/core/entities/Product';

describe('Product Entity', () => {
  let product: Product;

  beforeEach(() => {
    product = new Product(
      1,
      'Organic Spinach',
      5.99,
      'Refrigerator',
      'produce',
      'lb' as UnitType,
      20,
      15,
      true
    );
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a product with correct properties', () => {
      expect(product.id).toBe(1);
      expect(product.name).toBe('Organic Spinach');
      expect(product.price).toBe(5.99);
      expect(product.storageLocation).toBe('Refrigerator');
      expect(product.inventoryCategory).toBe('produce');
      expect(product.trackingUnit).toBe('lb');
      expect(product.parLevel).toBe(20);
      expect(product.currentCount).toBe(15);
      expect(product.active).toBe(true);
    });

    it('should throw error for invalid product name', () => {
      expect(() => {
        new Product(1, '', 5.99, 'Refrigerator', 'produce', 'lb' as UnitType, 20, 15);
      }).toThrow('Product name is required');
    });

    it('should throw error for negative price', () => {
      expect(() => {
        new Product(1, 'Test Product', -5.99, 'Refrigerator', 'produce', 'lb' as UnitType, 20, 15);
      }).toThrow('Price cannot be negative');
    });
  });

  describe('Stock Status Methods', () => {
    it('should identify low stock correctly', () => {
      // Current count (15) is less than par level (20)
      expect(product.isLowStock()).toBe(true);
      expect(product.getStockStatus()).toBe('low_stock');
    });

    it('should identify out of stock correctly', () => {
      product.updateCurrentCount(0);
      expect(product.isOutOfStock()).toBe(true);
      expect(product.getStockStatus()).toBe('out_of_stock');
    });

    it('should identify critical stock correctly', () => {
      // Critical is less than 50% of par level (10)
      product.updateCurrentCount(8);
      expect(product.isCriticalStock()).toBe(true);
      expect(product.getStockStatus()).toBe('critical');
    });

    it('should identify overstocked correctly', () => {
      // Overstocked is more than 200% of par level (40)
      product.updateCurrentCount(45);
      expect(product.isOverstocked()).toBe(true);
      expect(product.getStockStatus()).toBe('overstocked');
    });

    it('should identify normal stock correctly', () => {
      product.updateCurrentCount(25); // Between par level and 2x par level
      expect(product.getStockStatus()).toBe('normal');
    });
  });

  describe('Stock Management', () => {
    it('should update stock count correctly', () => {
      product.updateCurrentCount(30);
      expect(product.currentCount).toBe(30);
    });

    it('should adjust stock count correctly', () => {
      product.adjustCount(10);
      expect(product.currentCount).toBe(25); // 15 + 10
    });

    it('should throw error for negative stock count', () => {
      expect(() => {
        product.updateCurrentCount(-5);
      }).toThrow('Current count cannot be negative');
    });

    it('should throw error for negative adjustment', () => {
      expect(() => {
        product.adjustCount(-20); // This would make stock negative (15 - 20 = -5)
      }).toThrow('Current count cannot be negative');
    });
  });

  describe('Business Logic Methods', () => {
    it('should determine if reorder is needed', () => {
      expect(product.needsReorder()).toBe(true); // Low stock
      
      product.updateCurrentCount(25);
      expect(product.needsReorder()).toBe(false); // Normal stock
    });

    it('should calculate reorder quantity correctly', () => {
      const reorderQty = product.calculateReorderQuantity();
      expect(reorderQty).toBe(5); // parLevel (20) - currentCount (15)
    });

    it('should return zero reorder quantity when stock is adequate', () => {
      product.updateCurrentCount(25);
      const reorderQty = product.calculateReorderQuantity();
      expect(reorderQty).toBe(0);
    });

    it('should calculate stock percentage correctly', () => {
      const percentage = product.getStockPercentage();
      expect(percentage).toBe(75); // (15 / 20) * 100
    });

    it('should cap stock percentage at 100', () => {
      product.updateCurrentCount(30);
      const percentage = product.getStockPercentage();
      expect(percentage).toBe(100);
    });
  });

  describe('Display Methods', () => {
    it('should return correct display name', () => {
      expect(product.getDisplayName()).toBe('Organic Spinach');
    });

    it('should format price correctly', () => {
      expect(product.getFormattedPrice()).toBe('$5.99');
    });

    it('should return correct stock display text', () => {
      expect(product.getStockDisplayText()).toBe('Low Stock');
      
      product.updateCurrentCount(25);
      expect(product.getStockDisplayText()).toBe('In Stock');
      
      product.updateCurrentCount(0);
      expect(product.getStockDisplayText()).toBe('Out of Stock');
    });
  });

  describe('Update Methods', () => {
    it('should update name correctly', () => {
      product.updateName('Fresh Organic Spinach');
      expect(product.name).toBe('Fresh Organic Spinach');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        product.updateName('');
      }).toThrow('Product name cannot be empty');
    });

    it('should update price correctly', () => {
      product.updatePrice(6.99);
      expect(product.price).toBe(6.99);
    });

    it('should throw error for negative price', () => {
      expect(() => {
        product.updatePrice(-1.00);
      }).toThrow('Price cannot be negative');
    });

    it('should update storage location correctly', () => {
      product.updateStorageLocation('Freezer');
      expect(product.storageLocation).toBe('Freezer');
    });

    it('should throw error for empty storage location', () => {
      expect(() => {
        product.updateStorageLocation('');
      }).toThrow('Storage location cannot be empty');
    });

    it('should update par level correctly', () => {
      product.updateParLevel(25);
      expect(product.parLevel).toBe(25);
    });

    it('should throw error for negative par level', () => {
      expect(() => {
        product.updateParLevel(-5);
      }).toThrow('Par level cannot be negative');
    });
  });

  describe('Activation Methods', () => {
    it('should activate product correctly', () => {
      product.deactivate();
      expect(product.active).toBe(false);
      
      product.activate();
      expect(product.active).toBe(true);
    });

    it('should deactivate product correctly', () => {
      product.deactivate();
      expect(product.active).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const json = product.toJSON();
      
      expect(json.id).toBe(1);
      expect(json.name).toBe('Organic Spinach');
      expect(json.price).toBe(5.99);
      expect(json.storage_location).toBe('Refrigerator');
      expect(json.inventory_category).toBe('produce');
      expect(json.tracking_unit).toBe('lb');
      expect(json.par_level).toBe(20);
      expect(json.current_count).toBe(15);
      expect(json.active).toBe(true);
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });

    it('should create from API data correctly', () => {
      const apiData = {
        id: 2,
        name: 'API Test Product',
        current_price_per_unit: 7.50,
        storage_location: 'Pantry',
        inventory_category: 'grains',
        tracking_unit: 'lb',
        par_level: 30,
        current_count: 20,
        active: true,
        default_vendor_item_id: 123,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      };

      const product = Product.fromAPI(apiData);
      
      expect(product.id).toBe(2);
      expect(product.name).toBe('API Test Product');
      expect(product.price).toBe(7.50);
      expect(product.storageLocation).toBe('Pantry');
      expect(product.inventoryCategory).toBe('grains');
      expect(product.trackingUnit).toBe('lb');
      expect(product.parLevel).toBe(30);
      expect(product.currentCount).toBe(20);
      expect(product.active).toBe(true);
      expect(product.defaultVendorItemId).toBe(123);
      expect(product.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(product.updatedAt).toEqual(new Date('2024-01-02T00:00:00Z'));
    });
  });
});
