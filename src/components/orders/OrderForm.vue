<template>
  <div class="order-form">
    <div class="form-header">
      <h2>{{ isEditing ? 'Edit Order' : 'Create New Order' }}</h2>
      <p>{{ isEditing ? 'Update order details' : 'Fill in the order information below' }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-grid">
        <!-- Order Date -->
        <div class="form-group">
          <label for="date">Order Date *</label>
          <input
            id="date"
            v-model="formData.date"
            type="date"
            required
            :class="{ 'error': errors.date }"
          />
          <span v-if="errors.date" class="error-message">{{ errors.date }}</span>
        </div>

        <!-- Order Status -->
        <div class="form-group" v-if="isEditing">
          <label for="status">Status</label>
          <select id="status" v-model="formData.status">
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Priority -->
        <div class="form-group">
          <label for="priority">Priority</label>
          <select id="priority" v-model="formData.priority">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <!-- Notes -->
        <div class="form-group full-width">
          <label for="notes">Notes</label>
          <textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Add any additional notes or special instructions..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- Order Items Section -->
      <div class="order-items-section">
        <div class="section-header">
          <h3>Order Items</h3>
          <button type="button" class="btn btn-secondary" @click="addItem">
            <span class="btn-icon">+</span>
            Add Item
          </button>
        </div>

        <div v-if="formData.items.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h4>No items added yet</h4>
          <p>Click "Add Item" to start building your order</p>
        </div>

        <div v-else class="items-list">
          <OrderItemForm
            v-for="(item, index) in formData.items"
            :key="item.tempId || index"
            :item="item"
            :index="index"
            @update="updateItem"
            @remove="removeItem"
          />
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="handleCancel">
          Cancel
        </button>
        <button type="button" class="btn btn-outline" @click="handleSaveDraft" :disabled="isSubmitting">
          Save Draft
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !isFormValid">
          <span v-if="isSubmitting" class="loading-spinner"></span>
          {{ isEditing ? 'Update Order' : 'Create Order' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useHouseOrdersStore, type HouseOrder, type HouseOrderItem } from '@/stores/house-orders';
import OrderItemForm from './OrderItemForm.vue';

// Props
const props = defineProps<{
  order?: HouseOrder | null;
  isEditing?: boolean;
}>();

// Emits
const emit = defineEmits<{
  success: [order: HouseOrder];
  cancel: [];
}>();

// Store
const orderStore = useHouseOrdersStore();

// State
const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});

// Form data
const formData = reactive<Partial<HouseOrder> & { items: (HouseOrderItem & { tempId?: string })[] }>({
  date: new Date().toISOString().split('T')[0],
  status: 'draft',
  notes: '',
  total_estimated_cost: 0,
  items: []
});

// Computed
const isFormValid = computed(() => {
  return formData.date && formData.items.length > 0;
});

// Methods
const addItem = () => {
  const tempId = `temp_${Date.now()}_${Math.random()}`;
  formData.items.push({
    tempId,
    house_item_id: 0,
    quantity: 1,
    priority: 'normal'
  });
};

const updateItem = (index: number, updatedItem: HouseOrderItem) => {
  formData.items[index] = { ...updatedItem, tempId: formData.items[index].tempId };
  calculateTotal();
};

const removeItem = (index: number) => {
  formData.items.splice(index, 1);
  calculateTotal();
};

const calculateTotal = () => {
  // This would calculate based on house item prices
  // For now, we'll set to 0 as we don't have pricing data
  formData.total_estimated_cost = 0;
};

const validateForm = (): boolean => {
  errors.value = {};
  
  if (!formData.date) {
    errors.value.date = 'Order date is required';
  }
  
  if (formData.items.length === 0) {
    errors.value.items = 'At least one item is required';
  }
  
  // Validate each item
  formData.items.forEach((item, index) => {
    if (!item.house_item_id) {
      errors.value[`item_${index}`] = 'Please select an item';
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.value[`quantity_${index}`] = 'Quantity must be greater than 0';
    }
  });
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    let order: HouseOrder;
    
    if (props.isEditing && props.order?.id) {
      order = await orderStore.updateOrder(props.order.id, formData);
    } else {
      order = await orderStore.createOrder(formData);
    }
    
    emit('success', order);
  } catch (error) {
    console.error('Error saving order:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleSaveDraft = async () => {
  if (!formData.date) {
    errors.value.date = 'Order date is required';
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const draftData = { ...formData, status: 'draft' };
    let order: HouseOrder;
    
    if (props.isEditing && props.order?.id) {
      order = await orderStore.updateOrder(props.order.id, draftData);
    } else {
      order = await orderStore.createOrder(draftData);
    }
    
    emit('success', order);
  } catch (error) {
    console.error('Error saving draft:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};

// Initialize form data
onMounted(() => {
  if (props.isEditing && props.order) {
    Object.assign(formData, props.order);
    // Add tempId to existing items for tracking
    formData.items = formData.items.map(item => ({
      ...item,
      tempId: `existing_${item.id}`
    }));
  }
});
</script>

<style scoped>
.order-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.form-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.form-header p {
  color: #6c757d;
  margin: 0;
  font-size: 0.95rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
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

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  font-weight: 500;
}

.order-items-section {
  border-top: 1px solid #e9ecef;
  padding-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
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

.btn-outline {
  background: transparent;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover {
  background: #3d008d;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.1rem;
  font-weight: bold;
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
  .order-form {
    padding: 1.5rem;
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
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
