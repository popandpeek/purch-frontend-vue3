<template>
  <div class="vendor-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Vendor Management</h1>
        <p>Manage vendor relationships and performance</p>
      </div>
      <div class="header-actions">
        <BaseButton 
          variant="primary" 
          size="md" 
          icon="+" 
          @click="createNewVendor"
        >
          Add Vendor
        </BaseButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ totalVendors }}</h3>
          <p>Total Vendors</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ activeVendors }}</h3>
          <p>Active Vendors</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>${{ totalSpent.toLocaleString() }}</h3>
          <p>Total Spent</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ averageRating.toFixed(1) }}</h3>
          <p>Avg Rating</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search vendors..."
          class="search-input"
        >
      </div>
      <div class="filter-controls">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="name">Sort by Name</option>
          <option value="recent">Sort by Recent</option>
          <option value="spending">Sort by Spending</option>
        </select>
        <BaseButton 
          variant="secondary" 
          size="md" 
          icon="↻" 
          @click="refreshVendors"
        >
          Refresh
        </BaseButton>
      </div>
    </div>

    <!-- Vendor Grid -->
    <div class="vendor-grid">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading vendors...</p>
      </div>

      <div v-else-if="filteredVendors.length === 0" class="empty-state">
        <h3>No vendors found</h3>
        <p>Try adjusting your search or add a new vendor</p>
      </div>

      <VendorCard
        v-for="vendor in filteredVendors"
        :key="vendor.id"
        :vendor="vendor"
        @view="viewVendor"
        @edit="editVendor"
        @delete="deleteVendor"
        @order-history="viewVendorOrderHistory"
        @view-items="viewVendorItems"
        @config="configureVendor"
      />
    </div>

    <!-- Configuration Modal -->
    <div v-if="showConfigModal && selectedVendor" class="modal-overlay" @click="closeConfigModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Configure {{ selectedVendor.name }}</h3>
          <BaseButton variant="ghost" @click="closeConfigModal">
            Close
          </BaseButton>
        </div>
        <div class="modal-body">
          <div class="vendor-config">
            <h4>Vendor Configuration</h4>
            <p class="config-description">
              Configure vendor-specific preferences that affect how this vendor is selected.
              These settings influence vendor selection algorithms when this vendor is considered.
            </p>
            
            <div class="config-section">
              <h5>Vendor Constraints</h5>
              <div class="config-field">
                <label>Minimum Order Threshold</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  v-model="vendorConfig.min_order_threshold"
                />
                <p class="field-description">Minimum order value required to use this vendor</p>
              </div>
              
              <div class="config-field">
                <label>Maximum Order Threshold</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  v-model="vendorConfig.max_order_threshold"
                />
                <p class="field-description">Maximum order value this vendor can handle (leave empty for no limit)</p>
              </div>
              
              <div class="config-field">
                <label>Preferred Categories</label>
                <input 
                  type="text" 
                  v-model="vendorConfig.preferred_categories"
                  placeholder="e.g., produce, dairy, meat"
                />
                <p class="field-description">Categories this vendor excels at (comma-separated)</p>
              </div>
            </div>


            <div class="config-actions">
              <BaseButton variant="primary" @click="saveVendorConfig" :loading="configSaving">
                Save Vendor Configuration
              </BaseButton>
              <BaseButton variant="secondary" @click="resetVendorConfig">
                Reset to Defaults
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVendorStore } from '../../stores/vendors';
import VendorCard from '../../components/vendors/VendorCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import type { Vendor } from '../../api/model';
import type { ConfigInheritance } from '../../stores/house-orders';

const router = useRouter();
const vendorStore = useVendorStore();

// Reactive state
const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref<'name' | 'recent' | 'spending'>('name');
const loading = ref(false);
const showConfigModal = ref(false);
const selectedVendor = ref<Vendor | null>(null);
const configSaving = ref(false);

// Configuration state
const vendorConfig = ref({
  min_order_threshold: 0,
  max_order_threshold: null,
  preferred_categories: ''
});

const configInheritance = ref<ConfigInheritance | null>(null);

// Computed properties
const vendors = computed(() => vendorStore.vendors);


const filteredVendors = computed(() => {
  let filtered = vendors.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(vendor => 
      vendor.name.toLowerCase().includes(query) ||
      vendor.contact_email.toLowerCase().includes(query) ||
      vendor.contact_first_name.toLowerCase().includes(query) ||
      vendor.contact_last_name.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(vendor => {
      if (statusFilter.value === 'active') {
        // Consider active if vendor has items and items are available
        return vendor.items && vendor.items.some(item => item.is_available);
      } else if (statusFilter.value === 'inactive') {
        // Consider inactive if vendor has no items or no available items
        return !vendor.items || vendor.items.length === 0 || !vendor.items.some(item => item.is_available);
      }
      return true;
    });
  }

  // Sort
  switch (sortBy.value) {
    case 'name':
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'recent':
      // Sort by ID (higher ID = more recent)
      filtered = [...filtered].sort((a, b) => b.id - a.id);
      break;
    case 'spending':
      // Sort by estimated spending based on items and their prices
      filtered = [...filtered].sort((a, b) => {
        const aSpending = calculateVendorSpending(a);
        const bSpending = calculateVendorSpending(b);
        return bSpending - aSpending;
      });
      break;
  }

  return filtered;
});

const totalVendors = computed(() => vendors.value.length);

const activeVendors = computed(() => {
  return vendors.value.filter(vendor => 
    vendor.items && vendor.items.some(item => item.is_available)
  ).length;
});

const totalSpent = computed(() => {
  // Calculate estimated spending based on vendor items
  return vendors.value.reduce((total, vendor) => {
    return total + calculateVendorSpending(vendor);
  }, 0);
});

const averageRating = computed(() => {
  // Since rating is not available in the Vendor interface, 
  // we'll use a placeholder that could be calculated from other metrics
  // For now, return a reasonable default
  return 4.2; // This would be calculated from actual performance metrics in a real app
});

// Helper function to calculate estimated spending for a vendor
const calculateVendorSpending = (vendor: Vendor): number => {
  if (!vendor.items || vendor.items.length === 0) {
    return 0;
  }
  
  return vendor.items.reduce((total, item) => {
    const price = parseFloat(item.price_per_case || item.cost_price || '0');
    const caseSize = item.case_size || 1;
    // Estimate spending based on price per case and case size
    return total + (price * caseSize);
  }, 0);
};

// Methods
const createNewVendor = () => {
  router.push('/vendors/contacts/registration');
};

const viewVendor = (vendor: Vendor) => {
  router.push(`/vendors/contacts/${vendor.id}`);
};

const editVendor = (vendor: Vendor) => {
  router.push(`/vendors/contacts/${vendor.id}/edit`);
};

const deleteVendor = async (vendor: Vendor) => {
  if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
    // TODO: Implement delete functionality
    console.log('Delete vendor:', vendor.id);
  }
};

const viewVendorOrderHistory = (vendor: Vendor) => {
  // Navigate to vendor-specific order history
  router.push(`/vendors/${vendor.id}/orders`);
};

const viewVendorItems = (vendor: Vendor) => {
  // Navigate to product management with vendor filter
  router.push(`/items?vendor=${vendor.id}`);
};

const configureVendor = async (vendor: Vendor) => {
  // Open inline configuration modal for vendor
  selectedVendor.value = vendor;
  showConfigModal.value = true;
  
  // TODO: Load configuration for this vendor
  // try {
  //   vendorConfig.value = await houseOrdersStore.getVendorSelectionConfig('item', vendor.id);
  //   configInheritance.value = await houseOrdersStore.getConfigInheritance(vendor.id);
  // } catch (error) {
  //   console.error('Failed to load vendor configuration:', error);
  // }
};

const refreshVendors = async () => {
  loading.value = true;
  try {
    await vendorStore.fetchVendors();
  } finally {
    loading.value = false;
  }
};

// Configuration methods
const closeConfigModal = () => {
  showConfigModal.value = false;
  selectedVendor.value = null;
  configInheritance.value = null;
};

const saveVendorConfig = async () => {
  if (!selectedVendor.value) return;
  
  configSaving.value = true;
  try {
    // TODO: Implement vendor configuration save API
    // await houseOrdersStore.updateVendorSelectionConfig('item', selectedVendor.value.id, vendorConfig.value);
    showConfigModal.value = false;
  } catch (error) {
    console.error('Failed to save vendor configuration:', error);
  } finally {
    configSaving.value = false;
  }
};

const resetVendorConfig = () => {
  vendorConfig.value = {
    min_order_threshold: 0,
    max_order_threshold: null,
    preferred_categories: ''
  };
};

// Lifecycle
onMounted(async () => {
  if (vendors.value.length === 0) {
    await refreshVendors();
  }
});
</script>

<style scoped>
.vendor-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 2rem;
}

.header-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  font-size: 1.1rem;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.vendor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
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

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.empty-state p {
  margin: 0;
}


@media (max-width: 768px) {
  .vendor-management {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .vendor-grid {
    grid-template-columns: 1fr;
  }
}

/* Configuration Modal */
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 1000px;
}

.modal-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

.vendor-config,
.product-config {
  margin-bottom: 1rem;
}

.vendor-config h4,
.product-config h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.config-description {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Vendor Configuration Styles */
.vendor-config {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.vendor-config h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.config-section {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.config-section h5 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
}

.config-field {
  margin-bottom: 1rem;
}

.config-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.config-field select,
.config-field input[type="text"],
.config-field input[type="number"],
.config-field input[type="range"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.config-field input[type="range"] {
  padding: 0;
  height: 6px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.config-field input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

.range-value {
  display: inline-block;
  margin-left: 0.5rem;
  font-weight: 600;
  color: #007bff;
  min-width: 30px;
}

.field-description {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.config-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}
</style>
