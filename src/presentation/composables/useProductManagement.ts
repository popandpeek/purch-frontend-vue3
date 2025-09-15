import { ref, computed, readonly } from 'vue';
import { Product } from '@/core/entities/Product';
import { VendorSelection } from '@/core/entities/VendorSelection';
import { ProductService } from '@/application/services/ProductService';
import type { CreateProductCommand, UpdateProductCommand, StockAdjustmentCommand } from '@/application/services/ProductService';
import { VendorSelectionService } from '@/application/services/VendorSelectionService';
import type { OverrideSelectionCommand } from '@/application/services/VendorSelectionService';
import { ProductRepository } from '@/infrastructure/repositories/ProductRepository';
import { VendorSelectionRepository } from '@/infrastructure/repositories/VendorSelectionRepository';
import { ApiClient } from '@/infrastructure/api/ApiClient';

/**
 * Product Management Composable
 * Provides reactive state management for product operations using the new OOP architecture
 */
export function useProductManagement() {
  // State
  const products = ref<Product[]>([]);
  const selectedProduct = ref<Product | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Services (would be injected in real app)
  const apiClient = new ApiClient();
  const productRepository = new ProductRepository(apiClient);
  const vendorSelectionRepository = new VendorSelectionRepository(apiClient);
  const productService = new ProductService(productRepository);
  const vendorSelectionService = new VendorSelectionService(vendorSelectionRepository);

  // Computed properties
  const activeProducts = computed(() => 
    products.value.filter(p => p.active)
  );

  const lowStockProducts = computed(() => 
    products.value.filter(p => p.isLowStock())
  );

  const outOfStockProducts = computed(() => 
    products.value.filter(p => p.isOutOfStock())
  );

  const criticalStockProducts = computed(() => 
    products.value.filter(p => p.isCriticalStock())
  );

  const productsNeedingReorder = computed(() => 
    products.value.filter(p => p.needsReorder())
  );

  const inventorySummary = computed(() => {
    return products.value.reduce((summary, product) => {
      summary.totalProducts++;
      summary.totalValue += product.price * product.currentCount;
      
      const status = product.getStockStatus();
      switch (status) {
        case 'low_stock':
          summary.lowStockCount++;
          break;
        case 'out_of_stock':
          summary.outOfStockCount++;
          break;
        case 'critical':
          summary.criticalStockCount++;
          break;
        case 'overstocked':
          summary.overstockedCount++;
          break;
      }
      
      return summary;
    }, {
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      criticalStockCount: 0,
      overstockedCount: 0
    });
  });

  // Actions
  const fetchProducts = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    
    try {
      products.value = await productService.getAllProducts();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch products';
      console.error('Error fetching products:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchProductById = async (id: string | number): Promise<Product | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      const product = await productService.getProductById(id);
      selectedProduct.value = product;
      return product;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch product';
      console.error('Error fetching product:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createProduct = async (command: CreateProductCommand): Promise<Product | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      const product = await productService.createProduct(command);
      products.value.push(product);
      return product;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create product';
      console.error('Error creating product:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (command: UpdateProductCommand): Promise<Product | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      const product = await productService.updateProduct(command);
      
      // Update the product in the local array
      const index = products.value.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products.value[index] = product;
      }
      
      // Update selected product if it's the same
      if (selectedProduct.value?.id === product.id) {
        selectedProduct.value = product;
      }
      
      return product;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update product';
      console.error('Error updating product:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (id: string | number): Promise<boolean> => {
    loading.value = true;
    error.value = null;
    
    try {
      await productService.deleteProduct(id);
      
      // Remove from local array
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value.splice(index, 1);
      }
      
      // Clear selected product if it's the deleted one
      if (selectedProduct.value?.id === id) {
        selectedProduct.value = null;
      }
      
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete product';
      console.error('Error deleting product:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const adjustStock = async (command: StockAdjustmentCommand): Promise<Product | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      const product = await productService.adjustStock(command);
      
      // Update the product in the local array
      const index = products.value.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products.value[index] = product;
      }
      
      // Update selected product if it's the same
      if (selectedProduct.value?.id === product.id) {
        selectedProduct.value = product;
      }
      
      return product;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to adjust stock';
      console.error('Error adjusting stock:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const setStockCount = async (id: string | number, count: number): Promise<Product | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      const product = await productService.setStockCount(id, count);
      
      // Update the product in the local array
      const index = products.value.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products.value[index] = product;
      }
      
      // Update selected product if it's the same
      if (selectedProduct.value?.id === product.id) {
        selectedProduct.value = product;
      }
      
      return product;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to set stock count';
      console.error('Error setting stock count:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      return await productService.searchProducts(query);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search products';
      console.error('Error searching products:', err);
      return [];
    }
  };

  const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
      return await productService.getProductsByCategory(category);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get products by category';
      console.error('Error getting products by category:', err);
      return [];
    }
  };

  const getProductsByLocation = async (location: string): Promise<Product[]> => {
    try {
      return await productService.getProductsByLocation(location);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get products by location';
      console.error('Error getting products by location:', err);
      return [];
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  const setSelectedProduct = (product: Product | null): void => {
    selectedProduct.value = product;
  };

  // Vendor Selection Actions
  const getVendorSelectionsForOrder = async (orderId: string | number): Promise<VendorSelection[]> => {
    try {
      return await vendorSelectionService.getVendorSelectionsForOrder(orderId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get vendor selections';
      console.error('Error getting vendor selections:', err);
      return [];
    }
  };

  const overrideVendorSelection = async (command: OverrideSelectionCommand): Promise<VendorSelection | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      return await vendorSelectionService.overrideSelection(command);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to override vendor selection';
      console.error('Error overriding vendor selection:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const resetVendorSelectionOverride = async (itemId: string | number): Promise<VendorSelection | null> => {
    loading.value = true;
    error.value = null;
    
    try {
      return await vendorSelectionService.resetOverride(itemId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reset vendor selection override';
      console.error('Error resetting vendor selection override:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getVendorSelectionAnalysis = async () => {
    try {
      return await vendorSelectionService.getVendorSelectionAnalysis();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get vendor selection analysis';
      console.error('Error getting vendor selection analysis:', err);
      return null;
    }
  };

  return {
    // State (readonly)
    products: readonly(products),
    selectedProduct: readonly(selectedProduct),
    loading: readonly(loading),
    error: readonly(error),

    // Computed properties
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    criticalStockProducts,
    productsNeedingReorder,
    inventorySummary,

    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    setStockCount,
    searchProducts,
    getProductsByCategory,
    getProductsByLocation,
    clearError,
    setSelectedProduct,

    // Vendor Selection Actions
    getVendorSelectionsForOrder,
    overrideVendorSelection,
    resetVendorSelectionOverride,
    getVendorSelectionAnalysis
  };
}
