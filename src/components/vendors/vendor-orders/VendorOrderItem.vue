<template>
  <div class="order-card" @click="handleView">
    <div class="order-header">
      <div class="order-info">
        <h3 class="order-title">Order #{{ order.id }}</h3>
        <p class="order-date">{{ formatDate(order.date) }}</p>
      </div>
      <div class="order-status">
        <span class="status-badge" :class="getStatusClass(order.status)">
          {{ order.status.toUpperCase() }}
        </span>
      </div>
    </div>

    <div class="order-details">
      <div class="detail-row">
        <span class="detail-label">Total Amount:</span>
        <span class="detail-value total">${{ calculatedTotal.toFixed(2) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Items:</span>
        <span class="detail-value">{{ order.items?.length }} items</span>
      </div>
      <div class="detail-row" v-if="order.notes">
        <span class="detail-label">Notes:</span>
        <span class="detail-value notes">{{ order.notes }}</span>
      </div>
    </div>

    <div class="order-actions">
      <button class="action-btn view" @click.stop="handleView">
        View Details
      </button>
      <button 
        v-if="order.status === 'pending'"
        class="action-btn edit" 
        @click.stop="handleEdit"
      >
        Edit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { VendorOrder } from '../../../api/model';

// Props
const props = defineProps<{
  order: VendorOrder;
}>();

// Emits
const emit = defineEmits<{
  view: [order: VendorOrder];
  edit: [order: VendorOrder];
}>();

// Computed properties
const calculatedTotal = computed(() => {
  // If no items, use the total_amount from the order
  if (!props.order.items || props.order.items.length === 0) {
    return props.order.total_amount || 0;
  }
  
  // Calculate total from items
  const calculated = props.order.items.reduce((total, item) => {
    // Handle different possible field names from API
    const price = parseFloat((item as any).price || (item as any).unit_price || '0');
    const quantity = parseFloat((item as any).quantity || '0');
    
    // Return total if price or quantity is invalid
    if (isNaN(price) || isNaN(quantity)) {
      return total;
    }
    
    return total + (price * quantity);
  }, 0);
  
  // Ensure we return a valid number
  return isNaN(calculated) ? 0 : calculated;
});

// Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'status-pending';
    case 'confirmed':
      return 'status-confirmed';
    case 'shipped':
      return 'status-shipped';
    case 'delivered':
      return 'status-delivered';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-unknown';
  }
};

const handleView = () => {
  emit('view', props.order);
};

const handleEdit = () => {
  emit('edit', props.order);
};
</script>

<style scoped>
.order-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.order-card:hover {
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
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
}

.order-date {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.order-status {
  margin-left: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-confirmed {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-shipped {
  background: #cce5ff;
  color: #004085;
  border: 1px solid #99d6ff;
}

.status-delivered {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
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

.order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
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

.detail-value.total {
  color: #3d008d;
  font-size: 1rem;
  font-weight: 700;
}

.detail-value.notes {
  font-style: italic;
  color: #6c757d;
}

.order-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  color: #495057;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #3d008d;
  color: #3d008d;
}

.action-btn.view {
  background: #e8f4fd;
  border-color: #3d008d;
  color: #3d008d;
}

.action-btn.view:hover {
  background: #3d008d;
  color: white;
}

.action-btn.edit {
  background: #fff3cd;
  border-color: #f39c12;
  color: #f39c12;
}

.action-btn.edit:hover {
  background: #f39c12;
  color: white;
}

.btn-icon {
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .order-status {
    margin-left: 0;
    align-self: flex-start;
  }
  
  .order-details {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .order-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
