<template>
  <div class="vendor-items-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToVendorManagement">
          <span class="btn-icon">←</span>
          Back to Vendor
        </button>
        <h1>Vendor Items</h1>
        <p class="page-subtitle">{{ vendorName }} • {{ items.length }} items</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading vendor items...</p>
    </div>

    <!-- Content -->
    <div v-else class="items-content">
      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-value">{{ items.length }}</div>
          <div class="stat-label">Total Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeItems }}</div>
          <div class="stat-label">Active Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ availableItems }}</div>
          <div class="stat-label">Available Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averagePrice }}</div>
          <div class="stat-label">Avg Price</div>
        </div>
      </div>

      <!-- Items Grid -->
      <div class="items-section">
        <h2>Items ({{ items.length }})</h2>
        
        <div v-if="items.length === 0" class="empty-state">
          <h3>No Items Found</h3>
          <p>This vendor has no items available.</p>
        </div>

        <div v-else class="items-grid">
          <div 
            v-for="item in items" 
            :key="item.id" 
            class="item-card"
            @click="viewItemDetail(item.id)"
          >
            <div class="item-header">
              <div class="item-info">
                <h3 class="item-name">{{ item.product_name }}</h3>
                <p class="item-sku">SKU: {{ item.sku || 'N/A' }}</p>
              </div>
              <div class="item-status">
                <span class="status-badge" :class="getStatusClass(item)">
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <div class="item-details">
              <div class="detail-row">
                <span class="detail-label">Brand:</span>
                <span class="detail-value">{{ item.brand || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">{{ item.category || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pack Size:</span>
                <span class="detail-value">{{ item.pack_size }} {{ item.pack_unit }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Case Size:</span>
                <span class="detail-value">{{ item.case_size }} units</span>
              </div>
            </div>

            <div class="item-pricing">
              <div class="price-info">
                <span class="price-label">Price per Case:</span>
                <span class="price-value">${{ item.price_per_case }}</span>
              </div>
              <div class="price-info">
                <span class="price-label">Cost Price:</span>
                <span class="price-value">${{ item.cost_price }}</span>
              </div>
            </div>

            <div class="item-actions">
              <button class="action-btn primary" @click.stop="viewItemDetail(item.id)">
                View Details
              </button>
              <button class="action-btn secondary" @click.stop="viewOrderHistory(item.id)">
                Order History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useVendorItemStore } from '../../../stores/vendor-items';
import { useVendorStore } from '../../../stores/vendors';

const router = useRouter();
const vendorItemStore = useVendorItemStore();
const vendorStore = useVendorStore();

const props = defineProps({
  vendorId: {
    type: String,
    required: true
  }
});

const loading = ref(false);

// Computed properties
const items = computed(() => {
  return vendorItemStore.vendorItems.filter(item => item.vendor_id === Number(props.vendorId));
});

const vendorName = computed(() => {
  const vendor = vendorStore.vendors.find(v => v.id === Number(props.vendorId));
  return vendor?.name || `Vendor #${props.vendorId}`;
});

const activeItems = computed(() => {
  return items.value.filter(item => item.is_active).length;
});

const availableItems = computed(() => {
  return items.value.filter(item => item.is_available).length;
});

const averagePrice = computed(() => {
  if (items.value.length === 0) return '$0.00';
  const total = items.value.reduce((sum, item) => {
    return sum + parseFloat(item.price_per_case || '0');
  }, 0);
  const avg = total / items.value.length;
  return isNaN(avg) ? '$0.00' : `$${avg.toFixed(2)}`;
});

// Methods
const getStatusClass = (item: any) => {
  if (!item.is_active) return 'status-inactive';
  if (!item.is_available) return 'status-unavailable';
  return 'status-active';
};

const viewItemDetail = (itemId: number) => {
  router.push(`/vendors/items/${itemId}`);
};

const viewOrderHistory = (itemId: number) => {
  router.push(`/vendors/items/${itemId}/orders`);
};

const backToVendorManagement = () => {
  router.push(`/vendors/${props.vendorId}`);
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      vendorItemStore.fetchAllVendorItems(),
      vendorStore.fetchVendors()
    ]);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.vendor-items-page {
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

.items-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
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

.items-section {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
}

.items-section h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.item-sku {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.item-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-unavailable {
  background: #fff3cd;
  color: #856404;
}

.item-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
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

.item-pricing {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.price-value {
  font-size: 1rem;
  color: #3d008d;
  font-weight: 700;
}

.item-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.action-btn.primary {
  background: #3d008d;
  color: white;
  border-color: #3d008d;
}

.action-btn.primary:hover {
  background: #2a0061;
  border-color: #2a0061;
}

.action-btn.secondary {
  background: white;
  color: #495057;
  border-color: #dee2e6;
}

.action-btn.secondary:hover {
  background: #f8f9fa;
  border-color: #3d008d;
  color: #3d008d;
}

@media (max-width: 768px) {
  .vendor-items-page {
    padding: 1rem;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
  
  .item-details {
    grid-template-columns: 1fr;
  }
  
  .item-pricing {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .item-actions {
    flex-direction: column;
  }
}
</style>
