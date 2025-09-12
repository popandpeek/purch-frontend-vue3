<template>
  <div class="vendor-item-order-history">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToItemDetail">
          <span class="btn-icon">←</span>
          Back to Item
        </button>
        <h1>Order History</h1>
        <p class="page-subtitle">{{ vendorItemName }} • {{ vendorName }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading order history...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>Error Loading Order History</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadOrderHistory">
        Try Again
      </button>
    </div>

    <!-- Content -->
    <div v-else class="order-history-content">
      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-label">Total Orders</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${{ totalSpent }}</div>
          <div class="stat-label">Total Spent</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageQuantity }}</div>
          <div class="stat-label">Avg Quantity</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ lastOrderDate }}</div>
          <div class="stat-label">Last Ordered</div>
        </div>
      </div>

      <!-- Order History List -->
      <div class="orders-section">
        <h2>Order History</h2>
        
        <div v-if="orderHistory.length === 0" class="empty-state">
          <h3>No Orders Found</h3>
          <p>This vendor item has not been ordered yet.</p>
        </div>

        <div v-else class="orders-list">
          <div 
            v-for="order in orderHistory" 
            :key="order.id" 
            class="order-item"
            @click="viewOrderDetails(order)"
          >
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-title">Order #{{ order.vendor_order_id }}</h3>
                <p class="order-date">{{ formatDate(order.created_at) }}</p>
              </div>
              <div class="order-status" :class="getStatusClass(order.status)">
                {{ order.status }}
              </div>
            </div>

            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                  <span class="detail-value">{{ order.quantity }} {{ order.unit }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Unit Price:</span>
                <span class="detail-value">${{ order.price }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value total-amount">${{ calculateItemTotal(order) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Vendor Order Date:</span>
                <span class="detail-value">{{ formatDate(order.vendor_order_date) }}</span>
              </div>
            </div>

            <div class="order-actions">
              <button class="action-btn view" @click.stop="viewOrderDetails(order)">
                View Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVendorItemStore } from '../../../stores/vendor-items';
import { useVendorOrderStore } from '../../../stores/vendor-orders';
import { useVendorStore } from '../../../stores/vendors';
import type { VendorItem, VendorOrderItem } from '../../../api/model';

const route = useRoute();
const router = useRouter();
const vendorItemStore = useVendorItemStore();
const vendorOrderStore = useVendorOrderStore();
const vendorStore = useVendorStore();

const vendorItemId = route.params.vendorItemId as string;

const loading = ref(false);
const error = ref<string | null>(null);
const orderHistory = ref<VendorOrderItem[]>([]);

// Computed properties
const selectedItem = computed(() => {
  return vendorItemStore.vendorItems.find(item => item.id === parseInt(vendorItemId));
});

const vendorItemName = computed(() => {
  return selectedItem.value?.product_name || 'Unknown Item';
});

const vendorName = computed(() => {
  if (!selectedItem.value?.vendor_id) return 'Unknown Vendor';
  const vendor = vendorStore.vendors.find(v => v.id === selectedItem.value.vendor_id);
  return vendor?.name || `Vendor #${selectedItem.value.vendor_id}`;
});

const totalOrders = computed(() => {
  return orderHistory.value.length;
});

const totalSpent = computed(() => {
  return orderHistory.value.reduce((sum, order) => {
    const price = parseFloat(order.price || '0');
    const quantity = parseFloat(order.quantity?.toString() || '0');
    return sum + (price * quantity);
  }, 0).toFixed(2);
});

const averageQuantity = computed(() => {
  if (orderHistory.value.length === 0) return '0';
  const totalQty = orderHistory.value.reduce((sum, order) => {
    return sum + parseFloat(order.quantity?.toString() || '0');
  }, 0);
  return (totalQty / orderHistory.value.length).toFixed(1);
});

const lastOrderDate = computed(() => {
  if (orderHistory.value.length === 0) return 'Never';
  const sortedOrders = [...orderHistory.value].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return formatDate(sortedOrders[0].created_at);
});

// Methods
const loadOrderHistory = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Load all necessary data
    await Promise.all([
      vendorItemStore.fetchAllVendorItems(),
      vendorOrderStore.fetchVendorOrders(),
      vendorStore.fetchVendors()
    ]);

    // Find all vendor order items for this vendor item
    const allOrderItems: VendorOrderItem[] = [];
    
    vendorOrderStore.vendorOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (item.vendor_item_id === parseInt(vendorItemId)) {
            // Add vendor order context to the item
            const itemWithContext = {
              ...item,
              vendor_order_id: order.id,
              vendor_order_date: order.date,
              status: order.status
            };
            allOrderItems.push(itemWithContext);
          }
        });
      }
    });

    // Sort by creation date (newest first)
    orderHistory.value = allOrderItems.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  } catch (err: any) {
    error.value = err.message || 'Failed to load order history';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const calculateItemTotal = (order: VendorOrderItem) => {
  const price = parseFloat(order.price || '0');
  const quantity = parseFloat(order.quantity?.toString() || '0');
  const total = price * quantity;
  return isNaN(total) ? '0.00' : total.toFixed(2);
};

const getStatusClass = (status: string | undefined) => {
  if (!status) return 'status-unknown';
  
  switch (status.toLowerCase()) {
    case 'pending':
    case 'draft':
      return 'status-pending';
    case 'confirmed':
    case 'shipped':
      return 'status-processing';
    case 'delivered':
    case 'completed':
      return 'status-completed';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-unknown';
  }
};

const viewOrderDetails = (order: VendorOrderItem) => {
  // Navigate to the vendor order detail page
  router.push(`/vendors/orders/${(order as any).vendor_order_id}`);
};

const backToItemDetail = () => {
  router.push(`/vendors/items/${vendorItemId}`);
};

onMounted(() => {
  loadOrderHistory();
});
</script>

<style scoped>
.vendor-item-order-history {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.back-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.btn-icon {
  font-size: 1rem;
}

h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 1.1rem;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
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

.error-icon, .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3d008d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #2a0061;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3d008d;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.orders-section {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
}

.orders-section h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.order-item:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-info {
  flex: 1;
}

.order-title {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.order-date {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #cce5ff;
  color: #004085;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-unknown {
  background: #e2e3e5;
  color: #383d41;
}

.order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.detail-value.total-amount {
  color: #3d008d;
  font-size: 1rem;
  font-weight: 700;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #3d008d;
  color: #3d008d;
}

@media (max-width: 768px) {
  .vendor-item-order-history {
    padding: 1rem;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .order-details {
    grid-template-columns: 1fr;
  }
  
  .order-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .order-actions {
    justify-content: flex-start;
  }
}
</style>
