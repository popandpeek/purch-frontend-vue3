<template>
  <div class="inventory-management">
    <!-- Order Creation Loading Overlay -->
    <div v-if="creatingOrder" class="order-creation-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3>Creating Order...</h3>
        <p>Please wait while we generate your order from inventory data.</p>
      </div>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Inventory Management</h1>
        <p class="subtitle">Monitor stock levels and manage inventory</p>
      </div>
      <div class="header-actions">
        <BaseButton 
          variant="secondary" 
          size="md" 
          icon="↻" 
          :disabled="loading"
          @click="refreshData"
        >
          Refresh
        </BaseButton>
        <div class="create-order-dropdown">
          <BaseButton 
            variant="primary" 
            size="md" 
            icon="+" 
            :disabled="loading || creatingOrder"
            @click="showOrderOptions = !showOrderOptions"
          >
            Create Order
          </BaseButton>
          <div v-if="showOrderOptions" class="order-options">
            <BaseButton 
              variant="dropdown" 
              size="md" 
              @click="createOrderForCategory('out-of-stock')"
            >
              Out of Stock Items
              <span class="option-count">({{ outOfStockCount }})</span>
            </BaseButton>
            <BaseButton 
              variant="dropdown" 
              size="md" 
              @click="createOrderForCategory('low-stock')"
            >
              Low Stock Items
              <span class="option-count">({{ lowStockCount }})</span>
            </BaseButton>
            <BaseButton 
              variant="dropdown" 
              size="md" 
              @click="createOrderForCategory('critical')"
            >
              Critical Stock Items
              <span class="option-count">({{ criticalStockCount }})</span>
            </BaseButton>
            <BaseButton 
              variant="dropdown" 
              size="md" 
              @click="createOrderForCategory('to-par')"
            >
              Restock to Par Level
              <span class="option-count">({{ itemsNeedingRestock.length }})</span>
            </BaseButton>
            <BaseButton 
              variant="dropdown" 
              size="md" 
              :disabled="selectedItems.length === 0"
              @click="createOrderForCategory('selected')"
            >
              <span class="option-icon">✅</span>
              Selected Items Only
              <span class="option-count">({{ selectedItems.length }})</span>
            </BaseButton>
          </div>
        </div>
        <BaseButton 
          variant="secondary" 
          size="md" 
          @click="showBulkActions = !showBulkActions"
        >
          Bulk Actions
        </BaseButton>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search items..." 
          class="search-input"
        >
      </div>
      
      <div class="filter-chips">
        <button 
          v-for="category in categories" 
          :key="category"
          class="filter-chip"
          :class="{ active: selectedCategory === category }"
          @click="selectedCategory = selectedCategory === category ? null : category"
        >
          {{ category }}
        </button>
        <button 
          class="filter-chip"
          :class="{ active: showLowStockOnly }"
          @click="showLowStockOnly = !showLowStockOnly"
        >
          Low Stock Only
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="showBulkActions" class="bulk-actions">
      <div class="bulk-actions-content">
        <span class="bulk-info">{{ selectedItems.length }} items selected</span>
        <div class="bulk-buttons">
          <BaseButton 
            variant="secondary" 
            size="md" 
            @click="selectAll"
          >
            Select All
          </BaseButton>
          <BaseButton 
            variant="secondary" 
            size="md" 
            @click="clearSelection"
          >
            Clear
          </BaseButton>
          <BaseButton 
            variant="primary" 
            size="md" 
            :disabled="selectedItems.length === 0"
            @click="bulkOrder"
          >
            Order Selected
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-summary">
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ totalItems }}</h3>
          <p>Total Items</p>
        </div>
      </div>
      <div class="stat-card low-stock">
        <div class="stat-content">
          <h3>{{ lowStockCount }}</h3>
          <p>Low Stock</p>
        </div>
      </div>
      <div class="stat-card critical">
        <div class="stat-content">
          <h3>{{ criticalStockCount }}</h3>
          <p>Critical</p>
        </div>
      </div>
      <div class="stat-card out-of-stock">
        <div class="stat-content">
          <h3>{{ outOfStockCount }}</h3>
          <p>Out of Stock</p>
        </div>
      </div>
    </div>

    <!-- View Toggle -->
    <div class="view-controls">
      <div class="view-toggle">
        <button 
          class="toggle-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          ⊞ Grid
        </button>
        <button 
          class="toggle-btn"
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          ☰ List
        </button>
      </div>
      <div class="sort-controls">
        <select v-model="sortBy" class="sort-select">
          <option value="name">Name</option>
          <option value="stock">Stock Level</option>
          <option value="category">Category</option>
          <option value="price">Price</option>
        </select>
        <button 
          class="sort-btn"
          @click="sortAscending = !sortAscending"
        >
          {{ sortAscending ? '↑' : '↓' }}
        </button>
      </div>
    </div>

    <!-- Inventory Tabs -->
    <div class="inventory-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeInventoryTab === 'current' }"
        @click="activeInventoryTab = 'current'"
      >
        Current Inventory
        <span class="tab-count">{{ currentInventoryItems.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeInventoryTab === 'historical' }"
        @click="activeInventoryTab = 'historical'"
      >
        Past Inventories
        <span class="tab-count">{{ pastInventories.length }}</span>
      </button>
    </div>

    <!-- Current Inventory View -->
    <div v-if="activeInventoryTab === 'current'" class="inventory-content">
      <div v-if="loading && displayedItems.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <h3>No items found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <div v-else class="inventory-container" :class="viewMode">
        <InventoryCard
          v-for="item in displayedItems"
          :key="item.id"
          :item="item"
          :class="{ selected: selectedItems.includes(item.id) }"
          @adjust-count="handleAdjustCount"
          @view-details="handleViewDetails"
          @click="toggleSelection(item.id)"
        />
      </div>
    </div>

    <!-- Historical Inventories View -->
    <div v-else class="historical-content">
      <div v-if="loadingInventories" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading past inventories...</p>
      </div>

      <div v-else-if="pastInventories.length === 0" class="empty-state">
        <h3>No past inventories found</h3>
        <p>Past inventory records will appear here</p>
      </div>

      <div v-else class="inventory-list">
        <InventoryRecordCard
          v-for="inventory in pastInventories"
          :key="inventory.id"
          :inventory="inventory"
          @view="handleViewInventory"
          @compare="handleCompareInventory"
        />
      </div>
    </div>

    <!-- Infinite Scroll Loading -->
    <div v-if="loadingMore" class="loading-more">
      <div class="loading-spinner small"></div>
      <p>Loading more items...</p>
    </div>

    <!-- End of Results -->
    <div v-if="!hasMoreItems && displayedItems.length > 0" class="end-of-results">
      <p>You've reached the end of the inventory</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHouseItemsStore } from '../../stores/house-items';
import { useInventoriesStore } from '../../stores/inventories';
import { useAuthStore } from '../../stores/auth';
import httpClient from '../../http-common';
import InventoryCard from '../../components/inventories/InventoryCard.vue';
import InventoryRecordCard from '../../components/inventories/InventoryRecordCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import type { HouseItem, Inventory } from '../../api/model';

const router = useRouter();
const houseItemsStore = useHouseItemsStore();
const inventoriesStore = useInventoriesStore();
const authStore = useAuthStore();

// Reactive state
const loading = ref(false);
const creatingOrder = ref(false);
const searchQuery = ref('');
const selectedCategory = ref<string | null>(null);
const showLowStockOnly = ref(false);
const showBulkActions = ref(false);
const showOrderOptions = ref(false);
const selectedItems = ref<number[]>([]);
const viewMode = ref<'grid' | 'list'>('grid');
const sortBy = ref<'name' | 'stock' | 'category' | 'price'>('name');
const sortAscending = ref(true);
const itemsPerPage = 20;
const displayedItemsCount = ref(itemsPerPage);
const loadingMore = ref(false);
const activeInventoryTab = ref<'current' | 'historical'>('current');
const loadingInventories = ref(false);

// Computed properties
const items = computed(() => houseItemsStore.items);

const categories = computed(() => {
  const cats = new Set(items.value.map(item => item.inventory_category));
  return Array.from(cats).sort();
});

const filteredItems = computed(() => {
  let filtered = items.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.inventory_category.toLowerCase().includes(query) ||
      item.storage_location.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.inventory_category === selectedCategory.value);
  }

  // Low stock filter
  if (showLowStockOnly.value) {
    filtered = filtered.filter(item => item.current_count < item.par_level);
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortBy.value) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'stock':
        aVal = a.current_count / a.par_level;
        bVal = b.current_count / b.par_level;
        break;
      case 'category':
        aVal = a.inventory_category.toLowerCase();
        bVal = b.inventory_category.toLowerCase();
        break;
      case 'price':
        aVal = parseFloat(a.current_price_per_unit);
        bVal = parseFloat(b.current_price_per_unit);
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortAscending.value ? -1 : 1;
    if (aVal > bVal) return sortAscending.value ? 1 : -1;
    return 0;
  });

  return filtered;
});

const displayedItems = computed(() => {
  return filteredItems.value.slice(0, displayedItemsCount.value);
});

const hasMoreItems = computed(() => {
  return displayedItemsCount.value < filteredItems.value.length;
});

const currentInventoryItems = computed(() => items.value);
const pastInventories = computed(() => inventoriesStore.inventories);

// Stats
const totalItems = computed(() => items.value.length);
const lowStockCount = computed(() => 
  items.value.filter(item => item.current_count < item.par_level && item.current_count > 0).length
);
const criticalStockCount = computed(() => 
  items.value.filter(item => item.current_count < (item.par_level * 0.5) && item.current_count > 0).length
);
const outOfStockCount = computed(() => 
  items.value.filter(item => item.current_count === 0).length
);

const itemsNeedingRestock = computed(() => 
  items.value.filter(item => item.current_count < item.par_level)
);

// Methods
const refreshData = async () => {
  loading.value = true;
  try {
    await houseItemsStore.fetchHouseItems();
  } finally {
    loading.value = false;
  }
};

const toggleSelection = (itemId: number) => {
  const index = selectedItems.value.indexOf(itemId);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(itemId);
  }
};

const selectAll = () => {
  selectedItems.value = displayedItems.value.map((item: HouseItem) => item.id);
};

const clearSelection = () => {
  selectedItems.value = [];
};

const createOrderForCategory = async (category: string) => {
  showOrderOptions.value = false;
  creatingOrder.value = true;
  
  try {
    let itemsToOrder: HouseItem[] = [];
    
    switch (category) {
      case 'out-of-stock':
        itemsToOrder = items.value.filter(item => item.current_count === 0);
        break;
      case 'low-stock':
        itemsToOrder = items.value.filter(item => 
          item.current_count < item.par_level && item.current_count > 0
        );
        break;
      case 'critical':
        itemsToOrder = items.value.filter(item => 
          item.current_count < (item.par_level * 0.5) && item.current_count > 0
        );
        break;
      case 'to-par':
        itemsToOrder = items.value.filter(item => item.current_count < item.par_level);
        break;
      case 'selected':
        itemsToOrder = items.value.filter(item => selectedItems.value.includes(item.id));
        break;
    }
    
    if (itemsToOrder.length === 0) {
      alert('No items found for this category.');
      return;
    }
    
    // Create the order with calculated quantities
    const orderItems = itemsToOrder.map(item => {
      const quantity = calculateOrderQuantity(item);
      console.log(`Item ${item.id} (${item.name}): current=${item.current_count}, par=${item.par_level}, quantity=${quantity}`);
      return {
        house_item_id: item.id,
        quantity: quantity,
        notes: `Auto-generated from inventory management - ${category}`
      };
    }).filter(item => item.quantity > 0); // Only include items with positive quantities
    
    console.log('Order items to create:', orderItems);
    
    if (orderItems.length === 0) {
      alert('No items need to be ordered (all items are at or above par level).');
      return;
    }
    
    // Create the house order using HTTP client
    // Backend requires two-step process: create order first, then add items
    const orderResponse = await httpClient.post('/house-orders/', {
      status: 'draft',
      notes: `Auto-generated order for ${category} items from inventory management`
    });
    
    // Add each item individually (backend doesn't support bulk item creation)
    for (const item of orderItems) {
      try {
        await httpClient.post(`/house-orders/${orderResponse.data.id}/items/`, item);
      } catch (itemError) {
        console.error('Failed to add item:', item, itemError);
        throw new Error(`Failed to add item ${item.house_item_id} to order`);
      }
    }
    
    // Navigate to the order detail page for review
    router.push(`/orders/house/${orderResponse.data.id}`);
  } catch (error) {
    console.error('Error creating order:', error);
    alert('Failed to create order. Please try again.');
  } finally {
    creatingOrder.value = false;
  }
};

const calculateOrderQuantity = (item: HouseItem): number => {
  const currentCount = item.current_count || 0;
  const parLevel = item.par_level || 0;
  
  // Calculate how much we need to order to reach par level
  const needed = Math.max(0, parLevel - currentCount);
  
  // Add some buffer (10% extra) for safety
  return Math.ceil(needed * 1.1);
};


const bulkOrder = () => {
  // TODO: Implement bulk ordering
  console.log('Bulk order for items:', selectedItems.value);
};


const handleAdjustCount = (item: HouseItem) => {
  // TODO: Open adjust count modal
  console.log('Adjust count:', item);
};

const handleViewDetails = (item: HouseItem) => {
  router.push(`/items/${item.id}`);
};

const handleViewInventory = (inventory: Inventory) => {
  router.push(`/inventories/${inventory.id}`);
};

const handleCompareInventory = (inventory: Inventory) => {
  // TODO: Open comparison modal
  console.log('Compare inventory:', inventory);
};

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.create-order-dropdown')) {
    showOrderOptions.value = false;
  }
};

// Infinite scroll functionality
const loadMoreItems = async () => {
  if (loadingMore.value || !hasMoreItems.value) return;
  
  loadingMore.value = true;
  
  // Simulate loading delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500));
  
  displayedItemsCount.value += itemsPerPage;
  loadingMore.value = false;
};

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  // Load more when user is 200px from bottom
  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMoreItems();
  }
};


// Lifecycle
onMounted(async () => {
  if (items.value.length === 0) {
    await refreshData();
  }
  
  // Load past inventories
  if (pastInventories.value.length === 0) {
    await loadPastInventories();
  }
  
  // Add scroll listener for infinite scroll
  window.addEventListener('scroll', handleScroll);
  
  // Add click outside listener for dropdown
  document.addEventListener('click', handleClickOutside);
});

const loadPastInventories = async () => {
  loadingInventories.value = true;
  try {
    await inventoriesStore.fetchInventories();
  } finally {
    loadingInventories.value = false;
  }
};

onUnmounted(() => {
  // Remove scroll listener
  window.removeEventListener('scroll', handleScroll);
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.inventory-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* Order Creation Loading Overlay */
.order-creation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
}

.loading-content h3 {
  margin: 1rem 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.loading-content p {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  color: #2c3e50;
}

.subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.create-order-dropdown {
  position: relative;
}

.dropdown-arrow {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.create-order-dropdown button:active .dropdown-arrow {
  transform: rotate(180deg);
}

.order-options {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  margin-top: 0.5rem;
}


.option-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.option-count {
  margin-left: auto;
  background: #e9ecef;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.option-btn:not(:disabled):hover .option-count {
  background: #3d008d;
  color: white;
}


.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-chip {
  padding: 0.5rem 1rem;
  border: 2px solid #ecf0f1;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-chip:hover {
  border-color: #3498db;
}

.filter-chip.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.bulk-actions {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.bulk-actions-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-info {
  font-weight: 500;
  color: #2c3e50;
}

.bulk-buttons {
  display: flex;
  gap: 0.5rem;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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
}

.stat-card.low-stock {
  border-left: 4px solid #f39c12;
}

.stat-card.critical {
  border-left: 4px solid #e74c3c;
}

.stat-card.out-of-stock {
  border-left: 4px solid #c0392b;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.view-toggle {
  display: flex;
  background: #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #3498db;
  color: white;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  background: white;
}

.sort-btn {
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.inventory-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.inventory-container.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.inventory-tabs {
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

.tab-btn:hover {
  color: #3d008d;
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

.inventory-content,
.historical-content {
  min-height: 400px;
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #7f8c8d;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.end-of-results {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  font-style: italic;
}

@media (max-width: 768px) {
  .inventory-management {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .view-controls {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
