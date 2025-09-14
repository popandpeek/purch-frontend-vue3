<template>
  <div class="order-item-form">
    <div class="item-header">
      <h4>Item {{ index + 1 }}</h4>
      <button type="button" class="remove-btn" @click="handleRemove">
        Remove
      </button>
    </div>

    <div class="item-form">
      <div class="form-grid">
        <!-- House Item Selection -->
        <div class="form-group">
          <label for="house_item_id">Item *</label>
          <select
            id="house_item_id"
            v-model="itemData.house_item_id"
            required
            :class="{ 'error': errors.house_item_id }"
            @change="handleItemChange"
          >
            <option value="">Select an item</option>
            <option
              v-for="item in houseItems"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }} ({{ item.tracking_unit }})
            </option>
          </select>
          <span v-if="errors.house_item_id" class="error-message">{{ errors.house_item_id }}</span>
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label for="quantity">Quantity *</label>
          <input
            id="quantity"
            v-model.number="itemData.quantity"
            type="number"
            min="1"
            step="1"
            required
            :class="{ 'error': errors.quantity }"
            @input="handleQuantityChange"
          />
          <span v-if="errors.quantity" class="error-message">{{ errors.quantity }}</span>
        </div>

        <!-- Priority -->
        <div class="form-group">
          <label for="priority">Priority</label>
          <select id="priority" v-model="itemData.priority">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <!-- Unit Display -->
        <div class="form-group" v-if="selectedHouseItem">
          <label>Unit</label>
          <div class="unit-display">
            {{ selectedHouseItem.tracking_unit }}
          </div>
        </div>
      </div>

      <!-- Item Details -->
      <div v-if="selectedHouseItem" class="item-details">
        <div class="detail-row">
          <span class="detail-label">Storage Location:</span>
          <span class="detail-value">{{ selectedHouseItem.storage_location }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Category:</span>
          <span class="detail-value">{{ selectedHouseItem.inventory_category }}</span>
        </div>
        <div class="detail-row" v-if="selectedHouseItem.current_price_per_unit">
          <span class="detail-label">Current Price:</span>
          <span class="detail-value">${{ parseFloat(selectedHouseItem.current_price_per_unit).toFixed(2) }}/{{ selectedHouseItem.tracking_unit }}</span>
        </div>
        <div class="detail-row" v-if="selectedHouseItem.par_level">
          <span class="detail-label">Par Level:</span>
          <span class="detail-value">{{ selectedHouseItem.par_level }} {{ selectedHouseItem.tracking_unit }}</span>
        </div>
      </div>

      <!-- Estimated Cost -->
      <div v-if="estimatedCost > 0" class="cost-display">
        <div class="cost-row">
          <span class="cost-label">Estimated Cost:</span>
          <span class="cost-value">${{ estimatedCost.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useHouseItemsStore } from '@/stores/house-items';
import type { HouseOrderItem } from '@/stores/house-orders';

// Props
const props = defineProps<{
  item: HouseOrderItem & { tempId?: string };
  index: number;
}>();

// Emits
const emit = defineEmits<{
  update: [index: number, item: HouseOrderItem];
  remove: [index: number];
}>();

// Store
const houseItemsStore = useHouseItemsStore();

// State
const errors = ref<Record<string, string>>({});

// Form data
const itemData = reactive<HouseOrderItem>({
  house_item_id: props.item.house_item_id,
  quantity: props.item.quantity,
  priority: props.item.priority,
  vendor_selection_config: props.item.vendor_selection_config
});

// Computed
const houseItems = computed(() => houseItemsStore.items || []);
const selectedHouseItem = computed(() => 
  houseItems.value.find((item: any) => item.id === itemData.house_item_id)
);

const estimatedCost = computed(() => {
  if (selectedHouseItem.value?.current_price_per_unit && itemData.quantity) {
    return parseFloat(selectedHouseItem.value.current_price_per_unit) * itemData.quantity;
  }
  return 0;
});

// Methods
const validateItem = (): boolean => {
  errors.value = {};
  
  if (!itemData.house_item_id) {
    errors.value.house_item_id = 'Please select an item';
  }
  
  if (!itemData.quantity || itemData.quantity <= 0) {
    errors.value.quantity = 'Quantity must be greater than 0';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleItemChange = () => {
  validateItem();
  emitUpdate();
};

const handleQuantityChange = () => {
  validateItem();
  emitUpdate();
};

const handleRemove = () => {
  emit('remove', props.index);
};

const emitUpdate = () => {
  if (validateItem()) {
    emit('update', props.index, { ...itemData });
  }
};

// Lifecycle
onMounted(async () => {
  // Load house items if not already loaded
  if (houseItems.value.length === 0) {
    await houseItemsStore.fetchHouseItems();
  }
});
</script>

<style scoped>
.order-item-form {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.order-item-form:hover {
  border-color: #3d008d;
  box-shadow: 0 2px 8px rgba(61, 0, 141, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
}

.item-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.remove-btn:hover {
  background: #c82333;
}


.item-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.form-group input,
.form-group select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 2px rgba(61, 0, 141, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  font-weight: 500;
}

.unit-display {
  padding: 0.6rem 0.8rem;
  background: #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
}

.item-details {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #dee2e6;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6c757d;
  font-size: 0.85rem;
}

.detail-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.cost-display {
  background: #e8f4fd;
  border: 1px solid #3d008d;
  border-radius: 6px;
  padding: 1rem;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cost-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.cost-value {
  font-weight: 700;
  color: #3d008d;
  font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .cost-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
