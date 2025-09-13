<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Order #{{ order?.id }}</h2>
        <div class="header-actions">
          <button class="btn btn-outline" @click="handleEdit" v-if="canEdit">
            <span class="btn-icon">✏️</span>
            Edit
          </button>
          <button class="btn btn-primary" @click="handleSubmit" v-if="canSubmit">
            <span class="btn-icon">📤</span>
            Submit Order
          </button>
          <button class="close-btn" @click="handleClose">
            <span class="btn-icon">×</span>
          </button>
        </div>
      </div>
      
      <div class="modal-body">
        <div v-if="!order" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
        
        <div v-else class="order-detail">
          <!-- Order Info -->
          <div class="info-section">
            <h3>Order Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Order Date</label>
                <span>{{ formatDate(order.date) }}</span>
              </div>
              <div class="info-item">
                <label>Status</label>
                <span class="status-badge" :class="`status-${order.status}`">
                  {{ formatStatus(order.status) }}
                </span>
              </div>
              <div class="info-item">
                <label>Total Cost</label>
                <span class="cost-value">${{ order.total_estimated_cost.toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <label>Items Count</label>
                <span>{{ order.items.length }}</span>
              </div>
              <div class="info-item" v-if="order.vendor_orders?.length">
                <label>Vendor Orders</label>
                <span>{{ order.vendor_orders.length }}</span>
              </div>
              <div class="info-item full-width" v-if="order.notes">
                <label>Notes</label>
                <span class="notes-text">{{ order.notes }}</span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="items-section">
            <h3>Order Items</h3>
            <div v-if="order.items.length === 0" class="empty-state">
              <p>No items in this order</p>
            </div>
            <div v-else class="items-list">
              <div
                v-for="item in order.items"
                :key="item.id || `temp_${Math.random()}`"
                class="item-card"
              >
                <div class="item-info">
                  <h4>{{ getItemName(item.house_item_id) }}</h4>
                  <p class="item-details">
                    Quantity: {{ item.quantity }} | Priority: {{ item.priority }}
                  </p>
                </div>
                <div class="item-actions">
                  <button 
                    v-if="canEdit" 
                    class="action-btn" 
                    @click="editItem(item)"
                    title="Edit Item"
                  >
                    <span class="btn-icon">✏️</span>
                  </button>
                  <button 
                    v-if="canEdit" 
                    class="action-btn delete" 
                    @click="removeItem(item)"
                    title="Remove Item"
                  >
                    <span class="btn-icon">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Vendor Orders -->
          <div v-if="order.vendor_orders?.length" class="vendor-orders-section">
            <h3>Vendor Orders</h3>
            <div class="vendor-orders-list">
              <div
                v-for="vendorOrder in order.vendor_orders"
                :key="vendorOrder.id"
                class="vendor-order-card"
              >
                <div class="vendor-info">
                  <h4>{{ vendorOrder.vendor_name }}</h4>
                  <p class="vendor-details">
                    Total: ${{ vendorOrder.total_cost.toFixed(2) }} | 
                    Status: {{ vendorOrder.status }}
                  </p>
                  <p v-if="vendorOrder.delivery_date" class="delivery-date">
                    Delivery: {{ formatDate(vendorOrder.delivery_date) }}
                  </p>
                </div>
                <div class="vendor-items">
                  <h5>Items ({{ vendorOrder.items.length }})</h5>
                  <div class="vendor-items-list">
                    <div
                      v-for="item in vendorOrder.items"
                      :key="item.id"
                      class="vendor-item"
                    >
                      <span class="item-name">{{ item.house_item_name }}</span>
                      <span class="item-quantity">{{ item.quantity }}</span>
                      <span class="item-price">${{ item.total_price.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="timestamps-section">
            <h3>Order History</h3>
            <div class="timestamps">
              <div v-if="order.created_at" class="timestamp">
                <label>Created:</label>
                <span>{{ formatDateTime(order.created_at) }}</span>
              </div>
              <div v-if="order.updated_at && order.updated_at !== order.created_at" class="timestamp">
                <label>Last Updated:</label>
                <span>{{ formatDateTime(order.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHouseItemsStore } from '@/stores/house-items';
import { useHouseOrdersStore, type HouseOrder, type HouseOrderItem } from '@/stores/house-orders';

// Props
const props = defineProps<{
  order: HouseOrder | null;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  edit: [order: HouseOrder];
}>();

// Store
const houseItemsStore = useHouseItemsStore();
const orderStore = useHouseOrdersStore();

// Computed
const canEdit = computed(() => 
  props.order?.status === 'draft'
);

const canSubmit = computed(() => 
  props.order?.status === 'draft' && (props.order?.items.length || 0) > 0
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

const handleClose = () => {
  emit('close');
};

const handleEdit = () => {
  if (props.order) {
    emit('edit', props.order);
  }
};

const handleSubmit = async () => {
  if (props.order?.id) {
    try {
      await orderStore.submitOrder(props.order.id);
      // Close modal and let parent refresh
      handleClose();
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  }
};

const editItem = (item: HouseOrderItem) => {
  // TODO: Implement item editing
  console.log('Edit item:', item);
};

const removeItem = async (item: HouseOrderItem) => {
  if (props.order?.id && item.id && confirm('Are you sure you want to remove this item?')) {
    try {
      await orderStore.removeOrderItem(props.order.id, item.id);
      // Refresh order data
      if (props.order.id) {
        await orderStore.fetchOrderById(props.order.id);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }
};

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleClose();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.btn-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
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

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section,
.items-section,
.vendor-orders-section,
.timestamps-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 2rem;
}

.timestamps-section {
  border-bottom: none;
  padding-bottom: 0;
}

.info-section h3,
.items-section h3,
.vendor-orders-section h3,
.timestamps-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.85rem;
}

.info-item span {
  color: #2c3e50;
  font-size: 0.95rem;
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

.status-badge.status-draft {
  background: #f8f9fa;
  color: #6c757d;
}

.status-badge.status-submitted {
  background: #e8f4fd;
  color: #3d008d;
}

.status-badge.status-processing {
  background: #fff3cd;
  color: #f39c12;
}

.status-badge.status-completed {
  background: #d4edda;
  color: #27ae60;
}

.status-badge.status-cancelled {
  background: #f8d7da;
  color: #e74c3c;
}

.cost-value {
  font-weight: 700;
  color: #3d008d;
  font-size: 1.1rem;
}

.notes-text {
  color: #6c757d;
  font-style: italic;
  line-height: 1.4;
}

.items-list,
.vendor-orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card,
.vendor-order-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-info,
.vendor-info {
  flex: 1;
}

.item-info h4,
.vendor-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.item-details,
.vendor-details {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0 0 0.25rem 0;
}

.delivery-date {
  color: #3d008d;
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e9ecef;
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

.vendor-items {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.vendor-items h5 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
}

.vendor-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vendor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.85rem;
}

.item-name {
  color: #2c3e50;
  font-weight: 500;
}

.item-quantity {
  color: #6c757d;
}

.item-price {
  color: #3d008d;
  font-weight: 600;
}

.timestamps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timestamp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.timestamp:last-child {
  border-bottom: none;
}

.timestamp label {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.85rem;
}

.timestamp span {
  color: #2c3e50;
  font-size: 0.85rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

/* Buttons */
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
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

.btn-primary:hover {
  background: #2a0063;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover {
  background: #3d008d;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .item-card,
  .vendor-order-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .item-actions {
    align-self: flex-end;
  }
  
  .vendor-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
