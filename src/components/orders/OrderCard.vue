<template>
  <div class="order-card" :class="`status-${order.status}`">
    <div class="card-header">
      <div class="order-info">
        <h3 class="order-title">Order #{{ order.id }}</h3>
        <div class="order-meta">
          <span class="order-date">{{ formatDate(order.date) }}</span>
          <span class="order-status" :class="`status-${order.status}`">
            {{ formatStatus(order.status) }}
          </span>
        </div>
      </div>
      <div class="order-actions">
        <button class="action-btn" @click="handleView" title="View Order">
          <span class="btn-icon">👁️</span>
        </button>
        <button 
          v-if="canEdit" 
          class="action-btn" 
          @click="handleEdit" 
          title="Edit Order"
        >
          <span class="btn-icon">✏️</span>
        </button>
        <button 
          v-if="canSubmit" 
          class="action-btn submit" 
          @click="handleSubmit" 
          title="Submit Order"
        >
          <span class="btn-icon">📤</span>
        </button>
        <button 
          v-if="canDelete" 
          class="action-btn delete" 
          @click="handleDelete" 
          title="Delete Order"
        >
          <span class="btn-icon">🗑️</span>
        </button>
      </div>
    </div>

    <div class="card-content">
      <!-- Order Summary -->
      <div class="order-summary">
        <div class="summary-row">
          <span class="summary-label">Items:</span>
          <span class="summary-value">{{ (order.items || []).length }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Cost:</span>
          <span class="summary-value">${{ (order.total_estimated_cost || order.total_amount || 0).toFixed(2) }}</span>
        </div>
        <div v-if="order.vendor_orders?.length" class="summary-row">
          <span class="summary-label">Vendor Orders:</span>
          <span class="summary-value">{{ order.vendor_orders.length }}</span>
        </div>
      </div>

      <!-- Items Preview -->
      <div v-if="(order.items || []).length > 0" class="items-preview">
        <h4>Items</h4>
        <div class="items-list">
          <div
            v-for="item in (order.items || []).slice(0, 3)"
            :key="item.id || `temp_${Math.random()}`"
            class="item-preview"
          >
            <span class="item-name">{{ getItemName(item.house_item_id) }}</span>
            <span class="item-quantity">{{ item.quantity }}</span>
          </div>
          <div v-if="(order.items || []).length > 3" class="more-items">
            +{{ (order.items || []).length - 3 }} more items
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="order.notes" class="order-notes">
        <h4>Notes</h4>
        <p class="notes-text">{{ order.notes }}</p>
      </div>

      <!-- Vendor Orders Preview -->
      <div v-if="order.vendor_orders?.length" class="vendor-orders-preview">
        <h4>Vendor Orders</h4>
        <div class="vendor-list">
          <div
            v-for="vendorOrder in order.vendor_orders.slice(0, 2)"
            :key="vendorOrder.id"
            class="vendor-preview"
          >
            <span class="vendor-name">{{ vendorOrder.vendor_name }}</span>
            <span class="vendor-cost">${{ vendorOrder.total_cost.toFixed(2) }}</span>
          </div>
          <div v-if="order.vendor_orders.length > 2" class="more-vendors">
            +{{ order.vendor_orders.length - 2 }} more vendors
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="order-timestamps">
        <span v-if="order.created_at" class="timestamp">
          Created: {{ formatDateTime(order.created_at) }}
        </span>
        <span v-if="order.updated_at && order.updated_at !== order.created_at" class="timestamp">
          Updated: {{ formatDateTime(order.updated_at) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHouseItemsStore } from '@/stores/house-items';
import type { HouseOrder } from '@/stores/house-orders';

// Props
const props = defineProps<{
  order: HouseOrder;
}>();

// Emits
const emit = defineEmits<{
  view: [order: HouseOrder];
  edit: [order: HouseOrder];
  submit: [order: HouseOrder];
  delete: [order: HouseOrder];
}>();

// Store
const houseItemsStore = useHouseItemsStore();

// Computed
const canEdit = computed(() => 
  props.order.status === 'draft'
);

const canSubmit = computed(() => 
  props.order.status === 'draft' && props.order.items.length > 0
);

const canDelete = computed(() => 
  props.order.status === 'draft' || props.order.status === 'cancelled'
);

// Methods
const getItemName = (houseItemId: number): string => {
  const item = houseItemsStore.items.find((i: any) => i.id === houseItemId);
  return item?.name || `Item #${houseItemId}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return statusMap[status] || status;
};

const handleView = () => {
  emit('view', props.order);
};

const handleEdit = () => {
  emit('edit', props.order);
};

const handleSubmit = () => {
  emit('submit', props.order);
};

const handleDelete = () => {
  emit('delete', props.order);
};
</script>

<style scoped>
.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  overflow: hidden;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.order-card.status-draft {
  border-left: 4px solid #6c757d;
}

.order-card.status-submitted {
  border-left: 4px solid #3d008d;
}

.order-card.status-processing {
  border-left: 4px solid #f39c12;
}

.order-card.status-completed {
  border-left: 4px solid #27ae60;
}

.order-card.status-cancelled {
  border-left: 4px solid #e74c3c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #f1f3f4;
}

.order-info {
  flex: 1;
}

.order-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-date {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.order-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.order-status.status-draft {
  background: #f8f9fa;
  color: #6c757d;
}

.order-status.status-submitted {
  background: #e8f4fd;
  color: #3d008d;
}

.order-status.status-processing {
  background: #fff3cd;
  color: #f39c12;
}

.order-status.status-completed {
  background: #d4edda;
  color: #27ae60;
}

.order-status.status-cancelled {
  background: #f8d7da;
  color: #e74c3c;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.action-btn.submit {
  background: #e8f4fd;
  border-color: #3d008d;
  color: #3d008d;
}

.action-btn.submit:hover {
  background: #3d008d;
  color: white;
}

.action-btn.delete {
  background: #f8d7da;
  border-color: #e74c3c;
  color: #e74c3c;
}

.action-btn.delete:hover {
  background: #e74c3c;
  color: white;
}

.btn-icon {
  font-size: 1rem;
}

.card-content {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.summary-value {
  color: #2c3e50;
  font-size: 0.85rem;
  font-weight: 600;
}

.items-preview,
.vendor-orders-preview,
.order-notes {
  border-top: 1px solid #f1f3f4;
  padding-top: 1rem;
}

.items-preview h4,
.vendor-orders-preview h4,
.order-notes h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
}

.items-list,
.vendor-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-preview,
.vendor-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.85rem;
}

.item-name,
.vendor-name {
  color: #2c3e50;
  font-weight: 500;
}

.item-quantity,
.vendor-cost {
  color: #6c757d;
  font-weight: 600;
}

.more-items,
.more-vendors {
  color: #6c757d;
  font-size: 0.8rem;
  font-style: italic;
  text-align: center;
  padding: 0.25rem;
}

.notes-text {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.order-timestamps {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timestamp {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .order-actions {
    justify-content: center;
  }
  
  .summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .item-preview,
  .vendor-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>