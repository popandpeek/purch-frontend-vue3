<template>
  <div class="vendor-invoices-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToVendorManagement">
          <span class="btn-icon">←</span>
          Back to Vendor
        </button>
        <div class="header-info">
          <h1 class="page-title">Vendor Invoices</h1>
          <p class="page-subtitle">{{ vendorName || 'Loading...' }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="createNewInvoice">
          Add Invoice
        </button>
        <button class="btn btn-secondary" @click="refreshInvoices" :disabled="loading">
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && invoices.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading vendor invoices...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>Error</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadInvoices">Retry</button>
    </div>

    <!-- Main Content -->
    <div v-else class="invoices-content">
      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-content">
            <h3>{{ invoices.length }}</h3>
            <p>Total Invoices</p>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-content">
            <h3>{{ pendingInvoices }}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card paid">
          <div class="stat-content">
            <h3>{{ paidInvoices }}</h3>
            <p>Paid</p>
          </div>
        </div>
        <div class="stat-card overdue">
          <div class="stat-content">
            <h3>{{ overdueInvoices }}</h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search invoices..."
            class="search-input"
          >
        </div>
        <div class="filter-controls">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      <!-- Invoices List -->
      <div v-if="filteredInvoices.length === 0" class="empty-state">
        <h3>No invoices found</h3>
        <p>Try adjusting your search or add a new invoice</p>
      </div>

      <div v-else class="invoices-list">
        <InvoiceCard
          v-for="invoice in filteredInvoices"
          :key="invoice.id"
          :invoice="invoice"
          @view="viewInvoice"
          @edit="editInvoice"
          @pay="payInvoice"
          @delete="deleteInvoice"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import InvoiceCard from '../../../components/invoices/InvoiceCard.vue';
import { useInvoiceStore } from '../../../stores/vendor-invoices';
import { useVendorStore } from '../../../stores/vendors';
import { storeToRefs } from 'pinia';

const router = useRouter();
const invoiceStore = useInvoiceStore();
const vendorStore = useVendorStore();

// Reactive state
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const statusFilter = ref('');
const sortBy = ref<'date' | 'amount' | 'status'>('date');

// Store refs
const { vendor_invoices } = storeToRefs(useInvoiceStore());
const { vendors } = storeToRefs(useVendorStore());

// Props
const props = defineProps({
  vendorId: {
    type: String,
    required: true
  }
});

// Computed properties
const invoices = computed(() => {
  return vendor_invoices.value.filter(invoice => invoice.vendor_id === Number(props.vendorId));
});

const vendorName = computed(() => {
  const vendor = vendors.value.find(v => v.id === Number(props.vendorId));
  return vendor?.name || `Vendor #${props.vendorId}`;
});

const filteredInvoices = computed(() => {
  let filtered = invoices.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(invoice => 
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.status.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(invoice => invoice.status === statusFilter.value);
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortBy.value) {
      case 'date':
        aVal = new Date(a.invoice_date);
        bVal = new Date(b.invoice_date);
        break;
      case 'amount':
        aVal = parseFloat(a.total_amount || '0');
        bVal = parseFloat(b.total_amount || '0');
        break;
      case 'status':
        aVal = a.status.toLowerCase();
        bVal = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return 1;
    if (aVal > bVal) return -1;
    return 0;
  });

  return filtered;
});

// Stats
const pendingInvoices = computed(() => 
  invoices.value.filter(invoice => invoice.status === 'pending').length
);

const paidInvoices = computed(() => 
  invoices.value.filter(invoice => invoice.status === 'paid').length
);

const overdueInvoices = computed(() => 
  invoices.value.filter(invoice => invoice.status === 'overdue').length
);

// Methods
const loadInvoices = async () => {
  loading.value = true;
  error.value = null;
  try {
    await invoiceStore.fetchAllVendorInvoices();
  } catch (err) {
    error.value = 'Failed to load invoices';
    console.error('Error loading invoices:', err);
  } finally {
    loading.value = false;
  }
};

const refreshInvoices = async () => {
  await loadInvoices();
};

const createNewInvoice = () => {
  router.push(`/vendors/${props.vendorId}/invoices/new`);
};

const backToVendorManagement = () => {
  router.push('/vendors');
};

const viewInvoice = (invoice: any) => {
  router.push(`/vendors/${props.vendorId}/invoices/${invoice.id}`);
};

const editInvoice = (invoice: any) => {
  const invoiceId = invoice?.id || invoice;
  router.push(`/vendors/invoices/${invoiceId}/edit`);
};

const payInvoice = (invoice: any) => {
  router.push(`/vendors/${props.vendorId}/invoices/${invoice.id}/pay`);
};

const deleteInvoice = async (invoice: any) => {
  if (confirm('Are you sure you want to delete this invoice?')) {
    try {
      // TODO: Implement delete functionality
      console.log('Delete invoice:', invoice.id);
    } catch (err) {
      console.error('Error deleting invoice:', err);
    }
  }
};

// Lifecycle
onMounted(async () => {
  if (invoices.value.length === 0) {
    await loadInvoices();
  }
});
</script>

<style scoped>
.vendor-invoices-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6c757d;
  text-decoration: none;
}

.back-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.btn-icon {
  font-size: 1rem;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.page-subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2a0063;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
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

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-state h3 {
  color: #dc3545;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
}

/* Main Content */
.invoices-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Summary Stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

.stat-card.pending {
  border-left: 4px solid #f39c12;
}

.stat-card.paid {
  border-left: 4px solid #27ae60;
}

.stat-card.overdue {
  border-left: 4px solid #e74c3c;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3d008d;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #3d008d;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-state h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  color: #7f8c8d;
  margin: 0;
}

/* Invoices List */
.invoices-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .vendor-invoices-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-content {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .invoices-list {
    grid-template-columns: 1fr;
  }
}
</style>
