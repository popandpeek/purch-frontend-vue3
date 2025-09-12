<template>
  <div class="vendor-orders-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToVendorManagement">
          <span class="btn-icon">←</span>
          Back to Vendor
        </button>
        <div class="header-info">
          <h1 class="page-title">Vendor Orders</h1>
          <p class="page-subtitle">{{ vendorName || 'Loading...' }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="createNewOrder">
          New Order
        </button>
        <button class="btn btn-secondary" @click="refreshOrders" :disabled="loading">
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && orders.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading vendor orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>Error</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadOrders">Retry</button>
    </div>

    <!-- Main Content -->
    <div v-else class="orders-content">
      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-content">
            <h3>{{ orders.length }}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-content">
            <h3>{{ pendingOrders }}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card confirmed">
          <div class="stat-content">
            <h3>{{ confirmedOrders }}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div class="stat-card delivered">
          <div class="stat-content">
            <h3>{{ deliveredOrders }}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search orders..." 
            class="search-input"
          >
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select v-model="sortBy" class="filter-select">
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="total">Sort by Total</option>
          </select>
          
          <button 
            class="sort-btn"
            @click="sortAscending = !sortAscending"
          >
            {{ sortAscending ? '↑' : '↓' }}
          </button>
        </div>
      </div>

      <!-- Orders List -->
      <div class="orders-section">
        <div v-if="filteredOrders.length === 0" class="empty-state">
          <h3>No Orders Found</h3>
          <p v-if="searchQuery || statusFilter">
            Try adjusting your search or filters
          </p>
          <p v-else>
            This vendor doesn't have any orders yet
          </p>
          <button class="btn btn-primary" @click="createNewOrder">
            Create First Order
          </button>
        </div>

        <div v-else class="orders-list">
          <VendorOrderItem
            v-for="order in filteredOrders"
            :key="order.id"
            :order="order"
            @view="viewOrder"
            @edit="editOrder"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { useVendorOrderStore } from '../../../stores/vendor-orders';
import { useVendorStore } from '../../../stores/vendors';
import VendorOrderItem from "../../../components/vendors/vendor-orders/VendorOrderItem.vue";
import type { VendorOrder } from '../../../api/model';

// Props
const props = defineProps({
  vendorId: {
    type: String,
    required: true
  },
});

// Stores and router
const vendorOrderStore = useVendorOrderStore();
const vendorStore = useVendorStore();
const router = useRouter();

// Reactive state
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref<'date' | 'status' | 'total'>('date');
const sortAscending = ref(false);

// Computed properties
const orders = computed(() => {
  return vendorOrderStore.vendorOrders.filter(order => order.vendor_id === Number(props.vendorId));
});

const vendorName = computed(() => {
  const vendor = vendorStore.vendors.find(v => v.id === Number(props.vendorId));
  return vendor?.name || `Vendor #${props.vendorId}`;
});

const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.id.toString().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      order.notes.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value);
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortBy.value) {
      case 'date':
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'total':
        aVal = a.total_amount || 0;
        bVal = b.total_amount || 0;
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

// Stats
const pendingOrders = computed(() => 
  orders.value.filter(order => order.status === 'pending').length
);

const confirmedOrders = computed(() => 
  orders.value.filter(order => order.status === 'confirmed').length
);

const deliveredOrders = computed(() => 
  orders.value.filter(order => order.status === 'delivered').length
);

// Methods
const loadOrders = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await Promise.all([
      vendorOrderStore.fetchVendorOrders(),
      vendorStore.fetchVendors()
    ]);
  } catch (err: any) {
    error.value = err.message || 'Failed to load orders';
  } finally {
    loading.value = false;
  }
};

const refreshOrders = async () => {
  await loadOrders();
};

const createNewOrder = () => {
  router.push(`/vendors/${props.vendorId}/orders/new`);
};

const viewOrder = (order: VendorOrder) => {
  router.push(`/vendors/orders/${order.id}`);
};

const editOrder = (order: VendorOrder) => {
  router.push(`/vendors/orders/${order.id}/edit`);
};

const backToVendorManagement = () => {
  router.push(`/vendors/contacts/${props.vendorId}`);
};

// Lifecycle
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.vendor-orders-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.btn-icon {
  font-size: 1rem;
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc3545;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
}

/* Main Content */
.orders-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Summary Stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

.stat-card.pending {
  border-left: 4px solid #f39c12;
}

.stat-card.confirmed {
  border-left: 4px solid #27ae60;
}

.stat-card.delivered {
  border-left: 4px solid #3498db;
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

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar {
  position: relative;
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
  border-color: #3d008d;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  color: #495057;
  min-width: 150px;
}

.sort-btn {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  color: #495057;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  background: #f8f9fa;
  border-color: #3d008d;
}

/* Orders Section */
.orders-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #6c757d;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #adb5bd;
  margin: 0 0 1.5rem 0;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2d0066;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #dee2e6;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .vendor-orders-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: auto;
  }
}
</style>
