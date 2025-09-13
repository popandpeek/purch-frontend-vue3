<template>
  <div class="order-details">
    <!-- Order Summary -->
    <div class="details-section">
      <h4>Order Summary</h4>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Order ID:</span>
          <span class="summary-value">#{{ order.id }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Date:</span>
          <span class="summary-value">{{ formatDate(order.date) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Status:</span>
          <span class="summary-value status" :class="statusClass">{{ order.status }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Amount:</span>
          <span class="summary-value amount">${{ calculatedTotal.toFixed(2) }}</span>
        </div>
        <div v-if="type === 'vendor'" class="summary-item">
          <span class="summary-label">Vendor ID:</span>
          <span class="summary-value">{{ (order as any).vendor_id }}</span>
        </div>
        <div v-if="(order as any).submitted !== undefined" class="summary-item">
          <span class="summary-label">Submitted:</span>
          <span class="summary-value">{{ (order as any).submitted ? 'Yes' : 'No' }}</span>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="details-section">
      <h4>Order Items ({{ order.items?.length }})</h4>
      <div v-if="!order.items || order.items.length === 0" class="no-items">
        <p>No items in this order</p>
      </div>
      <div v-else class="items-list">
        <div 
          v-for="item in order.items" 
          :key="item.id" 
          class="item-card"
        >
          <div class="item-header">
            <h5 class="item-name">{{ getItemName(item) }}</h5>
            <span class="item-price">${{ getItemPrice(item) }}</span>
          </div>
          <div class="item-details">
            <div class="item-row">
              <span class="item-label">Quantity:</span>
              <span class="item-value">{{ item.quantity }}</span>
            </div>
            <div class="item-row">
              <span class="item-label">Unit:</span>
              <span class="item-value">{{ getItemUnit(item) }}</span>
            </div>
            <div v-if="getItemTotalPrice(item)" class="item-row">
              <span class="item-label">Total:</span>
              <span class="item-value">${{ getItemTotalPrice(item) }}</span>
            </div>
            <div v-if="getItemDescription(item)" class="item-row">
              <span class="item-label">Description:</span>
              <span class="item-value description">{{ getItemDescription(item) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Notes -->
    <div v-if="order.notes" class="details-section">
      <h4>Notes</h4>
      <div class="notes-content">
        <p>{{ order.notes }}</p>
      </div>
    </div>

    <!-- Timestamps -->
    <div class="details-section">
      <h4>Timestamps</h4>
      <div class="timestamp-grid">
        <div class="timestamp-item">
          <span class="timestamp-label">Created:</span>
          <span class="timestamp-value">{{ formatDateTime(order.created_at) }}</span>
        </div>
        <div v-if="order.updated_at" class="timestamp-item">
          <span class="timestamp-label">Updated:</span>
          <span class="timestamp-value">{{ formatDateTime(order.updated_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HouseOrder, VendorOrder, HouseOrderItem, VendorOrderItem } from '../../stores/house-orders';

interface Props {
  order: HouseOrder | VendorOrder;
  type: 'house' | 'vendor';
}

const props = defineProps<Props>();

// Computed properties
const statusClass = computed(() => {
  const status = props.order.status?.toLowerCase();
  
  switch (status) {
    case 'pending':
    case 'draft':
      return 'status-pending';
    case 'submitted':
    case 'processing':
      return 'status-processing';
    case 'completed':
    case 'delivered':
      return 'status-completed';
    case 'cancelled':
    case 'rejected':
      return 'status-cancelled';
    default:
      return 'status-unknown';
  }
});

const calculatedTotal = computed(() => {
  if (!props.order.items || props.order.items.length === 0) {
    // For house orders, use total_estimated_cost; for vendor orders, use total_amount
    if (props.type === 'house') {
      return (props.order as any).total_estimated_cost || 0;
    }
    return (props.order as any).total_amount || 0;
  }
  
  const calculated = props.order.items.reduce((total, item) => {
    // For vendor orders, use unit_price and quantity (API field names)
    if (props.type === 'vendor') {
      const unitPrice = parseFloat((item as any).unit_price || '0');
      const quantity = parseFloat((item as any).quantity || '0');
      const totalPrice = parseFloat((item as any).total_price || '0');
      
      // Use total_price if available, otherwise calculate from unit_price * quantity
      if (totalPrice > 0) {
        return total + totalPrice;
      }
      return total + (unitPrice * quantity);
    }
    
    // For house orders, use house_item.current_price_per_unit and quantity
    const unitPrice = parseFloat((item as any).house_item?.current_price_per_unit || '0');
    const quantity = parseFloat((item as any).quantity || '0');
    
    return total + (unitPrice * quantity);
  }, 0);
  
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
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid Date';
  }
};

const getItemName = (item: HouseOrderItem | VendorOrderItem) => {
  // Debug: Log the item structure for vendor orders
  if (props.type === 'vendor') {
    console.log('Vendor order item structure:', item);
    console.log('Available fields:', Object.keys(item));
  }
  
  // For house orders, use house_item.name
  if (props.type === 'house') {
    return (item as any).house_item?.name || 'Unknown Item';
  }
  
  // For vendor orders, use vendor_item_name
  return (item as any).vendor_item_name || 'Unknown Item';
};

const getItemUnit = (item: HouseOrderItem | VendorOrderItem) => {
  // For house orders, use house_item.tracking_unit
  if (props.type === 'house') {
    return (item as any).house_item?.tracking_unit || 'each';
  }
  
  // For vendor orders, use pack_unit or unit (API field names)
  return (item as any).pack_unit || 
         (item as any).unit || 
         'each';
};

const getItemDescription = (item: HouseOrderItem | VendorOrderItem) => {
  // For house orders, use house_item description if available
  if (props.type === 'house') {
    return (item as any).house_item?.description || '';
  }
  
  // For vendor orders, use vendor_item_description
  return (item as any).vendor_item_description || '';
};

const getItemPrice = (item: HouseOrderItem | VendorOrderItem) => {
  // For house orders, use house_item.current_price_per_unit
  if (props.type === 'house') {
    return (item as any).house_item?.current_price_per_unit || '0.00';
  }
  
  // For vendor orders, use unit_price or total_price
  return (item as any).unit_price || (item as any).total_price || '0.00';
};

const getItemTotalPrice = (item: HouseOrderItem | VendorOrderItem) => {
  // For house orders, calculate from house_item.current_price_per_unit * quantity
  if (props.type === 'house') {
    const unitPrice = parseFloat((item as any).house_item?.current_price_per_unit || '0');
    const quantity = parseFloat((item as any).quantity || '0');
    const total = unitPrice * quantity;
    return isNaN(total) ? '0.00' : total.toFixed(2);
  }
  
  // For vendor orders, use total_price if available
  return (item as any).total_price || '';
};
</script>

<style scoped>
.order-details {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.summary-value.amount {
  color: #27ae60;
  font-size: 1.2rem;
}

.summary-value.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
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

.no-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
}

.no-items-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.item-name {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.item-price {
  color: #27ae60;
  font-weight: 600;
  font-size: 1.1rem;
}

.item-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.item-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
}

.item-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.item-value.description {
  font-style: italic;
  color: #7f8c8d;
}

.notes-content {
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
}

.notes-content p {
  margin: 0;
  color: #2c3e50;
  line-height: 1.5;
}

.timestamp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.timestamp-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timestamp-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timestamp-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

@media (max-width: 768px) {
  .order-details {
    padding: 1rem;
  }
  
  .summary-grid,
  .item-details,
  .timestamp-grid {
    grid-template-columns: 1fr;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
