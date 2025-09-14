<template>
  <div class="house-item-detail">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToProducts">
          Back to Products
        </button>
        <h1>{{ productName || 'Loading...' }}</h1>
        <p class="product-subtitle">{{ productDescription || 'House Product' }}</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="editItem">
          Edit
        </button>
        <button class="btn btn-primary" @click="adjustStock">
          Adjust Stock
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadItem">
        Retry
      </button>
    </div>

    <!-- Content -->
    <div v-else-if="item" class="detail-content">
      <!-- Product Overview -->
      <div class="overview-card">
        <div class="overview-header">
          <div class="product-info">
            <h2>{{ productName }}</h2>
            <div class="product-meta">
              <span class="status-badge" :class="productActive ? 'active' : 'inactive'">
                {{ productActive ? 'Active' : 'Inactive' }}
              </span>
              <span class="category-badge">{{ formatInventoryCategory(productCategory) }}</span>
            </div>
          </div>
          <div class="price-info">
            <div class="price">${{ productPrice }}</div>
            <div class="unit">per {{ productUnit }}</div>
          </div>
        </div>
      </div>

      <!-- Details Grid -->
      <div class="details-grid">
        <!-- Basic Information -->
        <div class="detail-card">
          <h3>Basic Information</h3>
          <div class="detail-list">
            <div class="detail-item">
              <span class="detail-label">Description</span>
              <span class="detail-value">{{ productDescription || 'No description' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Storage Location</span>
              <span class="detail-value">{{ formatStorageLocation(productStorageLocation) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Category</span>
              <span class="detail-value">{{ formatInventoryCategory(productCategory) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <span class="detail-value" :class="productActive ? 'status-active' : 'status-inactive'">
                {{ productActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Inventory Information -->
        <div class="detail-card">
          <h3>Inventory Information</h3>
          <div class="detail-list">
            <div class="detail-item">
              <span class="detail-label">Current Stock</span>
              <span class="detail-value stock-value" :class="stockClass">
                {{ productHave || 0 }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Par Level</span>
              <span class="detail-value">{{ productPar || 'Not set' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Stock Status</span>
              <span class="detail-value" :class="stockStatusClass">
                {{ stockStatus }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Unit Price</span>
              <span class="detail-value">${{ productPrice }}</span>
            </div>
          </div>
        </div>

        <!-- Vendor Information -->
        <div v-if="vendorList && vendorList.length > 0" class="detail-card">
          <h3>Available from Vendors</h3>
          <div class="vendor-list">
            <div 
              v-for="vendor in vendorList" 
              :key="vendor"
              class="vendor-item"
              @click="viewVendor(vendor)"
            >
              <span class="vendor-name">{{ vendor }}</span>
              <span class="vendor-arrow">→</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="detail-card">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button class="action-btn primary" @click="adjustStock">
              Adjust Stock
            </button>
            <button class="action-btn secondary" @click="editItem">
              Edit Details
            </button>
            <button class="action-btn tertiary" @click="viewHistory">
              View History
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="not-found-state">
      <h2>Product Not Found</h2>
      <p>The product you're looking for doesn't exist or has been removed.</p>
      <button class="btn btn-primary" @click="backToProducts">
        Back to Products
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseItemsStore } from '../../stores/house-items'
import { useVendorStore } from '../../stores/vendors'
import { formatStorageLocation, formatInventoryCategory } from '../../constants/enums'

/**
 * store
 */
const itemsStore = useHouseItemsStore()
const {fetchVendors} = useVendorStore()
const {vendors} = storeToRefs(useVendorStore())

// State
const loading = ref(false);
const error = ref<string | null>(null);

/*
  route
*/
const router = useRouter()

/*
  props
*/
const props = defineProps ({
  houseItemId: {
    type: String,
    required: true, 
  }
})

/*
  computed
*/
const item = computed(() => {
  return itemsStore.items.find( (item) => item.id === Number(props.houseItemId))
})

const productName = computed(() => {
  return item?.value?.name
})

const productPrice = computed(() => {
  return item?.value?.current_price_per_unit
})

const productUnit = computed(() => {
  return item?.value?.tracking_unit
})

const productDescription = computed(() => {
  return item?.value?.description
})

const productStorageLocation = computed(() => {
  return item?.value?.storage_location
})

const productCategory = computed(() => {
  return item?.value?.inventory_category
})

const productPar = computed(() => {
  return item?.value?.par_level
})

const productHave = computed(() => {
  return item?.value?.current_count
})

const productActive = computed(() => {
  return item?.value?.active
})

const vendorList = computed(() => {
  let v_items: Array<import('@/api/model').VendorItem> = item?.value?.vendor_items!;
  let vendor_ids: number[] = [];
  v_items.forEach(element =>  {
    vendor_ids.push(element.vendor_id);
  });

  let filteredVendors: Array<import('@/api/model').Vendor> = vendors.value.filter(function(item) {return vendor_ids.includes(item.id)})
  let vendorNames: string[] = []
  filteredVendors.forEach(element => {
    vendorNames.push(element.name);
  });
  return vendorNames
})

// Stock status computed properties
const stockClass = computed(() => {
  const stock = productHave.value || 0;
  const par = productPar.value || 0;
  if (stock === 0) return 'out-of-stock';
  if (stock < par) return 'low-stock';
  return 'in-stock';
});

const stockStatus = computed(() => {
  const stock = productHave.value || 0;
  const par = productPar.value || 0;
  if (stock === 0) return 'Out of Stock';
  if (stock < par) return 'Low Stock';
  return 'In Stock';
});

const stockStatusClass = computed(() => {
  return stockClass.value;
});

/*
  methods
*/
const loadItem = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await Promise.all([
      itemsStore.fetchHouseItems(),
      fetchVendors()
    ]);
  } catch (err: any) {
    error.value = 'Failed to load product details';
    console.error('Error loading item:', err);
  } finally {
    loading.value = false;
  }
};

const backToProducts = () => {
  router.push('/items');
};

const editItem = () => {
  router.push(`/items/${props.houseItemId}/edit`);
};

const adjustStock = () => {
  // TODO: Implement stock adjustment modal/page
  console.log('Adjust stock for item:', props.houseItemId);
};

const viewVendor = (vendorName: string) => {
  // Find vendor by name and navigate to vendor page
  const vendor = vendors.value.find(v => v.name === vendorName);
  if (vendor) {
    router.push(`/vendors/contacts/${vendor.id}`);
  }
};

const viewHistory = () => {
  // TODO: Implement history view
  console.log('View history for item:', props.houseItemId);
};

/*
  lifecycle
*/
onMounted(async () => {
  await loadItem();
});

</script>

<style scoped>
.house-item-detail {
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

.product-subtitle {
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
}

.product-info h2 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.product-meta {
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

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  background: #e8f4fd;
  color: #3d008d;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.price-info {
  text-align: right;
}

.price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.unit {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-card h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.detail-value {
  color: #7f8c8d;
  font-size: 0.9rem;
  text-align: right;
}

.stock-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.stock-value.out-of-stock {
  color: #dc3545;
}

.stock-value.low-stock {
  color: #ffc107;
}

.stock-value.in-stock {
  color: #28a745;
}

.status-active {
  color: #28a745;
  font-weight: 600;
}

.status-inactive {
  color: #dc3545;
  font-weight: 600;
}

/* Vendor List */
.vendor-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vendor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vendor-item:hover {
  background: #e8f4fd;
  transform: translateX(4px);
}

.vendor-name {
  font-weight: 500;
  color: #2c3e50;
}

.vendor-arrow {
  color: #3d008d;
  font-size: 1.2rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
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

.action-btn.primary {
  background: #3d008d;
  color: white;
}

.action-btn.primary:hover {
  background: #2a0063;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #dee2e6;
}

.action-btn.secondary:hover {
  background: #e9ecef;
}

.action-btn.tertiary {
  background: #e8f4fd;
  color: #3d008d;
  border: 1px solid #b3d9ff;
}

.action-btn.tertiary:hover {
  background: #d1ecf1;
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

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover {
  background: #2a0063;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover {
  background: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .house-item-detail {
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
  
  .price-info {
    text-align: left;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    gap: 0.75rem;
  }
}
</style>
