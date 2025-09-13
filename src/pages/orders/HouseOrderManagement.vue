<template>
  <div class="house-order-management">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">House Order Management</h1>
        <p class="page-subtitle">Create and manage house orders for vendor optimization</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showCreateForm">
          <span class="btn-icon">+</span>
          New Order
        </button>
        <button class="btn btn-secondary" @click="refreshData" :disabled="loading">
          <span class="btn-icon">↻</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ totalOrders }}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      <div class="stat-card draft">
        <div class="stat-content">
          <h3>{{ draftOrders }}</h3>
          <p>Draft Orders</p>
        </div>
      </div>
      <div class="stat-card submitted">
        <div class="stat-content">
          <h3>{{ submittedOrders }}</h3>
          <p>Submitted Orders</p>
        </div>
      </div>
      <div class="stat-card processing">
        <div class="stat-content">
          <h3>{{ processingOrders }}</h3>
          <p>Processing Orders</p>
        </div>
      </div>
      <div class="stat-card completed">
        <div class="stat-content">
          <h3>{{ completedOrders }}</h3>
          <p>Completed Orders</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>${{ totalEstimatedCost.toLocaleString() }}</h3>
          <p>Total Estimated Cost</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <OrderList
        @create="showCreateForm"
        @view="viewOrder"
        @edit="editOrder"
      />
    </div>

    <!-- Modals -->
    <OrderFormModal
      v-if="showOrderForm"
      :order="selectedOrder"
      :is-editing="isEditing"
      @success="handleOrderSuccess"
      @cancel="hideOrderForm"
    />

    <OrderDetailModal
      v-if="showOrderDetail"
      :order="selectedOrder"
      @close="hideOrderDetail"
      @edit="editOrder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHouseOrdersStore, type HouseOrder } from '@/stores/house-orders';
import OrderList from '@/components/orders/OrderList.vue';
import OrderFormModal from '@/components/orders/OrderFormModal.vue';
import OrderDetailModal from '@/components/orders/OrderDetailModal.vue';

// Router (unused but kept for future use)
// const router = useRouter();

// Store
const orderStore = useHouseOrdersStore();

// State
const showOrderForm = ref(false);
const showOrderDetail = ref(false);
const selectedOrder = ref<HouseOrder | null>(null);
const isEditing = ref(false);

// Computed
const loading = computed(() => orderStore.loading);
const totalOrders = computed(() => orderStore.totalOrders);
const draftOrders = computed(() => orderStore.draftOrders.length);
const submittedOrders = computed(() => orderStore.submittedOrders.length);
const processingOrders = computed(() => orderStore.processingOrders.length);
const completedOrders = computed(() => orderStore.completedOrders.length);
const totalEstimatedCost = computed(() => orderStore.totalEstimatedCost);

// Methods
const refreshData = async () => {
  await orderStore.fetchOrders();
};

const showCreateForm = () => {
  selectedOrder.value = null;
  isEditing.value = false;
  showOrderForm.value = true;
};

const viewOrder = (order: HouseOrder) => {
  selectedOrder.value = order;
  showOrderDetail.value = true;
};

const editOrder = (order: HouseOrder) => {
  selectedOrder.value = order;
  isEditing.value = true;
  showOrderForm.value = true;
};

const hideOrderForm = () => {
  showOrderForm.value = false;
  selectedOrder.value = null;
  isEditing.value = false;
};

const hideOrderDetail = () => {
  showOrderDetail.value = false;
  selectedOrder.value = null;
};

const handleOrderSuccess = (order: HouseOrder) => {
  hideOrderForm();
  // Refresh the orders list
  refreshData();
  
  // If this was a new order, show the detail view
  if (!isEditing.value) {
    viewOrder(order);
  }
};

// Lifecycle
onMounted(async () => {
  await refreshData();
});
</script>

<style scoped>
.house-order-management {
  min-height: 100vh;
  background-color: #f8f9fa;
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
  align-items: center;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Stats Grid */
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
  border-left: 4px solid #3d008d;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-card.draft {
  border-left-color: #6c757d;
}

.stat-card.submitted {
  border-left-color: #3d008d;
}

.stat-card.processing {
  border-left-color: #f39c12;
}

.stat-card.completed {
  border-left-color: #27ae60;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.stat-content p {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2a0063;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 768px) {
  .house-order-management {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-content h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
