<template>
  <edit-page
    :page-title="`Invoice: ${invoice?.invoice_number || 'Loading...'}`"
    page-description="View and manage invoice details"
    :loading="loading"
    :error="error"
    @save="saveChanges"
    @retry="loadInvoice"
  >
    <div v-if="invoice" class="invoice-detail">
      <!-- Invoice Header -->
      <div class="section">
        <h3>Invoice Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Invoice Number</label>
            <input v-model="editData.invoice_number" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Invoice Date</label>
            <input v-model="editData.invoice_date" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input v-model="editData.due_date" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="editData.status" class="form-select">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Vendor Information -->
      <div class="section">
        <h3>Vendor Information</h3>
        <div class="vendor-info">
          <h4>{{ vendorName }}</h4>
          <p>Vendor ID: {{ invoice.vendor_id }}</p>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="section">
        <h3>Invoice Items ({{ invoice.items?.length || 0 }})</h3>
        <div v-if="!invoice.items || invoice.items.length === 0" class="empty-state">
          <p>No items in this invoice</p>
        </div>
        <div v-else class="items-list">
          <div v-for="item in invoice.items" :key="item.id" class="item-card">
            <div class="item-header">
              <h4>{{ item.vendor_item_name }}</h4>
              <span class="item-sku">SKU: {{ item.vendor_item_sku || 'N/A' }}</span>
            </div>
            <div class="item-details">
              <div class="item-row">
                <span class="item-label">Quantity:</span>
                <span class="item-value">{{ item.quantity }}</span>
              </div>
              <div class="item-row">
                <span class="item-label">Unit Price:</span>
                <span class="item-value">${{ item.unit_price }}</span>
              </div>
              <div class="item-row">
                <span class="item-label">Total Price:</span>
                <span class="item-value">${{ item.total_price }}</span>
              </div>
              <div class="item-row">
                <span class="item-label">Unit:</span>
                <span class="item-value">{{ item.pack_unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Totals -->
      <div class="section">
        <h3>Invoice Totals</h3>
        <div class="totals-grid">
          <div class="form-group">
            <label class="form-label">Subtotal</label>
            <input v-model="editData.subtotal" type="number" step="0.01" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Tax Amount</label>
            <input v-model="editData.tax_amount" type="number" step="0.01" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Total Amount</label>
            <input v-model="editData.total_amount" type="number" step="0.01" class="form-input">
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="section">
        <h3>Notes</h3>
        <textarea 
          v-model="editData.notes" 
          class="form-textarea" 
          placeholder="Add any notes for this invoice..."
          rows="4"
        ></textarea>
      </div>
    </div>
  </edit-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useInvoiceStore } from '../../../stores/vendor-invoices';
import { useVendorStore } from '../../../stores/vendors';
import EditPage from '../../EditPage.vue';
import type { VendorInvoice } from '../../../api/model';

const route = useRoute();
const invoiceStore = useInvoiceStore();
const vendorStore = useVendorStore();

const invoice = ref<VendorInvoice | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const editData = ref({
  invoice_number: '',
  invoice_date: '',
  due_date: '',
  status: 'pending',
  subtotal: '',
  tax_amount: '',
  total_amount: '',
  notes: ''
});

const vendorName = computed(() => {
  if (!invoice.value) return 'Loading...';
  const vendor = vendorStore.vendors.find(v => v.id === invoice.value!.vendor_id);
  return vendor?.name || `Vendor #${invoice.value.vendor_id}`;
});

const loadInvoice = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const invoiceId = route.params.invoiceId as string;
    await invoiceStore.fetchAllVendorInvoices();
    const invoiceData = invoiceStore.vendor_invoices.find(i => i.id === parseInt(invoiceId));
    
    if (!invoiceData) {
      error.value = 'Invoice not found';
      return;
    }
    
    invoice.value = invoiceData;
    
    // Populate edit data
    editData.value = {
      invoice_number: invoiceData.invoice_number,
      invoice_date: invoiceData.invoice_date,
      due_date: invoiceData.due_date,
      status: invoiceData.status,
      subtotal: invoiceData.subtotal,
      tax_amount: invoiceData.tax_amount,
      total_amount: invoiceData.total_amount,
      notes: invoiceData.notes || ''
    };
  } catch (err: any) {
    error.value = err.message || 'Failed to load invoice';
  } finally {
    loading.value = false;
  }
};

const saveChanges = async () => {
  if (!invoice.value) return;
  
  try {
    // TODO: Implement save functionality
    console.log('Saving invoice changes:', editData.value);
    alert('Invoice updated successfully!');
  } catch (err: any) {
    alert('Failed to save changes: ' + err.message);
  }
};

onMounted(async () => {
  await vendorStore.fetchVendors();
  loadInvoice();
});
</script>

<style scoped>
.invoice-detail {
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.vendor-info {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
}

.vendor-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.vendor-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  background: white;
  border-radius: 8px;
  border: 1px solid #ecf0f1;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.item-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
}

.item-sku {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.item-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.item-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

@media (max-width: 768px) {
  .form-grid,
  .totals-grid {
    grid-template-columns: 1fr;
  }
  
  .item-details {
    grid-template-columns: 1fr;
  }
  
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
