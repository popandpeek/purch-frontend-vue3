<template>
  <div class="order-list">
    <!-- Header -->
    <div class="list-header">
      <div class="header-content">
        <h2>House Orders</h2>
        <p>{{ totalOrders }} orders total</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <label for="status-filter">Status</label>
        <select id="status-filter" v-model="statusFilter">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="search">Search</label>
        <input
          id="search"
          v-model="searchQuery"
          type="text"
          placeholder="Search orders..."
        />
      </div>
      
      <div class="filter-group">
        <label for="sort">Sort By</label>
        <select id="sort" v-model="sortBy">
          <option value="date_desc">Date (Newest)</option>
          <option value="date_asc">Date (Oldest)</option>
          <option value="cost_desc">Cost (Highest)</option>
          <option value="cost_asc">Cost (Lowest)</option>
          <option value="status">Status</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && orders.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>Error</h3>
      <p>{{ error }}</p>
      <BaseButton variant="primary" @click="refreshOrders">Retry</BaseButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>No orders found</h3>
      <p v-if="searchQuery || statusFilter">
        Try adjusting your filters or search terms
      </p>
      <p v-else>
        Create your first order to get started
      </p>
      <BaseButton variant="primary" @click="createNewOrder">
        Create First Order
      </BaseButton>
    </div>

    <!-- Orders List -->
    <div v-else class="orders-grid">
      <OrderCard
        v-for="order in paginatedOrders"
        :key="order.id"
        :order="order"
        @view="viewOrder"
        @edit="editOrder"
        @submit="submitOrder"
        @delete="deleteOrder"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="currentPage === 1"
        @click="currentPage = 1"
      >
        First
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        Previous
      </BaseButton>
      
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Next
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="currentPage === totalPages"
        @click="currentPage = totalPages"
      >
        Last
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHouseOrdersStore, type HouseOrder } from '@/stores/house-orders';
import OrderCard from './OrderCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

// Store
const orderStore = useHouseOrdersStore();

// State
const statusFilter = ref('');
const searchQuery = ref('');
const sortBy = ref('date_desc');
const currentPage = ref(1);
const itemsPerPage = 12;

// Computed
const orders = computed(() => orderStore.orders);
const loading = computed(() => orderStore.loading);
const error = computed(() => orderStore.error);
const totalOrders = computed(() => orderStore.totalOrders);

const filteredOrders = computed(() => {
  let filtered = [...orders.value];
  
  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value);
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.notes.toLowerCase().includes(query) ||
      order.id?.toString().includes(query) ||
      order.items.some(item => 
        item.house_item_id.toString().includes(query)
      )
    );
  }
  
  // Sort orders
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'date_asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date_desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'cost_asc':
        return a.total_estimated_cost - b.total_estimated_cost;
      case 'cost_desc':
        return b.total_estimated_cost - a.total_estimated_cost;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
  
  return filtered;
});

const totalPages = computed(() => 
  Math.ceil(filteredOrders.value.length / itemsPerPage)
);

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

// Methods
const createNewOrder = () => {
  // Emit event to parent component
  emit('create');
};

const refreshOrders = async () => {
  await orderStore.fetchOrders();
  currentPage.value = 1;
};

const viewOrder = (order: HouseOrder) => {
  emit('view', order);
};

const editOrder = (order: HouseOrder) => {
  emit('edit', order);
};

const submitOrder = async (order: HouseOrder) => {
  if (order.id) {
    try {
      await orderStore.submitOrder(order.id);
      // Refresh orders to get updated status
      await refreshOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  }
};

const deleteOrder = async (order: HouseOrder) => {
  if (order.id && confirm('Are you sure you want to delete this order?')) {
    try {
      await orderStore.deleteOrder(order.id);
      // Refresh orders
      await refreshOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }
};

// Emits
const emit = defineEmits<{
  create: [];
  view: [order: HouseOrder];
  edit: [order: HouseOrder];
}>();

// Lifecycle
onMounted(async () => {
  await refreshOrders();
});
</script>

<style scoped>
.order-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.header-content p {
  color: #6c757d;
  margin: 0;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters-section {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.filter-group input,
.filter-group select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 2px rgba(61, 0, 141, 0.1);
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h3,
.error-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.empty-state p,
.error-state p {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-info {
  font-weight: 600;
  color: #2c3e50;
  padding: 0 1rem;
}

/* Buttons now use design system classes */

/* Responsive Design */
@media (max-width: 1024px) {
  .orders-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .orders-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
</style>
