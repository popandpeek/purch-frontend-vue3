<template>
  <div class="product-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Product Management</h1>
        <p v-if="!vendorFilter">Manage house products and vendor items</p>
        <p v-else class="vendor-filter-info">
          Showing items for vendor ID: {{ vendorFilter }}
          <button class="clear-filter-btn" @click="clearVendorFilter">Clear</button>
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="createNewProduct">
          Add Product
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ totalProducts }}</h3>
          <p>Total Products</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ activeProducts }}</h3>
          <p>Active Products</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ lowStockProducts }}</h3>
          <p>Low Stock</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ vendorProducts }}</h3>
          <p>Vendor Items</p>
        </div>
      </div>
    </div>

    <!-- Product Tabs -->
    <div class="product-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'house' && !vendorFilter }"
        @click="switchToHouseTab"
        :disabled="!!vendorFilter"
      >
        House Products
        <span class="tab-count">{{ houseProducts.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'vendor' || !!vendorFilter }"
        @click="activeTab = 'vendor'"
      >
        Vendor Items
        <span class="tab-count">{{ vendorItems.length }}</span>
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search products..."
          class="search-input"
        >
      </div>
      <div class="filter-controls">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select v-if="activeTab === 'vendor'" v-model="vendorFilter" class="filter-select">
          <option value="">All Vendors</option>
          <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id.toString()">
            {{ vendor.name }}
          </option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="stock">Sort by Stock</option>
        </select>
        <button class="btn btn-outline" @click="refreshProducts">
          Refresh
        </button>
      </div>
    </div>

    <!-- Product Grid -->
    <div class="product-grid">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading products...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <h3>No products found</h3>
        <p>Try adjusting your search or add a new product</p>
      </div>

      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        :type="activeTab"
        @view="viewProduct"
        @edit="editProduct"
        @delete="deleteProduct"
        @order="orderProduct"
        @order-history="viewOrderHistory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useHouseItemsStore } from '../../stores/house-items';
import { useVendorItemStore } from '../../stores/vendor-items';
import { useVendorStore } from '../../stores/vendors';
import ProductCard from '../../components/products/ProductCard.vue';
import type { HouseItem, VendorItem } from '../../api/model';

const router = useRouter();
const route = useRoute();
const houseItemsStore = useHouseItemsStore();
const vendorItemsStore = useVendorItemStore();
const vendorStore = useVendorStore();

// Reactive state
const activeTab = ref<'house' | 'vendor'>('house');
const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref<'name' | 'price' | 'stock'>('name');
const loading = ref(false);
const vendorFilter = ref<string>('');

// Computed properties
const houseProducts = computed(() => houseItemsStore.items);
const vendorItems = computed(() => vendorItemsStore.vendorItems);
const vendors = computed(() => vendorStore.vendors);

const currentProducts = computed(() => {
  // If vendor filter is active, always show vendor items
  if (vendorFilter.value) {
    return vendorItems.value;
  }
  return activeTab.value === 'house' ? houseProducts.value : vendorItems.value;
});


const filteredProducts = computed(() => {
  let filtered = currentProducts.value;

  // Vendor filter (applies when vendor filter is set)
  if (vendorFilter.value) {
    filtered = filtered.filter(product => 
      (product as any).vendor_id === parseInt(vendorFilter.value)
    );
  }

        // Search filter
        if (searchQuery.value) {
          const query = searchQuery.value.toLowerCase();
          filtered = filtered.filter(product => {
            const name = product.name || (product as any).product_name || '';
            const description = (product as any).description || '';
            const sku = (product as any).sku || '';
            const vendorSku = (product as any).vendor_product_id || '';
            
            return name.toLowerCase().includes(query) ||
                   description.toLowerCase().includes(query) ||
                   sku.toLowerCase().includes(query) ||
                   vendorSku.toLowerCase().includes(query);
          });
        }


  // Status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active';
    filtered = filtered.filter(product => 
      (product as any).active === isActive
    );
  }

  // Sort
  switch (sortBy.value) {
    case 'name':
      filtered = [...filtered].sort((a, b) => {
        const nameA = a.name || (a as any).product_name || '';
        const nameB = b.name || (b as any).product_name || '';
        return nameA.localeCompare(nameB);
      });
      break;
        case 'price':
          filtered = [...filtered].sort((a, b) => {
            const priceA = parseFloat((a as any).current_price_per_unit || (a as any).price_per_case || '0');
            const priceB = parseFloat((b as any).current_price_per_unit || (b as any).price_per_case || '0');
            return priceA - priceB;
          });
          break;
    case 'stock':
      filtered = [...filtered].sort((a, b) => {
        const stockA = (a as any).current_count || (a as any).quantity || 0;
        const stockB = (b as any).current_count || (b as any).quantity || 0;
        return stockB - stockA;
      });
      break;
  }

  return filtered;
});

const totalProducts = computed(() => houseProducts.value.length + vendorItems.value.length);
const activeProducts = computed(() => 
  houseProducts.value.filter(item => item.active).length
);
const lowStockProducts = computed(() => 
  houseProducts.value.filter(item => item.current_count < item.par_level && item.current_count > 0).length
);
const vendorProducts = computed(() => vendorItems.value.length);

// Methods
const createNewProduct = () => {
  if (activeTab.value === 'house') {
    router.push('/items/registration');
  } else {
    router.push('/vendors/items/new');
  }
};

const viewProduct = (product: HouseItem | VendorItem) => {
  if (activeTab.value === 'house') {
    router.push(`/items/${product.id}`);
  } else {
    router.push(`/vendors/items/${product.id}`);
  }
};

const editProduct = (product: HouseItem | VendorItem) => {
  if (activeTab.value === 'house') {
    router.push(`/items/${product.id}/edit`);
  } else {
    router.push(`/vendors/items/${product.id}/edit`);
  }
};

const deleteProduct = async (product: HouseItem | VendorItem) => {
  const productName = product.name || (product as any).product_name || 'this product';
  if (confirm(`Are you sure you want to delete ${productName}?`)) {
    // TODO: Implement delete functionality
  }
};

const orderProduct = (product: HouseItem | VendorItem) => {
  if (activeTab.value === 'house') {
    router.push(`/orders/new?item=${product.id}`);
  } else {
    router.push(`/vendors/orders/new?item=${product.id}`);
  }
};

const viewOrderHistory = (product: HouseItem | VendorItem) => {
  if (activeTab.value === 'vendor') {
    // Navigate to vendor item order history page
    router.push(`/vendors/items/${product.id}/orders`);
  }
};

const refreshProducts = async () => {
  loading.value = true;
  try {
    if (activeTab.value === 'house') {
      await houseItemsStore.fetchHouseItems();
    } else {
      await vendorItemsStore.fetchAllVendorItems();
    }
  } finally {
    loading.value = false;
  }
};

// Methods
const switchToHouseTab = () => {
  if (!vendorFilter.value) {
    activeTab.value = 'house';
  }
};

const clearVendorFilter = () => {
  vendorFilter.value = '';
  activeTab.value = 'house';
  router.push('/items');
};

// Lifecycle
onMounted(async () => {
  // Check for vendor filter in URL query
  const vendorId = route.query.vendor as string;
  
  if (vendorId) {
    vendorFilter.value = vendorId;
    // Force vendor tab to be active when vendor filter is set
    activeTab.value = 'vendor';
  } else {
    // No vendor filter - ensure we start fresh with house items
    vendorFilter.value = '';
    activeTab.value = 'house';
  }

  // Load data
  if (houseProducts.value.length === 0) {
    await houseItemsStore.fetchHouseItems();
  }
  if (vendorItems.value.length === 0) {
    await vendorItemsStore.fetchAllVendorItems();
  }
  
  if (vendors.value.length === 0) {
    await vendorStore.fetchVendors();
  }
});

// Watch for vendor filter changes
watch(vendorFilter, (newValue) => {
  if (newValue) {
    // Navigate to direct vendor items page instead of filtering
    router.push(`/vendors/${newValue}/items`);
  }
});

// Watch for route changes to handle navigation
watch(() => route.query.vendor, (newVendorId) => {
  if (newVendorId) {
    vendorFilter.value = newVendorId as string;
    activeTab.value = 'vendor';
  } else {
    // No vendor in query - clear filter and go to house items
    vendorFilter.value = '';
    activeTab.value = 'house';
  }
});
</script>

<style scoped>
.product-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 2rem;
}

.header-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.vendor-filter-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #e8f4fd;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #3498db;
  color: #2980b9 !important;
  font-weight: 500;
}

.filter-icon {
  font-size: 1.1rem;
}

.clear-filter-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.clear-filter-btn:hover {
  background: #c0392b;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.product-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ecf0f1;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #7f8c8d;
  transition: all 0.2s ease;
}

.tab-btn:hover:not(:disabled) {
  color: #3d008d;
  background: #f8f9fa;
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #3d008d;
  border-bottom-color: #3d008d;
  background: #e8f4fd;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-count {
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tab-btn.active .tab-count {
  background: #3d008d;
  color: white;
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  font-size: 1.1rem;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  padding: 4rem 2rem;
  text-align: center;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #ecf0f1;
  border-top: 3px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.empty-state p {
  margin: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover {
  background: #2a0063;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 1200px) {
  .filter-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .filter-controls .btn {
    grid-column: 1 / -1;
    justify-self: stretch;
  }
}

@media (max-width: 1024px) {
  .product-management {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-box {
    max-width: none;
    width: 100%;
  }
  
  .filter-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .filter-controls .btn {
    grid-column: 1 / -1;
    justify-self: stretch;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .filter-controls {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .filter-controls .btn {
    grid-column: 1;
  }
}
</style>
