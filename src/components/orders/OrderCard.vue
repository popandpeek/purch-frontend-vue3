<template>
  <div class="order-card" @click="$emit('click')">
    <div class="order-header">
      <div class="order-id">
        <span class="order-label">Order #{{ order.id }}</span>
        <span class="order-type">{{ type === 'house' ? 'House' : 'Vendor' }}</span>
      </div>
      <div class="order-status" :class="statusClass">
        {{ order.status }}
      </div>
    </div>

    <div class="order-content">
      <div class="order-info">
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">{{ formatDate(order.date) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total:</span>
          <span class="info-value">${{ calculatedTotal.toFixed(2) }}</span>
        </div>
        <div v-if="type === 'vendor'" class="info-row">
          <span class="info-label">Vendor:</span>
          <span class="info-value">{{ vendorName }}</span>
        </div>
        <div v-if="order.notes" class="info-row">
          <span class="info-label">Notes:</span>
          <span class="info-value notes">{{ order.notes }}</span>
        </div>
      </div>

      <div class="order-items-count">
        <span class="items-text">{{ itemsCount }} items</span>
      </div>
    </div>

    <div class="order-footer">
      <div class="order-actions">
        <button class="action-btn edit" @click.stop="viewDetails">
          Edit
        </button>
      </div>
      <div class="order-meta">
        <span class="created-at">Created: {{ formatDate(order.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVendorStore } from '../../stores/vendors';
import type { HouseOrder, VendorOrder } from '../../api/model';

interface Props {
  order: HouseOrder | VendorOrder;
  type: 'house' | 'vendor';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [];
  view: [order: HouseOrder | VendorOrder];
  edit: [order: HouseOrder | VendorOrder];
}>();

const vendorStore = useVendorStore();

// Computed properties
const itemsCount = computed(() => {
  return props.order.items?.length;
});

const vendorName = computed(() => {
  if (props.type !== 'vendor') return '';
  const vendor = vendorStore.vendors.find(v => v.id === (props.order as VendorOrder).vendor_id);
  return vendor?.name;
});

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
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const viewDetails = () => {
  emit('view', props.order);
};
</script>

<style scoped>
.order-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.order-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.order-card.selected {
  border-color: #3d008d;
  background: #f8f9ff;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-id {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.order-type {
  font-size: 0.8rem;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  width: fit-content;
}

.order-status {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-completed {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-unknown {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-info {
  flex: 1;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #7f8c8d;
  min-width: 60px;
  margin-right: 0.5rem;
}

.info-value {
  color: #2c3e50;
  flex: 1;
}

.info-value.notes {
  font-style: italic;
  color: #7f8c8d;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-items-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #7f8c8d;
  white-space: nowrap;
}

.items-icon {
  font-size: 1rem;
}

.items-text {
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid #bdc3c7;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #3d008d;
  color: #3d008d;
}

.action-btn.view:hover {
  background: #e8f4fd;
}

.action-btn.edit:hover {
  background: #fff3cd;
  border-color: #f39c12;
  color: #f39c12;
}

.btn-icon {
  font-size: 0.9rem;
}

.order-meta {
  font-size: 0.75rem;
  color: #95a5a6;
}

.created-at {
  font-style: italic;
}

@media (max-width: 768px) {
  .order-card {
    padding: 1rem;
  }
  
  .order-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .order-items-count {
    align-self: flex-start;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .order-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
