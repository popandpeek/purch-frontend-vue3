<template>
  <div class="house-order-detail">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToOrders">
          Back to Orders
        </button>
        <h1>House Order #{{ houseOrderId }}</h1>
        <p class="order-subtitle">{{ orderDate ? formatDate(orderDate) : 'Loading...' }}</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="editOrder" :disabled="orderSubmitted">
          Edit Order
        </button>
        <button class="btn btn-primary" @click="generateVendorBreakdown" :disabled="orderSubmitted || !hasItems">
          <span class="btn-icon">🛒</span>
          Generate Vendor Orders
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading order details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadOrder">
        Retry
      </button>
    </div>

    <!-- Content -->
    <div v-else-if="selectedItem" class="detail-content">
      <!-- Order Overview -->
      <div class="overview-card">
        <div class="overview-header">
          <div class="order-info">
            <h2>Order #{{ houseOrderId }}</h2>
            <div class="order-meta">
              <span class="status-badge" :class="statusClass">
                {{ statusText }}
              </span>
              <span class="priority-badge" v-if="hasHighPriorityItems">
                High Priority Items
              </span>
            </div>
          </div>
          <div class="cost-info">
            <div class="total-cost">${{ totalCost }}</div>
            <div class="item-count">{{ itemCount }} items</div>
          </div>
        </div>
        <div class="order-notes" v-if="selectedItem.notes">
          <h4>Notes:</h4>
          <p>{{ selectedItem.notes }}</p>
        </div>
      </div>

      <!-- Order Items -->
      <div class="items-section">
        <div class="section-header">
          <h3>Order Items</h3>
          <div class="item-count">{{ itemCount }} items</div>
        </div>
        
        <div v-if="hasItems" class="items-list">
          <div 
            v-for="item in itemList" 
            :key="item.id"
            class="order-item-card"
          >
            <div class="item-header">
              <div class="item-info">
                <h4>{{ item.house_item?.name ?? 'Unknown Item' }}</h4>
                <div class="item-meta">
                  <span class="item-category">{{ formatInventoryCategory(item.house_item?.inventory_category) }}</span>
                  <span class="item-location">{{ formatStorageLocation(item.house_item?.storage_location) }}</span>
                </div>
              </div>
              <div class="item-priority">
                <span class="priority-badge" :class="`priority-${item.priority}`">
                  {{ item.priority.toUpperCase() }}
                </span>
              </div>
            </div>
            
            <div class="item-details">
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">{{ item.quantity }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Unit:</span>
                <span class="detail-value">{{ item.house_item?.tracking_unit ?? 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Unit Price:</span>
                <span class="detail-value">${{ formatPrice(item.house_item?.current_price_per_unit) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total:</span>
                <span class="detail-value total-price">${{ formatPrice(calculateItemTotal(item)) }}</span>
              </div>
            </div>

            <div class="item-actions" v-if="!orderSubmitted">
              <button class="action-btn edit" @click="editItem(item)">
                Edit
              </button>
              <button class="action-btn remove" @click="removeItem(item)">
                Remove
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <h3>No Items in Order</h3>
          <p>Add items to this order to get started.</p>
          <button class="btn btn-primary" @click="addItems">
            Add Items
          </button>
        </div>
      </div>

      <!-- Vendor Orders (if generated) -->
      <div v-if="selectedItem.vendor_orders && selectedItem.vendor_orders.length > 0" class="vendor-orders-section">
        <div class="section-header">
          <h3>Generated Vendor Orders</h3>
          <div class="vendor-count">{{ selectedItem.vendor_orders.length }} orders</div>
        </div>
        
        <div class="vendor-orders-list">
          <div 
            v-for="vendorOrder in selectedItem.vendor_orders" 
            :key="vendorOrder.id"
            class="vendor-order-card"
          >
            <div class="vendor-order-header">
              <div class="vendor-info">
                <h4>{{ vendorOrder.vendor?.name ?? 'Unknown Vendor' }}</h4>
                <div class="vendor-meta">
                  <span class="order-date">{{ formatDate(vendorOrder.date) }}</span>
                  <span class="order-status" :class="`status-${vendorOrder.status}`">
                    {{ vendorOrder.status.toUpperCase() }}
                  </span>
                </div>
              </div>
              <div class="vendor-total">
                ${{ formatPrice(calculateVendorOrderTotal(vendorOrder)) }}
              </div>
            </div>
            
            <div class="vendor-order-actions">
              <button class="action-btn view" @click="viewVendorOrder(vendorOrder.id)">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <div class="detail-card">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button class="action-btn primary" @click="addItems" :disabled="orderSubmitted">
              Add Items
            </button>
            <button class="action-btn secondary" @click="editOrder" :disabled="orderSubmitted">
              Edit Order
            </button>
            <button class="action-btn tertiary" @click="duplicateOrder">
              Duplicate Order
            </button>
            <button class="action-btn danger" @click="deleteOrder" :disabled="orderSubmitted">
              Delete Order
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="not-found-state">
      <h2>Order Not Found</h2>
      <p>The order you're looking for doesn't exist or has been removed.</p>
      <button class="btn btn-primary" @click="backToOrders">
        Back to Orders
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseOrdersStore } from '../../stores/house-orders'
import { useVendorOrderStore } from '../../stores/vendor-orders'
import { formatStorageLocation, formatInventoryCategory } from '../../constants/enums'
import type { HouseOrderItem } from '../../api/model'

/**
 * store
 */
const houseOrderStore = useHouseOrdersStore()
const vendorOrderStore = useVendorOrderStore()

/**
 * router
 */
const router = useRouter()

/**
 * props
 */
const props = defineProps({
  houseOrderId: {
    type: String,
    required: true,
  },
})

// State
const loading = ref(false)
const error = ref<string | null>(null)

/**
 * computed
 */
const selectedItem = computed(() => {
  return houseOrderStore.orders.find(
    (order) => order.id === Number(props.houseOrderId)
  )
})

const orderDate = computed(() => {
  return selectedItem.value?.date
})

const orderSubmitted = computed(() => {
  if (selectedItem.value == null) {
    return false
  }
  return selectedItem.value.status === 'completed' || selectedItem.value.status === 'cancelled'
})

const hasItems = computed(() => {
  return selectedItem.value?.items && selectedItem.value.items.length > 0
})

const itemList = computed(() => {
  return selectedItem.value?.items ?? []
})

const itemCount = computed(() => {
  return itemList.value.length
})

const totalCost = computed(() => {
  if (!selectedItem.value) return '0.00'
  return formatPrice(selectedItem.value.total_estimated_cost ?? 0)
})

const statusText = computed(() => {
  if (!selectedItem.value) return 'Unknown'
  return selectedItem.value.status.charAt(0).toUpperCase() + selectedItem.value.status.slice(1)
})

const statusClass = computed(() => {
  if (!selectedItem.value) return 'unknown'
  return selectedItem.value.status
})

const hasHighPriorityItems = computed(() => {
  return itemList.value.some(item => item.priority === 'high')
})

/**
 * methods
 */
const loadOrder = async () => {
  loading.value = true
  error.value = null
  
  try {
    await houseOrderStore.fetchOrderById(Number(props.houseOrderId))
    // Also load vendor orders to get their totals
    await vendorOrderStore.fetchVendorOrders()
  } catch (err: any) {
    error.value = 'Failed to load order details'
    console.error('Error loading order:', err)
  } finally {
    loading.value = false
  }
}

const backToOrders = () => {
  router.push('/orders/house')
}

const editOrder = () => {
  router.push(`/orders/house/${props.houseOrderId}/edit`)
}

const addItems = () => {
  // TODO: Implement add items modal/page
  console.log('Add items to order:', props.houseOrderId)
}

const editItem = (item: HouseOrderItem) => {
  // TODO: Implement edit item modal
  console.log('Edit item:', item.id)
}

const removeItem = async (item: HouseOrderItem) => {
  if (confirm('Are you sure you want to remove this item from the order?')) {
    try {
      await houseOrderStore.removeOrderItem(Number(props.houseOrderId), item.id)
    } catch (err: any) {
      console.error('Error removing item:', err)
    }
  }
}

const generateVendorBreakdown = async () => {
  try {
    // await houseOrderStore.generateVendorBreakdown(Number(props.houseOrderId))
  } catch (err: any) {
    console.error('Error generating vendor breakdown:', err)
  }
}

const viewVendorOrder = (vendorOrderId: number) => {
  router.push(`/vendors/orders/${vendorOrderId}`)
}

const duplicateOrder = () => {
  // TODO: Implement duplicate order functionality
  console.log('Duplicate order:', props.houseOrderId)
}

const deleteOrder = async () => {
  if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
    try {
      await houseOrderStore.deleteOrder(Number(props.houseOrderId))
      router.push('/orders/house')
    } catch (err: any) {
      console.error('Error deleting order:', err)
    }
  }
}

const calculateItemTotal = (item: HouseOrderItem) => {
  const price = parseFloat(item.house_item?.current_price_per_unit ?? '0')
  return price * item.quantity
}

const calculateVendorOrderTotal = (vendorOrder: any) => {
  // First, try to use total_amount if it's available and valid
  const totalAmount = parseFloat(vendorOrder.total_amount ?? '0');
  if (totalAmount > 0) {
    return totalAmount;
  }
  
  // Try to get the full vendor order from the store
  const fullVendorOrder = vendorOrderStore.vendorOrders.find(vo => vo.id === vendorOrder.id);
  if (fullVendorOrder) {
    // Use the full vendor order's total_amount
    const fullTotalAmount = parseFloat(fullVendorOrder.total_amount?.toString() ?? '0');
    if (fullTotalAmount > 0) {
      return fullTotalAmount;
    }
    
    // Calculate from items if available
    if (fullVendorOrder.items && fullVendorOrder.items.length > 0) {
      return fullVendorOrder.items.reduce((total: number, item: any) => {
        const totalPrice = parseFloat(item.total_price ?? '0');
        if (totalPrice > 0) {
          return total + totalPrice;
        }
        
        const unitPrice = parseFloat(item.unit_price ?? '0');
        const quantity = parseFloat(item.quantity ?? '0');
        return total + (unitPrice * quantity);
      }, 0);
    }
  }
  
  // If no total_amount or it's 0, calculate from items if available
  if (vendorOrder?.items && vendorOrder.items.length > 0) {
    return vendorOrder.items.reduce((total: number, item: any) => {
      // Use total_price if available, otherwise calculate from unit_price * quantity
      const totalPrice = parseFloat(item.total_price ?? '0');
      if (totalPrice > 0) {
        return total + totalPrice;
      }
      
      const unitPrice = parseFloat(item.unit_price ?? '0');
      const quantity = parseFloat(item.quantity ?? '0');
      return total + (unitPrice * quantity);
    }, 0);
  }
  
  // If we can't calculate, return 0
  return 0;
}

const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * lifecycle
 */
onMounted(async () => {
  await loadOrder()
})
</script>

<style scoped>
.house-order-detail {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.header-content {
  flex: 1;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: #3d008d;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
}

.order-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Loading and Error States */
.loading-state, .error-state, .not-found-state {
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

.error-icon, .not-found-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Content */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Overview Card */
.overview-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-info h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.order-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.status-badge.processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  background: #ff6b6b;
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.cost-info {
  text-align: right;
}

.total-cost {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.item-count {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.order-notes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f8f9fa;
}

.order-notes h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.order-notes p {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.5;
}

/* Sections */
.items-section, .vendor-orders-section, .actions-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f8f9fa;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.item-count, .vendor-count {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.order-item-card:hover {
  border-color: #3d008d;
  box-shadow: 0 2px 8px rgba(61, 0, 141, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.item-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.item-category, .item-location {
  padding: 0.2rem 0.5rem;
  background: #f8f9fa;
  color: #6c757d;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.priority-high {
  background: #ff6b6b;
  color: white;
}

.priority-badge.priority-normal {
  background: #28a745;
  color: white;
}

.priority-badge.priority-low {
  background: #6c757d;
  color: white;
}

.item-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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
}

.detail-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.total-price {
  color: #3d008d;
  font-size: 1rem;
}

.item-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: #7f8c8d;
}

/* Vendor Orders */
.vendor-orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vendor-order-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.vendor-order-card:hover {
  border-color: #3d008d;
  box-shadow: 0 2px 8px rgba(61, 0, 141, 0.1);
}

.vendor-order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.vendor-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.vendor-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.order-date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.order-status {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.order-status.status-pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.status-confirmed {
  background: #d1ecf1;
  color: #0c5460;
}

.order-status.status-shipped {
  background: #d4edda;
  color: #155724;
}

.order-status.status-delivered {
  background: #d4edda;
  color: #155724;
}

.order-status.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.vendor-total {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.vendor-order-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Action Buttons */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  text-align: left;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #3d008d;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2a0063;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #dee2e6;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.action-btn.tertiary {
  background: #e8f4fd;
  color: #3d008d;
  border: 1px solid #b3d9ff;
}

.action-btn.tertiary:hover:not(:disabled) {
  background: #d1ecf1;
}

.action-btn.danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.action-btn.danger:hover:not(:disabled) {
  background: #f5c6cb;
}

.action-btn.edit {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.action-btn.edit:hover {
  background: #ffeaa7;
}

.action-btn.remove {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.action-btn.remove:hover {
  background: #f5c6cb;
}

.action-btn.view {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.action-btn.view:hover {
  background: #bee5eb;
}

.btn-icon {
  font-size: 1rem;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2a0063;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .house-order-detail {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
    justify-content: center;
  }
  
  .overview-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cost-info {
    text-align: left;
  }
  
  .item-details {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .item-actions {
    flex-direction: column;
  }
  
  .vendor-order-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .vendor-total {
    text-align: left;
  }
}
</style>
