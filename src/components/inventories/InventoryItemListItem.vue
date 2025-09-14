<template>
  <div class="inventory-item-card">
    <div class="item-header">
      <div class="item-info">
        <h4 class="item-name">{{ houseItemName || 'Unknown Item' }}</h4>
        <p class="item-id">Item ID: #{{ houseItemId }}</p>
      </div>
      <div class="item-price">
        <span class="unit-price">${{ price || '0.00' }}</span>
        <span class="price-label">per {{ measure || 'unit' }}</span>
      </div>
    </div>

    <div class="item-details">
      <div class="detail-row">
        <span class="detail-label">Current Quantity:</span>
        <div class="quantity-section">
          <input 
            v-if="isEditable && !orderSubmitted"
            v-model="editableQuantity"
            type="number"
            step="0.01"
            min="0"
            class="quantity-input"
            @blur="updateQuantity"
            @keyup.enter="updateQuantity"
          />
          <span v-else class="quantity-display">{{ quantity || '0' }} {{ measure || 'units' }}</span>
        </div>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Value:</span>
        <span class="detail-value total">${{ calculateTotal() }}</span>
      </div>
    </div>

    <div class="item-meta">
      <div class="meta-item">
        <span class="meta-label">Inventory Item ID:</span>
        <span class="meta-value">#{{ id }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Status:</span>
        <span class="meta-value status" :class="statusClass">
          {{ orderSubmitted ? 'Locked' : 'Editable' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useHouseItemsStore } from "@/stores/house-items";

// Props
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  inventoryId: {
    type: Number,
    required: true,
  },
  houseItemId: {
    type: Number,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  measure: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: false,
  },
  orderSubmitted: {
    type: Boolean,
    required: true,
  },
  isEditable: {
    type: Boolean,
    default: true,
  }
});

// Emits
const emit = defineEmits<{
  'update-quantity': [itemId: number, newQuantity: string];
}>();

// Stores
const houseItemsStore = useHouseItemsStore();

// Reactive state
const editableQuantity = ref(props.quantity);

// Computed properties
const houseItemName = computed(() => {
  return houseItemsStore.items.find((item) => item.id === props.houseItemId)?.name;
});

const statusClass = computed(() => {
  return props.orderSubmitted ? 'status-locked' : 'status-editable';
});

// Methods
const calculateTotal = () => {
  console.log('Calculating total for item:', props.id);
  console.log('Price value:', props.price, 'Type:', typeof props.price);
  console.log('Quantity value:', props.quantity, 'Type:', typeof props.quantity);
  
  const price = parseFloat(props.price || '0');
  const qty = parseFloat(props.quantity || '0');
  const total = price * qty;
  
  console.log('Parsed price:', price, 'Parsed qty:', qty, 'Total:', total);
  return isNaN(total) ? '0.00' : total.toFixed(2);
};

const updateQuantity = () => {
  if (editableQuantity.value !== props.quantity) {
    emit('update-quantity', props.id, editableQuantity.value);
  }
};
</script>

<style scoped>
.inventory-item-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.inventory-item-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.item-id {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.item-price {
  text-align: right;
}

.unit-price {
  display: block;
  color: #3d008d;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.price-label {
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
}

.item-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.detail-value.total {
  color: #3d008d;
  font-size: 1rem;
  font-weight: 700;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-input {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 100px;
  text-align: center;
}

.quantity-input:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 2px rgba(61, 0, 141, 0.1);
}

.quantity-display {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.item-meta {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 0.8rem;
  color: #495057;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.meta-value.status {
  font-family: inherit;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-editable {
  background: #d4edda;
  color: #155724;
}

.status-locked {
  background: #f8d7da;
  color: #721c24;
}

/* Responsive Design */
@media (max-width: 768px) {
  .item-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .item-price {
    text-align: left;
  }
  
  .item-details {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
