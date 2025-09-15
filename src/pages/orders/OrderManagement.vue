<template>
  <div class="order-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Order Management</h1>
        <p v-if="!vendorFilter">Manage house orders and vendor orders</p>
        <p v-else class="vendor-filter-info">
          Showing orders for vendor ID: {{ vendorFilter }}
          <BaseButton 
            variant="danger" 
            size="md" 
            @click="clearVendorFilter"
          >
            Clear
          </BaseButton>
        </p>
      </div>
      <div class="header-actions">
        <BaseButton 
          variant="primary" 
          size="md" 
          icon="+" 
          @click="createNewOrder"
        >
          New Order
        </BaseButton>
      </div>
    </div>

    <!-- Order Tabs -->
    <div class="order-tabs">
      <button 
        class="tab-btn active"
        @click="activeTab = 'house'"
      >
        House Orders
        <span class="tab-count">{{ houseOrders.length }}</span>
      </button>
      <!-- Vendor Orders tab temporarily disabled during development -->
      <!-- <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'vendor' }"
        @click="activeTab = 'vendor'"
      >
        Vendor Orders
        <span class="tab-count">{{ vendorOrders.length }}</span>
      </button> -->
    </div>

    <!-- Two Panel Layout -->
    <div class="order-panels">
      <!-- Left Panel - Order List -->
      <div class="panel-left">
        <div class="panel-header">
          <h3>{{ getTabTitle() }}</h3>
          <div class="panel-actions">
            <div class="search-box">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search orders..."
                class="search-input"
              >
            </div>
            <BaseButton 
              variant="secondary" 
              size="md" 
              icon="↻" 
              @click="refreshOrders"
            >
              Refresh
            </BaseButton>
          </div>
        </div>

        <div class="order-list">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>

          <div v-else-if="filteredOrders.length === 0" class="empty-state">
            <h3>No orders found</h3>
            <p>Try adjusting your search or create a new order</p>
          </div>

          <div v-else class="order-items">
            <OrderCard
              v-for="order in filteredOrders"
              :key="order.id"
              :order="order"
              :type="getOrderType(order)"
              :class="{ selected: selectedOrder?.id === order.id }"
              @click="selectOrder(order)"
            />
          </div>
        </div>
      </div>

      <!-- Right Panel - Order Details -->
      <div class="panel-right">
        <div v-if="!selectedOrder" class="no-selection">
          <h3>Select an Order</h3>
          <p>Choose an order from the list to view details</p>
        </div>

        <div v-else class="order-details">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
          <div v-else>
            <div class="details-header">
              <h3>Order Details</h3>
            </div>

            <OrderDetails :order="selectedOrder" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useHouseOrdersStore } from '../../stores/house-orders';
import { useVendorOrderStore } from '../../stores/vendor-orders';
import OrderCard from '../../components/orders/OrderCard.vue';
import OrderDetails from '../../components/orders/OrderDetails.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import type { HouseOrder } from '../../stores/house-orders';

const router = useRouter();
const route = useRoute();
const houseOrderStore = useHouseOrdersStore();
const vendorOrderStore = useVendorOrderStore();

// Reactive state
const activeTab = ref<'house' | 'vendor'>('house');
const searchQuery = ref('');
const selectedOrder = ref<HouseOrder | null>(null);
const loading = ref(false);
const vendorFilter = ref<string | null>(null);

// Computed properties
const houseOrders = computed(() => houseOrderStore.orders);
// const vendorOrders = computed(() => vendorOrderStore.vendorOrders); // Temporarily disabled

const currentOrders = computed(() => {
  // For now, only handle house orders during development
  return houseOrders.value;
});

const filteredOrders = computed(() => {
  let orders: HouseOrder[] = currentOrders.value;
  
  // Apply search filter
  if (!searchQuery.value) return orders;
  
  const query = searchQuery.value.toLowerCase();
  return orders.filter(order => {
    const orderId = order.id.toString();
    const date = order.date;
    const status = order.status;
    
    return orderId.includes(query) || 
           date.toLowerCase().includes(query) || 
           status.toLowerCase().includes(query);
  });
});

// Methods
const selectOrder = (order: HouseOrder) => {
  selectedOrder.value = order;
};

const getTabTitle = () => {
  switch (activeTab.value) {
    case 'house':
      return 'House Orders';
    case 'vendor':
      return 'Vendor Orders';
    default:
      return 'Orders';
  }
};

const getOrderType = (order: HouseOrder | null): 'house' | 'vendor' => {
  if (!order) return 'house';
  return 'house'; // For now, all orders are house orders
};

const createNewOrder = () => {
  // Always create a House Order regardless of which tab is active
  router.push('/orders/new');
};

const clearVendorFilter = () => {
  vendorFilter.value = null;
  router.push('/orders');
};


const refreshOrders = async () => {
  loading.value = true;
  try {
    if (activeTab.value === 'house') {
      await houseOrderStore.fetchOrders();
    } else {
      await vendorOrderStore.fetchVendorOrders();
    }
    
    // Auto-select the first order if none is selected and orders are available
    if (!selectedOrder.value && currentOrders.value.length > 0) {
      selectedOrder.value = currentOrders.value[0];
    }
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(activeTab, async () => {
  // Clear selected order when switching tabs
  selectedOrder.value = null;
  
  // Refresh orders for the new tab
  await refreshOrders();
});

// Lifecycle
onMounted(async () => {
  // Check for vendor filter in URL query
  const vendorId = route.query.vendor as string;
  if (vendorId) {
    vendorFilter.value = vendorId;
    activeTab.value = 'vendor'; // Switch to vendor orders tab when filtering by vendor
  }
  
  await refreshOrders();
});
</script>

<style scoped>
.order-management {
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



.header-actions {
  display: flex;
  gap: 1rem;
}

.order-tabs {
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

.order-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  height: calc(100vh - 300px);
  min-height: 600px;
}

.panel-left,
.panel-right {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
  background: #f8f9fa;
}

.panel-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 2px rgba(61, 0, 141, 0.1);
}


.order-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #7f8c8d;
}


.no-selection h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.no-selection p {
  margin: 0;
}

.order-details {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
  background: #f8f9fa;
}

.details-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}




.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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


.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.empty-state p {
  margin: 0;
}

@media (max-width: 1024px) {
  .order-panels {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .panel-right {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .order-management {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .order-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    justify-content: center;
  }
  
  .panel-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>
