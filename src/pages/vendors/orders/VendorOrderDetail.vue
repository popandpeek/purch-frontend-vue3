<template>
  <div class="vendor-order-detail">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToOrderList">
          <span class="btn-icon">←</span>
          Back to Orders
        </button>
        <h1>Vendor Order #{{ vendorOrderId }}</h1>
        <p class="page-subtitle">{{ vendorName }} • {{ formatDate(orderDate) }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!vendorOrder" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading order details...</p>
    </div>

    <!-- Content -->
    <div v-else class="order-content">
      <!-- Order Information -->
      <div class="section">
        <h3>Order Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">Order ID</label>
            <span class="info-value">#{{ vendorOrder.id }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">Vendor</label>
            <span class="info-value">{{ vendorName }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">Order Date</label>
            <span class="info-value">{{ formatDate(vendorOrder.date) }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">Status</label>
            <span class="info-value status-badge" :class="getStatusClass(vendorOrder.status)">
              {{ vendorOrder.status }}
            </span>
          </div>
          <div class="info-item">
            <label class="info-label">Total Amount</label>
            <span class="info-value total-amount">${{ calculatedTotal?.toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">Submitted</label>
            <span class="info-value">{{ vendorOrder.submitted ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="section">
        <h3>Order Items ({{ orderItems?.length }})</h3>
        
        <div v-if="!orderItems || orderItems.length === 0" class="empty-state">
          <h3>No Items Found</h3>
          <p>This order has no items.</p>
        </div>

        <div v-else class="items-list">
          <VendorOrderItemListItem
            v-for="orderItem in orderItems"
            :id="orderItem.id"
            :key="orderItem.id"
            :vendorItemId="orderItem.vendor_item_id"
            :vendorOrderId="orderItem.vendor_order_id"
            :quantity="orderItem.quantity"
            :measure="orderItem.measure"
            :unitPrice="(orderItem as any).unit_price"
          />
        </div>
      </div>

      <!-- Order Notes -->
      <div v-if="vendorOrder.notes" class="section">
        <h3>Notes</h3>
        <div class="notes-content">
          <p>{{ vendorOrder.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useVendorOrderStore } from "@/stores/vendor-orders";
import { useVendorStore } from "@/stores/vendors";
import VendorOrderItemListItem from "@/components/vendors/vendor-orders/VendorOrderItemListItem.vue";

const router = useRouter();
const vendorOrderStore = useVendorOrderStore();
const vendorStore = useVendorStore();

const props = defineProps({
  vendorOrderId: {
    type: String,
    required: true,
  },
});

// Computed properties
const vendorOrder = computed(() => {
  return vendorOrderStore.vendorOrders.find(
    (order) => order.id === Number(props.vendorOrderId)
  );
});

const orderDate = computed(() => {
  return vendorOrder.value?.date;
});

const orderItems = computed(() => {
  return vendorOrder.value?.items;
});

const vendorName = computed(() => {
  if (!vendorOrder.value?.vendor_id) return 'Unknown Vendor';
  const vendor = vendorStore.vendors.find((vendor) => vendor.id === vendorOrder.value?.vendor_id);
  return vendor?.name;
});

const calculatedTotal = computed(() => {
  if (!vendorOrder.value?.items || vendorOrder.value.items.length === 0) {
    console.log('No items found, using total_amount:', vendorOrder.value?.total_amount);
    return vendorOrder.value?.total_amount || 0;
  }
  
  console.log('Calculating total from items:', vendorOrder.value.items);
  
  const calculated = vendorOrder.value.items.reduce((total, item) => {
    // Use the correct API field names
    const unitPrice = parseFloat((item as any).unit_price || '0');
    const quantity = parseFloat((item as any).quantity || '0');
    const totalPrice = parseFloat((item as any).total_price || '0');
    
    console.log('Item calculation:', { 
      unit_price: (item as any).unit_price, 
      quantity: (item as any).quantity,
      total_price: (item as any).total_price,
      parsedUnitPrice: unitPrice, 
      parsedQuantity: quantity,
      parsedTotalPrice: totalPrice,
      calculatedTotal: unitPrice * quantity
    });
    
    // Use total_price if available, otherwise calculate from unit_price * quantity
    let itemTotal = totalPrice;
    if (isNaN(totalPrice) || totalPrice === 0) {
      if (isNaN(unitPrice) || isNaN(quantity)) {
        console.log('Invalid unit_price or quantity, skipping item');
        return total;
      }
      itemTotal = unitPrice * quantity;
    }
    
    return total + itemTotal;
  }, 0);
  
  console.log('Final calculated total:', calculated);
  
  // Ensure we return a valid number
  return isNaN(calculated) ? 0 : calculated;
});

// Methods
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

const backToOrderList = () => {
  // Navigate to vendor orders list for this vendor
  if (vendorOrder.value?.vendor_id) {
    router.push(`/vendors/${vendorOrder.value.vendor_id}/orders`);
  } else {
    router.push('/vendors');
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    vendorOrderStore.fetchVendorOrders(),
    vendorStore.fetchVendors()
  ]);
});
</script>

<style scoped>
.vendor-order-detail {
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

.loading-state, .empty-state {
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

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
}

.section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.info-value.total-amount {
  color: #3d008d;
  font-size: 1.2rem;
  font-weight: 700;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
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

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notes-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
}

.notes-content p {
  margin: 0;
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .vendor-order-detail {
    padding: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .section {
    padding: 1rem;
  }
}
</style>
