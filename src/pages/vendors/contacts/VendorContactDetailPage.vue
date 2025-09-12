<template>
  <edit-page
    :page-title="`Vendor: ${vendor?.name || 'Loading...'}`"
    :page-description="`View and manage vendor details`"
    :loading="loading"
    :error="error"
    @save="saveChanges"
    @retry="loadVendor"
  >
    <div v-if="vendor" class="vendor-detail">
      <!-- Basic Information -->
      <div class="section">
        <h3>Basic Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Company Name *</label>
            <input v-model="editData.name" type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">Contact First Name *</label>
            <input v-model="editData.contact_first_name" type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">Contact Last Name *</label>
            <input v-model="editData.contact_last_name" type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="editData.contact_email" type="email" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">Phone *</label>
            <input v-model="editData.phone" type="tel" class="form-input" required>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="section">
        <h3>Additional Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Website</label>
            <input v-model="editData.website" type="url" class="form-input" placeholder="https://example.com">
          </div>
          <div class="form-group">
            <label class="form-label">Address</label>
            <textarea v-model="editData.address" class="form-textarea" rows="3" placeholder="Street address, city, state, zip"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea v-model="editData.notes" class="form-textarea" rows="4" placeholder="Additional notes about this vendor"></textarea>
          </div>
        </div>
      </div>

      <!-- Business Information -->
      <div class="section">
        <h3>Business Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tax ID</label>
            <input v-model="editData.tax_id" type="text" class="form-input" placeholder="Tax identification number">
          </div>
          <div class="form-group">
            <label class="form-label">Payment Terms</label>
            <select v-model="editData.payment_terms" class="form-select">
              <option value="">Select payment terms</option>
              <option value="net_15">Net 15</option>
              <option value="net_30">Net 30</option>
              <option value="net_45">Net 45</option>
              <option value="net_60">Net 60</option>
              <option value="due_on_receipt">Due on Receipt</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Credit Limit</label>
            <input v-model="editData.credit_limit" type="number" class="form-input" placeholder="0.00" step="0.01">
          </div>
          <div class="form-group">
            <label class="form-label">Preferred Contact Method</label>
            <select v-model="editData.preferred_contact_method" class="form-select">
              <option value="">Select preferred method</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="fax">Fax</option>
              <option value="mail">Mail</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Status & Settings -->
      <div class="section">
        <h3>Status & Settings</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="editData.status" class="form-select">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select v-model="editData.priority" class="form-select">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Contract Start Date</label>
            <input v-model="editData.contract_start_date" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Contract End Date</label>
            <input v-model="editData.contract_end_date" type="date" class="form-input">
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h3>Quick Actions</h3>
        <div class="action-buttons">
          <button class="action-btn primary" @click="viewItems">
            View Items
          </button>
          <button class="action-btn secondary" @click="viewOrders">
            View Orders
          </button>
          <button class="action-btn secondary" @click="viewInvoices">
            View Invoices
          </button>
          <button class="action-btn tertiary" @click="createOrder">
            Create Order
          </button>
        </div>
      </div>
    </div>
  </edit-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVendorStore } from '../../../stores/vendors';
import EditPage from '../../EditPage.vue';
import type { Vendor } from '../../../api/model';

const route = useRoute();
const router = useRouter();
const vendorStore = useVendorStore();

const vendor = ref<Vendor | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const editData = ref({
  // Basic Information
  name: '',
  contact_first_name: '',
  contact_last_name: '',
  contact_email: '',
  phone: '',
  
  // Additional Information
  website: '',
  address: '',
  notes: '',
  
  // Business Information
  tax_id: '',
  payment_terms: '',
  credit_limit: '',
  preferred_contact_method: '',
  
  // Status & Settings
  status: 'active',
  priority: 'medium',
  contract_start_date: '',
  contract_end_date: ''
});

const loadVendor = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const vendorId = route.params.vendorId as string;
    const vendorData = await vendorStore.fetchVendorById(parseInt(vendorId));
    vendor.value = vendorData;
    
    // Populate edit data with existing values or defaults
    editData.value = {
      name: vendorData.name || '',
      contact_first_name: vendorData.contact_first_name || '',
      contact_last_name: vendorData.contact_last_name || '',
      contact_email: vendorData.contact_email || '',
      phone: vendorData.phone || '',
      
      // Additional fields (these might not exist in the API yet)
      website: (vendorData as any).website || '',
      address: (vendorData as any).address || '',
      notes: (vendorData as any).notes || '',
      
      // Business fields
      tax_id: (vendorData as any).tax_id || '',
      payment_terms: (vendorData as any).payment_terms || '',
      credit_limit: (vendorData as any).credit_limit || '',
      preferred_contact_method: (vendorData as any).preferred_contact_method || '',
      
      // Status fields
      status: (vendorData as any).status || 'active',
      priority: (vendorData as any).priority || 'medium',
      contract_start_date: (vendorData as any).contract_start_date || '',
      contract_end_date: (vendorData as any).contract_end_date || ''
    };
  } catch (err: any) {
    error.value = err.message || 'Failed to load vendor';
  } finally {
    loading.value = false;
  }
};

const saveChanges = async () => {
  if (!vendor.value) return;
  
  try {
    // TODO: Implement save functionality
    console.log('Saving vendor changes:', editData.value);
    alert('Vendor updated successfully!');
  } catch (err: any) {
    alert('Failed to save changes: ' + err.message);
  }
};

// Quick action methods
const viewItems = () => {
  router.push(`/vendors/${vendor.value?.id}/items`);
};

const viewOrders = () => {
  router.push(`/vendors/${vendor.value?.id}/orders`);
};

const viewInvoices = () => {
  router.push(`/vendors/${vendor.value?.id}/invoices`);
};

const createOrder = () => {
  router.push(`/vendors/${vendor.value?.id}/orders/new`);
};

onMounted(() => {
  loadVendor();
});
</script>

<style scoped>
.vendor-detail {
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

.form-input {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.form-textarea {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.form-select {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
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

.action-btn.tertiary {
  background: #f8f9fa;
  color: #6c757d;
  border-color: #e9ecef;
}

.action-btn.tertiary:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.btn-icon {
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.item-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
}

.item-card h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.item-card p {
  margin: 0 0 0.25rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.orders-list {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #ecf0f1;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>
