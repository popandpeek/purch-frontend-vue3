<template>
  <div class="vendor-item-detail">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToItemList">
          <span class="btn-icon">←</span>
          Back to Items
        </button>
        <h1>{{ productName || 'Loading...' }}</h1>
        <p class="item-subtitle">{{ vendorName }} • SKU: {{ itemSku }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!selectedItem" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading item details...</p>
    </div>

    <!-- Content -->
    <div v-else class="detail-content">
      <!-- Product Information -->
      <div class="section">
        <h3>Product Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">Product Name</label>
            <span class="info-value">{{ selectedItem.product_name }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">Brand</label>
            <span class="info-value">{{ selectedItem.brand || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">Category</label>
            <span class="info-value">{{ selectedItem.category || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">SKU</label>
            <span class="info-value">{{ selectedItem.sku || 'N/A' }}</span>
          </div>
          <div class="info-item full-width">
            <label class="info-label">Description</label>
            <span class="info-value">{{ selectedItem.description || 'No description available' }}</span>
          </div>
        </div>
      </div>

      <!-- Pricing Information -->
      <div class="section">
        <h3>Pricing Information</h3>
        <div class="pricing-grid">
          <div class="pricing-item">
            <label class="pricing-label">Price per Case</label>
            <span class="pricing-value">${{ selectedItem.price_per_case }}</span>
          </div>
          <div class="pricing-item">
            <label class="pricing-label">Cost Price</label>
            <span class="pricing-value">${{ selectedItem.cost_price }}</span>
          </div>
        </div>
      </div>

      <!-- Packaging Information -->
      <div class="section">
        <h3>Packaging Information</h3>
        <div class="packaging-grid">
          <div class="packaging-item">
            <label class="packaging-label">Case Size</label>
            <span class="packaging-value">{{ selectedItem.case_size }} units</span>
          </div>
          <div class="packaging-item">
            <label class="packaging-label">Pack Size</label>
            <span class="packaging-value">{{ selectedItem.pack_size }} {{ selectedItem.pack_unit }}</span>
          </div>
          <div class="packaging-item">
            <label class="packaging-label">Case Weight</label>
            <span class="packaging-value">{{ selectedItem.case_weight }} {{ selectedItem.case_weight_unit }}</span>
          </div>
          <div class="packaging-item">
            <label class="packaging-label">Item Weight</label>
            <span class="packaging-value">{{ selectedItem.weight }} {{ selectedItem.case_weight_unit }}</span>
          </div>
          <div class="packaging-item">
            <label class="packaging-label">Dimensions</label>
            <span class="packaging-value">{{ selectedItem.dimensions || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Order Information -->
      <div class="section">
        <h3>Order Information</h3>
        <div class="order-grid">
          <div class="order-item">
            <label class="order-label">Min Order Quantity</label>
            <span class="order-value">{{ selectedItem.min_order_quantity }}</span>
          </div>
          <div class="order-item">
            <label class="order-label">Max Order Quantity</label>
            <span class="order-value">{{ selectedItem.max_order_quantity }}</span>
          </div>
          <div class="order-item">
            <label class="order-label">Shelf Life</label>
            <span class="order-value">{{ selectedItem.shelf_life_days }} days</span>
          </div>
          <div class="order-item">
            <label class="order-label">Storage Requirements</label>
            <span class="order-value">{{ selectedItem.storage_requirements }}</span>
          </div>
        </div>
      </div>

      <!-- Status Information -->
      <div class="section">
        <h3>Status Information</h3>
        <div class="status-grid">
          <div class="status-item">
            <label class="status-label">Availability</label>
            <span class="status-value" :class="selectedItem.is_available ? 'available' : 'unavailable'">
              {{ selectedItem.is_available ? 'Available' : 'Unavailable' }}
            </span>
          </div>
          <div class="status-item">
            <label class="status-label">Active Status</label>
            <span class="status-value" :class="selectedItem.is_active ? 'active' : 'inactive'">
              {{ selectedItem.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * imports
 */
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVendorItemStore } from '../../../stores/vendor-items'
import { useVendorStore } from "@/stores/vendors";

/**
 * router
 */
const router = useRouter()

/**
 * store
 */

const vendorStore = useVendorStore()
const vendorProductItems = useVendorItemStore()
const { fetchVendors } = useVendorStore()

fetchVendors()

/**
 * props
 */
const props = defineProps ({
  vendorItemId: {
    type: String,
    required: true,
  }
})

/**
 * computed
 */
const selectedItem = computed(() => {
  return vendorProductItems.vendorItems.find( (item) => item.id === Number(props.vendorItemId))
})

const productName = computed(() => {
  return selectedItem.value?.product_name
})

const itemSku = computed(() => {
  return selectedItem.value?.sku || 'N/A'
})

const vendorName = computed(() => {
  return vendorStore.vendors.find((vendor) => vendor.id === selectedItem.value?.vendor_id)?.name || 'Unknown Vendor';
})



/**
 * methods
 */
const backToItemList = () => {
  if (selectedItem.value?.vendor_id) {
    router.push(`/vendors/${selectedItem.value.vendor_id}/items`);
  } else {
    // Fallback to vendor management if no vendor ID
    router.push('/vendors');
  }
}

</script>

<style scoped>
.vendor-item-detail {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.header-content h1 {
  margin: 0.5rem 0;
  color: #2c3e50;
  font-size: 2rem;
}

.item-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #3d008d;
  border: 1px solid #3d008d;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.back-btn:hover {
  background: #f8f9fa;
}

.btn-icon {
  font-size: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
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

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.info-grid,
.pricing-grid,
.packaging-grid,
.order-grid,
.status-grid {
  display: grid;
  gap: 1rem;
}

.info-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.pricing-grid,
.packaging-grid,
.order-grid,
.status-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.info-item,
.pricing-item,
.packaging-item,
.order-item,
.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label,
.pricing-label,
.packaging-label,
.order-label,
.status-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value,
.pricing-value,
.packaging-value,
.order-value,
.status-value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
}

.pricing-value {
  color: #27ae60;
  font-weight: 600;
  font-size: 1.1rem;
}

.status-value.available,
.status-value.active {
  color: #27ae60;
  font-weight: 600;
}

.status-value.unavailable,
.status-value.inactive {
  color: #e74c3c;
  font-weight: 600;
}

@media (max-width: 768px) {
  .vendor-item-detail {
    padding: 1rem;
  }
  
  .info-grid,
  .pricing-grid,
  .packaging-grid,
  .order-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
}
</style>
