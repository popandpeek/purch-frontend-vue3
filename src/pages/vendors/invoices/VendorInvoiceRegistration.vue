<template>
  <div class="invoice-registration-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <span class="btn-icon">←</span>
          Back
        </button>
        <div class="header-info">
          <h1 class="page-title">Add New Invoice</h1>
          <p class="page-subtitle">Create a new vendor invoice</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="registration-content">
      <!-- Upload Section -->
      <div class="form-section">
        <VendorInvoiceUpload 
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
        />
      </div>

      <!-- Manual Entry Form -->
      <div class="form-section">
        <div class="section-header">
          <h2>Invoice Details</h2>
          <p>Enter invoice information manually</p>
        </div>

        <form @submit.prevent="submitInvoice" class="invoice-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="vendorId">Vendor *</label>
              <select id="vendorId" v-model="formData.vendorId" required>
                <option value="">Select a vendor</option>
                <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                  {{ vendor.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="invoiceNumber">Invoice Number *</label>
              <input 
                id="invoiceNumber" 
                v-model="formData.invoiceNumber" 
                type="text" 
                required 
                placeholder="Enter invoice number"
              />
            </div>

            <div class="form-group">
              <label for="amount">Amount *</label>
              <input 
                id="amount" 
                v-model="formData.amount" 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00"
              />
            </div>

            <div class="form-group">
              <label for="dueDate">Due Date *</label>
              <input 
                id="dueDate" 
                v-model="formData.dueDate" 
                type="date" 
                required
              />
            </div>

            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" v-model="formData.status">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                v-model="formData.description" 
                placeholder="Enter invoice description"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="goBack">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="loading-spinner"></span>
              {{ isSubmitting ? 'Creating...' : 'Create Invoice' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVendorStore } from '@/stores/vendors';
import { useInvoiceStore } from '@/stores/vendor-invoices';
import VendorInvoiceUpload from '@/components/vendors/vendor-invoices/VendorInvoiceUpload.vue';

const router = useRouter();
const vendorStore = useVendorStore();
const invoiceStore = useInvoiceStore();

// Reactive data
const isSubmitting = ref(false);
const selectedFile = ref(null);

const formData = reactive({
  vendorId: '',
  invoiceNumber: '',
  amount: '',
  dueDate: '',
  status: 'pending',
  description: ''
});

const vendors = ref([]);

// Methods
const goBack = () => {
  router.go(-1);
};

const handleUploadSuccess = (data) => {
  console.log('File uploaded successfully:', data);
  // You can add additional logic here if needed
};

const handleUploadError = (error) => {
  console.error('File upload failed:', error);
  // You can add error handling UI here if needed
};

const loadVendors = async () => {
  try {
    await vendorStore.fetchVendors();
    vendors.value = vendorStore.vendors;
  } catch (error) {
    console.error('Error loading vendors:', error);
  }
};

const submitInvoice = async () => {
  isSubmitting.value = true;
  try {
    // Create invoice data
    const invoiceData = {
      ...formData,
      amount: parseFloat(formData.amount),
      file: selectedFile.value
    };

    // Submit to store
    await invoiceStore.createInvoice(invoiceData);
    
    // Redirect to invoices list
    router.push('/vendors');
  } catch (error) {
    console.error('Error creating invoice:', error);
    // TODO: Show error message to user
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadVendors();
});
</script>

<style scoped>
.invoice-registration-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem;
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #6c757d;
}

.back-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

/* Main Content */
.registration-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Form Sections */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #6c757d;
  margin: 0;
  font-size: 0.95rem;
}


/* Form Styles */
.invoice-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2a0063;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .invoice-registration-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .upload-area {
    padding: 2rem 1rem;
  }
}
</style>