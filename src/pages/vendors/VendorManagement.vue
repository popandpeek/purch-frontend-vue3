<template>
  <div class="vendor-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Vendor Management</h1>
        <p>Manage vendor relationships and performance</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="createNewVendor">
          Add Vendor
        </button>
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
        <button class="btn btn-outline" @click="refreshVendors">
          Refresh
        </button>
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVendorStore } from '../../stores/vendors';
import VendorCard from '../../components/vendors/VendorCard.vue';
import type { Vendor } from '../../api/model';

const router = useRouter();
const vendorStore = useVendorStore();

// Reactive state
const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref<'name' | 'recent' | 'spending'>('name');
const loading = ref(false);

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

const refreshVendors = async () => {
  loading.value = true;
  try {
    await vendorStore.fetchVendors();
  } finally {
    loading.value = false;
  }
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

.btn-icon {
  font-size: 1rem;
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
</style>
