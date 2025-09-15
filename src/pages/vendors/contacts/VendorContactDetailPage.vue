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

      <!-- Delivery Information -->
      <div class="section">
        <h3>Delivery Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Delivery Days</label>
            <div class="checkbox-group">
              <label v-for="day in deliveryDays" :key="day.value" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="day.value" 
                  v-model="editData.delivery_days"
                  class="checkbox-input"
                >
                <span class="checkbox-text">{{ day.label }}</span>
              </label>
            </div>
            <p class="form-help">Select the days this vendor delivers</p>
          </div>
          <div class="form-group">
            <label class="form-label">Order Cut-off Time (for next day delivery)</label>
            <input 
              v-model="editData.order_cutoff_time" 
              type="time" 
              :class="['form-input', { 'input-error': !isCutoffTimeValid }]"
              placeholder="14:00"
            >
            <p class="form-help">Time by which orders must be placed for next day delivery (24-hour format)</p>
            <p v-if="!isCutoffTimeValid" class="form-error">Please enter a valid time in HH:MM format (24-hour)</p>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="editData.is_active"
                class="checkbox-input"
              >
              <span class="checkbox-text">Active Vendor</span>
            </label>
            <p class="form-help">Enable or disable this vendor for ordering</p>
          </div>
          <div class="form-group full-width">
            <label class="form-label">Delivery Notes</label>
            <textarea 
              v-model="editData.delivery_notes" 
              class="form-textarea" 
              rows="3" 
              placeholder="Special delivery instructions, restrictions, or notes"
            ></textarea>
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

      <!-- Delivery Summary -->
      <div class="section">
        <h3>Delivery Summary</h3>
        <div class="delivery-summary">
          <div class="summary-item">
            <strong>Order Cutoff:</strong> {{ formatCutoffTime(editData.order_cutoff_time) }}
          </div>
          <div class="summary-item">
            <strong>Delivery Days:</strong> {{ formatDeliveryDays(editData.delivery_days) }}
          </div>
          <div class="summary-item">
            <strong>Status:</strong> 
            <span :class="['status-badge', editData.is_active ? 'active' : 'inactive']">
              {{ editData.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div v-if="editData.order_cutoff_time && editData.is_active" class="summary-item">
            <strong>Next Day Ordering:</strong> 
            <span :class="['order-status', canOrderForNextDay(editData) ? 'available' : 'unavailable']">
              {{ canOrderForNextDay(editData) ? 'Available' : 'Cutoff Passed' }}
            </span>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVendorStore } from '../../../stores/vendors';
import EditPage from '../../EditPage.vue';
import type { Vendor } from '../../../api/model';
import instance from '../../../http-common';

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
  
  // Delivery Information (matching guide specification)
  delivery_days: [] as number[],
  order_cutoff_time: '',
  is_active: true,
  delivery_notes: '',
  
  // Status & Settings
  status: 'active',
  priority: 'medium',
  contract_start_date: '',
  contract_end_date: ''
});

// Delivery days options (matching guide: 0=Monday, 6=Sunday)
const deliveryDays = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
];

// Validation
const isCutoffTimeValid = computed(() => {
  if (!editData.value.order_cutoff_time) return true; // Optional field
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(editData.value.order_cutoff_time);
});

const hasDeliveryDays = computed(() => {
  return editData.value.delivery_days.length > 0;
});

// Utility functions (from guide)
const formatDeliveryDays = (days: number[] | null): string => {
  if (!days || days.length === 0) return 'Not set';
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => dayNames[day]).join(', ');
};

const formatCutoffTime = (time: string | null): string => {
  if (!time) return 'Not set';
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const canOrderForNextDay = (vendor: any): boolean => {
  if (!vendor.order_cutoff_time || !vendor.is_active) return false;
  const now = new Date();
  const [cutoffHours, cutoffMinutes] = vendor.order_cutoff_time.split(':');
  const cutoffTime = new Date();
  cutoffTime.setHours(parseInt(cutoffHours), parseInt(cutoffMinutes));
  return now < cutoffTime;
};

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
      
      // Delivery fields (matching guide specification)
      delivery_days: vendorData.delivery_days || [],
      order_cutoff_time: vendorData.order_cutoff_time || '',
      is_active: vendorData.is_active ?? true,
      delivery_notes: vendorData.delivery_notes || '',
      
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
  
  // Validate delivery information
  if (!isCutoffTimeValid.value) {
    alert('Please fix the cut-off time format before saving.');
    return;
  }
  
  if (editData.value.order_cutoff_time && !hasDeliveryDays.value) {
    alert('Please select at least one delivery day if you specify a cut-off time.');
    return;
  }
  
  try {
    // Prepare the data for saving
    const updateData = {
      name: editData.value.name,
      contact_first_name: editData.value.contact_first_name,
      contact_last_name: editData.value.contact_last_name,
      contact_email: editData.value.contact_email,
      phone: editData.value.phone,
      // Delivery information
      order_cutoff_time: editData.value.order_cutoff_time || null,
      delivery_days: editData.value.delivery_days.length > 0 ? editData.value.delivery_days : null,
      is_active: editData.value.is_active,
      delivery_notes: editData.value.delivery_notes || null,
      // Additional fields
      website: editData.value.website || null,
      address: editData.value.address || null,
      notes: editData.value.notes || null,
      // Business fields
      tax_id: editData.value.tax_id || null,
      payment_terms: editData.value.payment_terms || null,
      credit_limit: editData.value.credit_limit || null,
      preferred_contact_method: editData.value.preferred_contact_method || null,
      // Status fields
      status: editData.value.status,
      priority: editData.value.priority,
      contract_start_date: editData.value.contract_start_date || null,
      contract_end_date: editData.value.contract_end_date || null
    };

    // Call the API directly to update the vendor
    const response = await instance.put(`/vendors/${vendor.value.id}/`, updateData);
    const updatedVendor = response.data;
    
    // Update the vendor in the store
    const existingIndex = vendorStore.vendors.findIndex(v => v.id === vendor.value!.id);
    if (existingIndex >= 0) {
      vendorStore.vendors[existingIndex] = updatedVendor;
    }
    
    // Update the local vendor reference
    vendor.value = updatedVendor;
    
    alert('Vendor updated successfully!');
  } catch (err: any) {
    console.error('Failed to save vendor changes:', err);
    alert('Failed to save changes: ' + (err.message || 'Unknown error'));
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

.form-group.full-width {
  grid-column: 1 / -1;
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

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.checkbox-label:hover {
  background-color: #f8f9fa;
}

.checkbox-input {
  margin: 0;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-help {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.25rem;
  font-style: italic;
}

.form-error {
  font-size: 0.8rem;
  color: #dc3545;
  margin-top: 0.25rem;
  font-weight: 500;
}

.input-error {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
}

.delivery-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.summary-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item strong {
  min-width: 140px;
  color: #495057;
  margin-right: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.order-status.available {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.order-status.unavailable {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
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
