<template>
  <edit-page
    :page-title="`Edit Vendor Order #${vendorOrderId}${selectedVendor ? ' - ' + selectedVendor.name : ''}`"
    page-description="Edit vendor order details and items"
    :loading="loading"
    :error="error"
    @save="updateOrder"
    @retry="loadOrder"
  >
    <div v-if="orderData" class="vendor-order-edit">
      <!-- Vendor Information -->
      <div class="section">
        <h3>Vendor Information</h3>
        <div class="vendor-info">
          <h4>{{ selectedVendor?.name }}</h4>
          <p>Contact: {{ selectedVendor?.contact_first_name }} {{ selectedVendor?.contact_last_name }}</p>
          <p>Email: {{ selectedVendor?.contact_email }}</p>
          <p>Phone: {{ selectedVendor?.phone }}</p>
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="section">
        <h3>Order Items ({{ orderItems.length }})</h3>
        <div v-if="!isQuantityEditable" class="read-only-notice">
          <span class="notice-icon">🔒</span>
          <span>This order is {{ orderData.status }}. Quantities cannot be modified.</span>
        </div>
        <div class="items-section">
          <div class="add-item">
            <select 
              v-model="selectedItem" 
              class="form-select" 
              :disabled="!isQuantityEditable"
              @change="addItem"
            >
              <option value="">Select an item to add</option>
              <option v-for="item in availableVendorItems" :key="item.id" :value="item.id">
                {{ item.product_name }} - ${{ item.price_per_case }}
              </option>
            </select>
            <button 
              class="btn btn-outline" 
              :disabled="!isQuantityEditable"
              @click="addItem"
            >
              Add Item
            </button>
          </div>

          <div v-if="orderItems.length === 0" class="empty-state">
            <p>No items in this order. Add items from the dropdown above.</p>
          </div>

          <div v-else class="items-list">
            <div v-for="(item, index) in orderItems" :key="item.id" class="item-row">
              <div class="item-info">
                <h4>{{ item.product_name }}</h4>
                <p>SKU: {{ item.sku }}</p>
                <p>${{ item.unit_price }} per {{ item.unit }}</p>
              </div>
              <div class="item-controls">
                <input 
                  v-model.number="item.quantity" 
                  type="number" 
                  min="1" 
                  class="quantity-input"
                  :disabled="!isQuantityEditable"
                  @change="updateItemTotal(item)"
                >
                <span class="item-total">${{ item.total_price }}</span>
                <button 
                  class="remove-btn" 
                  :disabled="!isQuantityEditable"
                  @click="removeItem(index)"
                >
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVendorOrderStore } from '../../../stores/vendor-orders';
import { useVendorStore } from '../../../stores/vendors';
import EditPage from '../../EditPage.vue';
import instance from '../../../http-common';
import type { VendorOrder, VendorItem, VendorOrderItem } from '../../../api/model';

const route = useRoute();
const router = useRouter();
const vendorOrderStore = useVendorOrderStore();
const vendorStore = useVendorStore();

const loading = ref(false);
const error = ref<string | null>(null);
const selectedItem = ref('');
const availableVendorItems = ref<VendorItem[]>([]);

const vendorOrderId = computed(() => route.params.vendorOrderId as string);

const orderData = ref<Partial<VendorOrder>>({
  id: 0,
  vendor_id: 0,
  date: '',
  status: 'pending',
  total_amount: 0,
  notes: '',
  submitted: false,
  items: []
});

const orderItems = ref<Array<VendorOrderItem & { product_name?: string; sku?: string; unit_price?: string; total_price?: string }>>([]);

const vendors = computed(() => vendorStore.vendors);

const selectedVendor = computed(() => {
  if (!orderData.value.vendor_id) return null;
  return vendors.value.find(v => v.id === orderData.value.vendor_id);
});

const isQuantityEditable = computed(() => {
  return orderData.value.status === 'pending';
});

const orderSubtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    if (item.unit_price === undefined) return sum;
    if (item.quantity === undefined) return sum;
    const price = parseFloat(item.unit_price);
    const quantity = parseFloat(item.quantity);
    return sum + (price * quantity);
  }, 0).toFixed(2);
});

const orderTotal = computed(() => {
  return orderSubtotal.value;
});

const loadOrder = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await vendorOrderStore.fetchVendorOrders();
    await vendorStore.fetchVendors();
    
    const order = vendorOrderStore.vendorOrders.find(o => o.id === parseInt(vendorOrderId.value));
    if (!order) {
      error.value = 'Order not found';
      return;
    }
    
    // Populate order data
    orderData.value = {
      id: order.id,
      vendor_id: order.vendor_id,
      date: order.date,
      status: order.status,
      total_amount: order.total_amount,
      notes: order.notes,
      submitted: order.submitted
    };
    
    // Populate order items
    orderItems.value = order.items?.map(item => {
      const newItem = {
        ...item,
        product_name: (item as any).vendor_item_name,
        sku: (item as any).vendor_item_sku,
        unit_price: (item as any).unit_price,
        total_price: (item as any).total_price
      };
      return newItem;
    });
    
    // Load vendor items for adding new items
    await loadVendorItems();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const loadVendorItems = async () => {
  if (!orderData.value.vendor_id) {
    availableVendorItems.value = [];
    return;
  }
  
  try {
    const response = await instance.get(`/vendors/${orderData.value.vendor_id}/items/`);
    availableVendorItems.value = response.data;
  } catch (err: any) {
    console.error('Failed to load vendor items:', err);
    availableVendorItems.value = [];
    throw err;
  }
};

const addItem = () => {
  if (!selectedItem.value) return;
  
  const item = availableVendorItems.value.find(i => i.id === parseInt(selectedItem.value));
  if (!item) return;
  
  const existingItem = orderItems.value.find(i => i.vendor_item_id === item.id);
  if (existingItem) {
    existingItem.quantity = (parseFloat(existingItem.quantity?.toString()) + 1).toString();
    updateItemTotal(existingItem);
  } else {
    const newItem: VendorOrderItem & { product_name?: string; sku?: string; unit_price?: string; total_price?: string } = {
      id: 0,
      vendor_item_id: item.id,
      vendor_order_id: orderData.value.id !== undefined ? orderData.value.id : 0,
      vendor_invoice_id: 0,
      price: item.price_per_case,
      quantity: '1',
      measure: item.pack_unit,
      unit: item.pack_unit,
      product_name: item.product_name,
      sku: item.sku,
      unit_price: item.price_per_case,
      total_price: item.price_per_case
    };
    orderItems.value.push(newItem);
  }
  
  selectedItem.value = '';
};

const removeItem = (index: number) => {
  orderItems.value.splice(index, 1);
};

const updateItemTotal = (item: any) => {
  if (item.unit_price === undefined) {
    item.total_price = '0.00';
    return;
  }
  if (item.quantity === undefined) {
    item.total_price = '0.00';
    return;
  }
  const price = parseFloat(item.unit_price);
  const quantity = parseFloat(item.quantity);
  const total = price * quantity;
  item.total_price = isNaN(total) ? '0.00' : total.toFixed(2);
};

const updateOrder = async () => {
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
      items: orderItems.value.map(item => ({
        id: item.id,
        vendor_item_id: item.vendor_item_id,
        vendor_order_id: item.vendor_order_id,
        vendor_invoice_id: item.vendor_invoice_id,
        price: item.unit_price,
        quantity: item.quantity,
        measure: item.measure,
        unit: item.unit
      })),
      total_amount: parseFloat(orderTotal.value)
    };
    
    await vendorOrderStore.updateVendorOrder(parseInt(vendorOrderId.value), orderPayload);
    alert('Vendor order updated successfully!');
    router.push(`/vendors/orders/${vendorOrderId.value}`);
  } catch (err: any) {
    alert('Failed to update order: ' + err.message);
  }
};

// Watch for changes in order items and recalculate totals
watch(orderItems, () => {
  orderItems.value.forEach(item => {
    updateItemTotal(item);
  });
}, { deep: true });

onMounted(() => {
  loadOrder();
});
</script>

<style scoped>
.vendor-order-edit {
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

.read-only-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.notice-icon {
  font-size: 1rem;
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

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.quantity-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
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

.remove-btn:hover:not(:disabled) {
  background: #e74c3c;
  color: white;
}

.remove-btn:disabled {
  background: #f8f9fa;
  color: #6c757d;
  border-color: #dee2e6;
  cursor: not-allowed;
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
  .form-grid {
    grid-template-columns: 1fr;
  }
  
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
