<template>
  <div class="invoice-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Invoice Management</h1>
        <p>Manage vendor invoices and payments</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="createNewInvoice">
          Add Invoice
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ totalInvoices }}</h3>
          <p>Total Invoices</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ pendingInvoices }}</h3>
          <p>Pending</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>{{ paidInvoices }}</h3>
          <p>Paid</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <h3>${{ totalAmount.toLocaleString() }}</h3>
          <p>Total Amount</p>
        </div>
      </div>
    </div>

    <!-- Invoice Tabs -->
    <div class="invoice-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        All Invoices
        <span class="tab-count">{{ allInvoices.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        Pending
        <span class="tab-count">{{ pendingInvoices }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'overdue' }"
        @click="activeTab = 'overdue'"
      >Overdue
        <span class="tab-count">{{ overdueInvoices }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'paid' }"
        @click="activeTab = 'paid'"
      >
        Paid
        <span class="tab-count">{{ paidInvoices }}</span>
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search invoices..."
          class="search-input"
        >
      </div>
      <div class="filter-controls">
        <select v-model="vendorFilter" class="filter-select">
          <option value="">All Vendors</option>
          <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
            {{ vendor.name }}
          </option>
        </select>
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
          <option value="vendor">Sort by Vendor</option>
          <option value="status">Sort by Status</option>
        </select>
        <button class="btn btn-outline" @click="refreshInvoices">
          Refresh
        </button>
      </div>
    </div>

    <!-- Invoice Grid -->
    <div class="invoice-grid">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading invoices...</p>
      </div>

      <div v-else-if="filteredInvoices.length === 0" class="empty-state">
        <h3>No invoices found</h3>
        <p>Try adjusting your search or add a new invoice</p>
      </div>

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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInvoiceStore } from '../../stores/vendor-invoices';
import { useVendorStore } from '../../stores/vendors';
import InvoiceCard from '../../components/invoices/InvoiceCard.vue';
import type { VendorInvoice, Vendor } from '../../api/model';

const router = useRouter();
const invoiceStore = useInvoiceStore();
const vendorStore = useVendorStore();

// Reactive state
const activeTab = ref<'all' | 'pending' | 'overdue' | 'paid'>('all');
const searchQuery = ref('');
const vendorFilter = ref('');
const statusFilter = ref('');
const sortBy = ref<'date' | 'amount' | 'vendor' | 'status'>('date');
const loading = ref(false);

// Computed properties
const allInvoices = computed(() => invoiceStore.vendor_invoices);
const vendors = computed(() => vendorStore.vendors);

const currentInvoices = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return allInvoices.value.filter(invoice => invoice.status === 'pending');
    case 'overdue':
      return allInvoices.value.filter(invoice => {
        const dueDate = new Date(invoice.due_date);
        const today = new Date();
        return dueDate < today && invoice.status !== 'paid';
      });
    case 'paid':
      return allInvoices.value.filter(invoice => invoice.status === 'paid');
    default:
      return allInvoices.value;
  }
});

const filteredInvoices = computed(() => {
  let filtered = currentInvoices.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(invoice => 
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.notes?.toLowerCase().includes(query)
    );
  }

  // Vendor filter
  if (vendorFilter.value) {
    filtered = filtered.filter(invoice => 
      invoice.vendor_id === parseInt(vendorFilter.value)
    );
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(invoice => 
      invoice.status === statusFilter.value
    );
  }

  // Sort
  switch (sortBy.value) {
    case 'date':
      filtered = [...filtered].sort((a, b) => 
        new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
      );
      break;
    case 'amount':
      filtered = [...filtered].sort((a, b) => 
        parseFloat(b.total_amount) - parseFloat(a.total_amount)
      );
      break;
    case 'vendor':
      filtered = [...filtered].sort((a, b) => {
        const vendorA = vendors.value.find(v => v.id === a.vendor_id);
        const vendorB = vendors.value.find(v => v.id === b.vendor_id);
        return (vendorA?.name || '').localeCompare(vendorB?.name || '');
      });
      break;
    case 'status':
      filtered = [...filtered].sort((a, b) => a.status.localeCompare(b.status));
      break;
  }

  return filtered;
});

const totalInvoices = computed(() => allInvoices.value.length);
const pendingInvoices = computed(() => 
  allInvoices.value.filter(invoice => invoice.status === 'pending').length
);
const paidInvoices = computed(() => 
  allInvoices.value.filter(invoice => invoice.status === 'paid').length
);
const overdueInvoices = computed(() => 
  allInvoices.value.filter(invoice => {
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    return dueDate < today && invoice.status !== 'paid';
  }).length
);
const totalAmount = computed(() => 
  allInvoices.value.reduce((sum, invoice) => sum + parseFloat(invoice.total_amount), 0)
);

// Methods
const createNewInvoice = () => {
  router.push('/vendors/invoiceRegistration');
};


const viewInvoice = (invoice: VendorInvoice) => {
  router.push(`/vendors/invoices/${invoice.id}`);
};

const editInvoice = (invoice: VendorInvoice) => {
  router.push(`/vendors/invoices/${invoice.id}/edit`);
};

const payInvoice = async (invoice: VendorInvoice) => {
  if (confirm(`Mark invoice ${invoice.invoice_number} as paid?`)) {
    // TODO: Implement payment functionality
    console.log('Pay invoice:', invoice.id);
  }
};

const deleteInvoice = async (invoice: VendorInvoice) => {
  if (confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
    // TODO: Implement delete functionality
    console.log('Delete invoice:', invoice.id);
  }
};

const refreshInvoices = async () => {
  loading.value = true;
  try {
    await invoiceStore.fetchAllVendorInvoices();
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  if (allInvoices.value.length === 0) {
    await refreshInvoices();
  }
  if (vendors.value.length === 0) {
    await vendorStore.fetchVendors();
  }
});
</script>

<style scoped>
.invoice-management {
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

.invoice-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ecf0f1;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #7f8c8d;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #3d008d;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #3d008d;
  border-bottom-color: #3d008d;
  background: #e8f4fd;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-count {
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tab-btn.active .tab-count {
  background: #3d008d;
  color: white;
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

.invoice-grid {
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
  .invoice-management {
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
  
  .invoice-grid {
    grid-template-columns: 1fr;
  }
}
</style>