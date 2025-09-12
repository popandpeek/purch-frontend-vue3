<template>
  <div class="house-order-list">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Create New House Order</h1>
        <p class="page-description">Create a new house order and add items</p>
      </div>
      <div class="header-actions">
        <button @click="createOrder" class="btn btn-primary">
          Order
        </button>
      </div>
    </div>

    <div class="new-order">

      <!-- Order Details -->
      <div class="section">
        <h3>Order Details</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Order Date</label>
            <input v-model="orderData.date" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="orderData.status" class="form-select">
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="section">
        <h3>Order Items</h3>
        
        <!-- Item Search -->
        <div class="item-search">
          <div class="search-box">
            <input 
              v-model="itemSearchQuery" 
              type="text" 
              placeholder="Search house items..." 
              class="search-input"
              @input="searchItems"
            >
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="itemSearchQuery" class="search-results">
          <div v-if="searchLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Searching items...</p>
          </div>
          
          <div v-else-if="searchResults.length === 0" class="empty-state">
            <p>No items found matching "{{ itemSearchQuery }}"</p>
          </div>
          
          <div v-else class="item-results">
            <div 
              v-for="item in searchResults" 
              :key="item.id" 
              class="item-card"
            >
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p class="item-details">
                  {{ formatInventoryCategory(item.inventory_category) }} • 
                  {{ formatStorageLocation(item.storage_location) }} • 
                  {{ item.tracking_unit }}
                </p>
                <div class="item-pricing">
                  <span class="current-price">${{ item.current_price_per_unit }}/{{ item.tracking_unit }}</span>
                  <span class="inventory-level" :class="getInventoryLevelClass(item)">
                    Stock: {{ item.current_count }} (Par: {{ item.par_level }})
                  </span>
                </div>
              </div>
              <button 
                @click="addItemToOrder(item)" 
                class="btn btn-sm btn-primary"
                :disabled="isItemInOrder(item.id)"
              >
                {{ isItemInOrder(item.id) ? 'Added' : 'Add to Order' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Selected Items -->
        <div v-if="orderItems.length > 0" class="selected-items">
          <h3>Selected Items ({{ orderItems.length }})</h3>
          <div class="items-list">
            <div 
              v-for="(orderItem, index) in orderItems" 
              :key="orderItem.house_item.id" 
              class="selected-item"
            >
              <div class="item-details">
                <h4>{{ orderItem.house_item.name }}</h4>
                <p class="item-meta">
                  {{ formatInventoryCategory(orderItem.house_item.inventory_category) }} • 
                  ${{ orderItem.house_item.current_price_per_unit }}/{{ orderItem.house_item.tracking_unit }}
                </p>
              </div>
              
              <div class="item-controls">
                <div class="quantity-control">
                  <label class="control-label">Quantity:</label>
                  <input 
                    v-model.number="orderItem.quantity" 
                    type="number" 
                    min="1" 
                    class="quantity-input"
                  >
                  <span class="unit">{{ orderItem.house_item.tracking_unit }}</span>
                </div>
                
                <div class="priority-control">
                  <label class="control-label">Priority:</label>
                  <select v-model="orderItem.priority" class="priority-select">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div class="item-total">
                  <span class="total-label">Total:</span>
                  <span class="total-value">${{ getItemTotal(orderItem).toFixed(2) }}</span>
                </div>
                
                <button 
                  @click="removeItemFromOrder(index)" 
                  class="btn btn-sm btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          
          <div class="order-summary">
            <div class="summary-row">
              <span class="summary-label">Total Items:</span>
              <span class="summary-value">{{ orderItems.length }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Quantity:</span>
              <span class="summary-value">{{ totalQuantity }}</span>
            </div>
            <div class="summary-row total-row">
              <span class="summary-label">Estimated Total:</span>
              <span class="summary-value">${{ totalEstimatedCost.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div v-if="orderItems.length === 0 && !itemSearchQuery" class="empty-state">
          <p>No items added yet. Search for items above to add them to your order.</p>
        </div>
      </div>

      <!-- Notes -->
      <div class="section">
        <h3>Notes</h3>
        <textarea 
          v-model="orderData.notes" 
          class="form-textarea" 
          placeholder="Add any notes for this order..."
          rows="4"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHouseItemsStore } from '../../stores/house-items';
import type { HouseItem } from '../../api/model';

const router = useRouter();
const houseItemsStore = useHouseItemsStore();
const loading = ref(false);
const error = ref<string | null>(null);
const itemSearchQuery = ref('');
const searchLoading = ref(false);
const searchResults = ref<HouseItem[]>([]);

const orderData = ref({
  date: new Date().toISOString().split('T')[0],
  status: 'draft',
  notes: ''
});

const orderItems = ref<Array<{
  house_item: HouseItem;
  quantity: number;
  priority: 'low' | 'normal' | 'high';
}>>([]);


const totalQuantity = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

const totalEstimatedCost = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    const price = parseFloat(item.house_item.current_price_per_unit || '0');
    return sum + (price * item.quantity);
  }, 0);
});


const searchItems = async () => {
  if (!itemSearchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchLoading.value = true;
  try {
    await houseItemsStore.fetchHouseItems();
    const query = itemSearchQuery.value.toLowerCase();
    searchResults.value = houseItemsStore.items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.inventory_category.toLowerCase().includes(query) ||
      item.storage_location.toLowerCase().includes(query)
    );
  } finally {
    searchLoading.value = false;
  }
};

const addItemToOrder = (item: HouseItem) => {
  const existingItem = orderItems.value.find(orderItem => orderItem.house_item.id === item.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    orderItems.value.push({
      house_item: item,
      quantity: 1,
      priority: 'normal'
    });
  }
};

const isItemInOrder = (itemId: number) => {
  return orderItems.value.some(orderItem => orderItem.house_item.id === itemId);
};

const removeItemFromOrder = (index: number) => {
  orderItems.value.splice(index, 1);
};


const getItemTotal = (orderItem: any) => {
  const price = parseFloat(orderItem.house_item.current_price_per_unit || '0');
  return price * orderItem.quantity;
};

const formatInventoryCategory = (category: string) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatStorageLocation = (location: string) => {
  return location.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getInventoryLevelClass = (item: HouseItem) => {
  const current = item.current_count || 0;
  const par = item.par_level || 0;
  
  if (current === 0) return 'out-of-stock';
  if (current < par * 0.5) return 'low-stock';
  if (current < par) return 'below-par';
  return 'good-stock';
};




const loadData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await houseItemsStore.fetchHouseItems();
  } catch (err: any) {
    error.value = err.message || 'Failed to load data';
  } finally {
    loading.value = false;
  }
};

const createOrder = async () => {
  if (orderItems.value.length === 0) {
    alert('Please add at least one item to the order');
    return;
  }
  
  try {
    const orderPayload = {
      ...orderData.value,
      items: orderItems.value.map(item => ({
        house_item_id: item.house_item.id,
        quantity: item.quantity,
        priority: item.priority
      })),
      total_estimated_cost: totalEstimatedCost.value
    };
    
    // TODO: Implement actual order creation
    console.log('Creating order:', orderPayload);
    alert('Order created successfully!');
    router.push('/orders');
  } catch (err: any) {
    alert('Failed to create order: ' + err.message);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.house-order-list {
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

.page-description {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.new-order {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.order-type-selector {
  display: flex;
  gap: 1rem;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: 2px solid #ecf0f1;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.type-btn:hover {
  border-color: #3d008d;
  background: #f8f9ff;
}

.type-btn.active {
  border-color: #3d008d;
  background: #e8f4fd;
  color: #3d008d;
}

.type-icon {
  font-size: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.add-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.add-item .form-select {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  background: white;
  border-radius: 8px;
  border: 1px solid #ecf0f1;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.item-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  text-align: center;
}

.item-total {
  font-weight: 600;
  color: #27ae60;
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e74c3c;
  background: white;
  color: #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #e74c3c;
  color: white;
}

.order-summary {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.total {
  border-top: 1px solid #ecf0f1;
  padding-top: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
}

.summary-label {
  color: #2c3e50;
}

.summary-value {
  color: #27ae60;
  font-weight: 600;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline {
  background: transparent;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover {
  background: #3d008d;
  color: white;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover {
  background: #2d0066;
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .order-type-selector {
    flex-direction: column;
  }
  
  .add-item {
    flex-direction: column;
  }
  
  .item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .item-controls {
    width: 100%;
    justify-content: space-between;
  }
}

/* Search Styles */
.item-search {
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 2px rgba(61, 0, 141, 0.1);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-results {
  margin-top: 1rem;
}

.item-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.item-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.item-card:hover {
  border-color: #3d008d;
  box-shadow: 0 2px 8px rgba(61, 0, 141, 0.1);
}

.item-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.item-details {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.item-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.current-price {
  font-weight: 600;
  color: #27ae60;
}

.inventory-level {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.inventory-level.out-of-stock {
  background: #fdf2f2;
  color: #dc2626;
}

.inventory-level.low-stock {
  background: #fef3c7;
  color: #d97706;
}

.inventory-level.below-par {
  background: #fef3c7;
  color: #d97706;
}

.inventory-level.good-stock {
  background: #f0fdf4;
  color: #16a34a;
}

/* Selected Items Styles */
.selected-items {
  margin-top: 2rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.selected-item {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
}

.item-details h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.item-meta {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.item-controls {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 1rem;
  align-items: center;
}

.quantity-control,
.priority-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #7f8c8d;
}

.quantity-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  text-align: center;
}

.unit {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-left: 0.5rem;
}

.priority-select {
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 0.9rem;
}

.item-total {
  text-align: right;
}

.total-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-right: 0.5rem;
}

.total-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.order-summary {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #ecf0f1;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.summary-row.total-row {
  border-top: 1px solid #ecf0f1;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.summary-label {
  color: #7f8c8d;
}

.summary-value {
  font-weight: 500;
  color: #2c3e50;
}

/* Button Styles */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #c0392b;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ecf0f1;
  border-top: 2px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
