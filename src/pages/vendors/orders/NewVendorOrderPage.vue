<template>
  <edit-page
    page-title="Create New Vendor Order"
    page-description="Create a new order with a specific vendor"
    :loading="loading"
    :error="error"
    @save="createOrder"
    @retry="loadData"
  >
    <div class="new-vendor-order">
      <!-- Vendor Information -->
      <div class="section">
        <h3>Vendor Information</h3>
        <div v-if="selectedVendor" class="vendor-info">
          <h4>{{ selectedVendor.name }}</h4>
          <p>Contact: {{ selectedVendor.contact_first_name }} {{ selectedVendor.contact_last_name }}</p>
          <p>Email: {{ selectedVendor.contact_email }}</p>
          <p>Phone: {{ selectedVendor.phone }}</p>
        </div>
        <div v-else class="vendor-info">
          <p>Loading vendor information...</p>
        </div>
      </div>

      <!-- Order Details -->
      <div class="section">
        <h3>Order Details</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Order Date</label>
            <input v-model="orderData.date" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="orderData.status" class="form-select">
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Vendor Items -->
      <div v-if="selectedVendor" class="section">
        <h3>Available Items from {{ selectedVendor.name }}</h3>
        <div class="items-section">
          <div class="add-item">
            <select v-model="selectedItem" class="form-select" @change="addItem">
              <option value="">Select an item to add</option>
            <option v-for="item in vendorItems" :key="item.id" :value="item.id">
              {{ item.product_name }} - ${{ item.cost_price }}
            </option>
            </select>
            <button class="btn btn-outline" @click="addItem">
              Add Item
            </button>
          </div>

          <div v-if="orderItems.length === 0" class="empty-state">
            <p>No items added yet. Select items from the dropdown above.</p>
          </div>

          <div v-else class="items-list">
            <div v-for="(item, index) in orderItems" :key="index" class="item-row">
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p>SKU: {{ item.sku }}</p>
                <p>${{ item.unit_price }} per {{ item.unit }}</p>
              </div>
              <div class="item-controls">
                <input 
                  v-model.number="item.quantity" 
                  type="number" 
                  min="1" 
                  class="quantity-input"
                  @change="updateItemTotal(item)"
                >
                <span class="item-total">${{ item.total_price }}</span>
                <button class="remove-btn" @click="removeItem(index)">
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="section">
        <h3>Order Summary</h3>
        <div class="order-summary">
          <div class="summary-row">
            <span class="summary-label">Subtotal:</span>
            <span class="summary-value">${{ orderSubtotal }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Tax:</span>
            <span class="summary-value">${{ orderTax }}</span>
          </div>
          <div class="summary-row total">
            <span class="summary-label">Total:</span>
            <span class="summary-value">${{ orderTotal }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="section">
        <h3>Notes</h3>
        <textarea 
          v-model="orderData.notes" 
          class="form-textarea" 
          placeholder="Add any notes for this order..."
          rows="4"
        ></textarea>
      </div>
    </div>
  </edit-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useVendorStore } from '../../../stores/vendors';
import { useVendorItemStore } from '../../../stores/vendor-items';
import EditPage from '../../EditPage.vue';
import type { VendorItem } from '../../../api/model';

const router = useRouter();
const route = useRoute();
const vendorStore = useVendorStore();
const vendorItemStore = useVendorItemStore();

// Get vendor ID from route parameter
const vendorId = computed(() => {
  const id = route.params.vendorId;
  return id ? parseInt(id as string) : null;
});

const loading = ref(false);
const error = ref<string | null>(null);
const selectedItem = ref('');
const vendorItems = ref<VendorItem[]>([]);

const orderData = ref({
  vendor_id: '',
  date: new Date().toISOString().split('T')[0],
  status: 'draft',
  notes: ''
});

const orderItems = ref<Array<{
  id: number;
  name: string;
  sku: string;
  unit_price: string;
  unit: string;
  quantity: number;
  total_price: string;
}>>([]);

const vendors = computed(() => vendorStore.vendors);

const selectedVendor = computed(() => {
  if (!orderData.value.vendor_id) return null;
  return vendors.value.find(v => v.id === parseInt(orderData.value.vendor_id));
});

const orderSubtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2);
});

const orderTax = computed(() => {
  return (parseFloat(orderSubtotal.value) * 0.08).toFixed(2); // 8% tax
});

const orderTotal = computed(() => {
  return (parseFloat(orderSubtotal.value) + parseFloat(orderTax.value)).toFixed(2);
});

const loadVendorItems = async () => {
  if (!vendorId.value) {
    vendorItems.value = [];
    return;
  }
  
  try {
    // Fetch all vendor items and filter by vendor ID
    await vendorItemStore.fetchAllVendorItems();
    vendorItems.value = vendorItemStore.vendorItems.filter(item => item.vendor_id === vendorId.value);
  } catch (err: any) {
    console.error('Failed to load vendor items:', err);
    vendorItems.value = [];
    throw err;
  }
};

const addItem = () => {
  if (!selectedItem.value) return;
  
  const item = vendorItems.value.find(i => i.id === parseInt(selectedItem.value));
  if (!item) return;
  
  const existingItem = orderItems.value.find(i => i.id === item.id);
  if (existingItem) {
    existingItem.quantity += 1;
    updateItemTotal(existingItem);
  } else {
    const newItem = {
      id: item.id,
      name: item.product_name,
      sku: item.sku,
      unit_price: item.cost_price,
      unit: item.pack_unit,
      quantity: 1,
      total_price: item.cost_price
    };
    orderItems.value.push(newItem);
  }
  
  selectedItem.value = '';
};

const removeItem = (index: number) => {
  orderItems.value.splice(index, 1);
};

const updateItemTotal = (item: any) => {
  item.total_price = (parseFloat(item.unit_price) * item.quantity).toFixed(2);
};

const loadData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await vendorStore.fetchVendors();
    
    // Set the vendor ID from route and load vendor items
    if (vendorId.value) {
      orderData.value.vendor_id = vendorId.value.toString();
      await loadVendorItems();
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const createOrder = async () => {
  if (!orderData.value.vendor_id) {
    alert('Please select a vendor');
    return;
  }
  
  if (orderItems.value.length === 0) {
    alert('Please add at least one item to the order');
    return;
  }
  
  try {
    const orderPayload = {
      ...orderData.value,
      items: orderItems.value,
      total_amount: orderTotal.value
    };
    
    // TODO: Implement actual order creation
    console.log('Creating vendor order:', orderPayload);
    alert('Vendor order created successfully!');
    router.push('/orders');
  } catch (err: any) {
    alert('Failed to create order: ' + err.message);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.new-vendor-order {
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
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
  margin-top: 1rem;
}

.vendor-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.vendor-info p {
  margin: 0 0 0.25rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.add-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.add-item .form-select {
  flex: 1;
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

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.item-info p {
  margin: 0 0 0.25rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  text-align: center;
}

.item-total {
  font-weight: 600;
  color: #27ae60;
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e74c3c;
  background: white;
  color: #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #e74c3c;
  color: white;
}

.order-summary {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.total {
  border-top: 1px solid #ecf0f1;
  padding-top: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
}

.summary-label {
  color: #2c3e50;
}

.summary-value {
  color: #27ae60;
  font-weight: 600;
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
  .add-item {
    flex-direction: column;
  }
  
  .item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .item-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
