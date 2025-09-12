<template>
  <div class="product-card">
    <div class="product-header">
      <div class="product-info">
        <h3 class="product-name">{{ getProductName() }}</h3>
        <div class="product-meta">
          <span v-if="type === 'vendor'" class="product-vendor">{{ (product as any).vendor_name || 'Unknown Vendor' }}</span>
        </div>
      </div>
      <div class="product-status">
        <span class="status-badge" :class="statusClass">
          {{ isActive ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>

    <div class="product-content">
      <div class="product-details">
        <div class="detail-row">
          <span class="detail-label">Price:</span>
          <span class="detail-value">${{ productPrice }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unit:</span>
          <span class="detail-value">{{ productUnit }}</span>
        </div>
        <div v-if="type === 'house'" class="detail-row">
          <span class="detail-label">Stock:</span>
          <span class="detail-value" :class="stockClass">{{ currentStock }}</span>
        </div>
        <div v-if="type === 'house'" class="detail-row">
          <span class="detail-label">Par Level:</span>
          <span class="detail-value">{{ parLevel }}</span>
        </div>
        <div v-if="type === 'vendor'" class="detail-row">
          <span class="detail-label">SKU:</span>
          <span class="detail-value">{{ productSku }}</span>
        </div>
        <div v-if="type === 'vendor'" class="detail-row">
          <span class="detail-label">Brand:</span>
          <span class="detail-value">{{ brandName }}</span>
        </div>
        <div v-if="type === 'vendor'" class="detail-row">
          <span class="detail-label">Pack Size:</span>
          <span class="detail-value">{{ caseSize }}</span>
        </div>
        <div v-if="type === 'vendor'" class="detail-row">
          <span class="detail-label">Case Unit:</span>
          <span class="detail-value">{{ measure }}</span>
        </div>
      </div>

      <div v-if="type === 'house'" class="product-storage">
        <div class="storage-info">
          <span class="storage-label">Storage:</span>
          <span class="storage-value">{{ product.storage_location || 'Not specified' }}</span>
        </div>
        <div v-if="isLowStock" class="low-stock-warning">
          <span class="warning-text">Low Stock</span>
        </div>
      </div>

      <div v-if="type === 'vendor'" class="vendor-info">
        <div class="vendor-details">
          <span class="vendor-label">Vendor ID:</span>
          <span class="vendor-value">{{ (product as any).vendor_id || 'N/A' }}</span>
        </div>
        <div class="vendor-details">
          <span class="vendor-label">House Item ID:</span>
          <span class="vendor-value">{{ (product as any).house_item_id || 'N/A' }}</span>
        </div>
      </div>

      <div v-if="productDescription" class="product-description">
        <p>{{ productDescription }}</p>
      </div>
    </div>

    <div class="product-footer">
      <div class="product-actions">
        <button class="action-btn edit" @click="handleView">
          Edit
        </button>
        <button 
          v-if="type === 'house'" 
          class="action-btn order" 
          @click="handleOrder" 
          :disabled="!canOrder"
        >
          Order
        </button>
        <button 
          v-if="type === 'vendor'" 
          class="action-btn order-history" 
          @click="handleOrderHistory"
        >
          Order History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HouseItem, VendorItem } from '../../api/model';

interface Props {
  product: HouseItem | VendorItem;
  type: 'house' | 'vendor';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  view: [product: HouseItem | VendorItem];
  edit: [product: HouseItem | VendorItem];
  delete: [product: HouseItem | VendorItem];
  order: [product: HouseItem | VendorItem];
  'order-history': [product: HouseItem | VendorItem];
}>();

// Methods
const getProductName = () => {
  if (props.type === 'vendor') {
    return (props.product as any).product_name || 'Unnamed Product';
  }
  return (props.product as any).name || 'Unnamed Product';
};

const isActive = computed(() => {
  return (props.product as any).active !== false;
});

const statusClass = computed(() => {
  return isActive.value ? 'status-active' : 'status-inactive';
});

const productPrice = computed(() => {
  if (props.type === 'house') {
    return (props.product as any).current_price_per_unit || '0.00';
  } else {
    // Use price_per_case for vendor items
    return (props.product as any).price_per_case || '0.00';
  }
});

const productUnit = computed(() => {
  if (props.type === 'house') {
    return (props.product as any).tracking_unit || 'each';
  } else {
    return (props.product as any).pack_unit || 'each';
  }
});

const currentStock = computed(() => {
  return (props.product as any).current_count || 0;
});

const parLevel = computed(() => {
  return (props.product as any).par_level || 0;
});

const productSku = computed(() => {
  if (props.type === 'vendor') {
    return (props.product as any).vendor_product_id || 'N/A';
  }
  return 'N/A';
});

const caseSize = computed(() => {
  if (props.type === 'vendor') {
    const packSize = (props.product as any).pack_size || 0;
    const caseSize = (props.product as any).case_size || 0;
    if (packSize && caseSize) {
      return `${caseSize} x ${packSize}`;
    }
    return packSize ? packSize.toString() : 'N/A';
  }
  return 'N/A';
});

const productDescription = computed(() => {
  return (props.product as any).description || null;
});

const brandName = computed(() => {
  if (props.type === 'vendor') {
    return (props.product as any).brand || 'N/A';
  }
  return 'N/A';
});

const measure = computed(() => {
  if (props.type === 'vendor') {
    return (props.product as any).case_weight_unit || 'N/A';
  }
  return 'N/A';
});

const isLowStock = computed(() => {
  if (props.type !== 'house') return false;
  const stock = currentStock.value;
  const par = parLevel.value;
  return stock < par && stock > 0;
});

const stockClass = computed(() => {
  if (!isLowStock.value) return '';
  return 'low-stock';
});

const canOrder = computed(() => {
  return isActive.value;
});

// Methods
const handleView = () => {
  emit('view', props.product);
};

const handleEdit = () => {
  emit('edit', props.product);
};

const handleOrder = () => {
  emit('order', props.product);
};

const handleOrderHistory = () => {
  emit('order-history', props.product);
};
</script>

<style scoped>
.product-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.product-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.product-info {
  flex: 1;
}

.product-name {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-category {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.product-type {
  color: #3d008d;
  font-size: 0.8rem;
  font-weight: 600;
  background: #e8f4fd;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.product-content {
  margin-bottom: 1.5rem;
}

.product-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.detail-value.low-stock {
  color: #e74c3c;
  font-weight: 700;
}

.product-storage {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.storage-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
}

.storage-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.low-stock-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.9rem;
}

.vendor-info {
  background: #f0f8ff;
  border: 1px solid #3498db;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.vendor-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.vendor-details:last-child {
  margin-bottom: 0;
}

.vendor-label {
  font-size: 0.8rem;
  color: #2980b9;
  font-weight: 500;
}

.vendor-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.warning-icon {
  font-size: 1rem;
}

.product-description {
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
}

.product-description p {
  margin: 0;
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.5;
  font-style: italic;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #bdc3c7;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #3d008d;
  color: #3d008d;
}

.action-btn.view:hover:not(:disabled) {
  background: #e8f4fd;
}

.action-btn.edit:hover:not(:disabled) {
  background: #fff3cd;
  border-color: #f39c12;
  color: #f39c12;
}

.action-btn.order:hover:not(:disabled) {
  background: #d4edda;
  border-color: #27ae60;
  color: #27ae60;
}

.action-btn.order-history:hover:not(:disabled) {
  background: #e8f4fd;
  border-color: #3d008d;
  color: #3d008d;
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .product-card {
    padding: 1rem;
  }
  
  .product-details {
    grid-template-columns: 1fr;
  }
  
  .product-storage {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .product-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .product-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
