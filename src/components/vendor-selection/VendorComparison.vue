<template>
  <div class="vendor-comparison">
    <div class="comparison-header">
      <h3>Vendor Comparison</h3>
      <div class="comparison-controls">
        <button 
          class="btn btn-outline" 
          @click="refreshComparison"
          :disabled="loading"
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
        <button 
          class="btn btn-primary" 
          @click="runVendorSelection"
          :disabled="loading"
        >
          Run Selection
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading vendor options...</p>
    </div>

    <div v-else-if="vendorItems.length === 0" class="empty-state">
      <p>No vendor items available for comparison.</p>
    </div>

    <div v-else class="comparison-table">
      <div class="table-header">
        <div class="header-cell vendor">Vendor</div>
        <div class="header-cell product">Product</div>
        <div class="header-cell brand">Brand</div>
        <div class="header-cell case-size">Case Size</div>
        <div class="header-cell price">Price/Case</div>
        <div class="header-cell unit-price">Price/Unit</div>
        <div class="header-cell availability">Available</div>
        <div class="header-cell quality">Quality</div>
        <div class="header-cell delivery">Delivery</div>
        <div class="header-cell actions">Actions</div>
      </div>

      <div class="table-body">
        <div 
          v-for="(item, index) in vendorItems" 
          :key="item.id" 
          class="table-row"
          :class="{ 
            selected: selectedItem?.id === item.id,
            recommended: item.id === recommendedItem?.id
          }"
        >
          <div class="cell vendor">
            <div class="vendor-info">
              <span class="vendor-name">{{ item.vendor_name }}</span>
              <span v-if="item.id === recommendedItem?.id" class="badge recommended">Recommended</span>
            </div>
          </div>
          
          <div class="cell product">
            <span class="product-name">{{ item.product_name }}</span>
            <span class="sku">SKU: {{ item.sku || 'N/A' }}</span>
          </div>
          
          <div class="cell brand">
            <span class="brand-name">{{ item.brand || 'Generic' }}</span>
          </div>
          
          <div class="cell case-size">
            <span class="case-size">{{ item.case_size }} {{ item.pack_unit }}</span>
          </div>
          
          <div class="cell price">
            <span class="price">${{ item.price_per_case.toFixed(2) }}</span>
          </div>
          
          <div class="cell unit-price">
            <span class="unit-price">${{ item.price_per_unit.toFixed(2) }}</span>
          </div>
          
          <div class="cell availability">
            <span 
              class="availability-badge" 
              :class="{ available: item.is_available, unavailable: !item.is_available }"
            >
              {{ item.is_available ? 'Available' : 'Out of Stock' }}
            </span>
          </div>
          
          <div class="cell quality">
            <div class="quality-rating">
              <div class="stars">
                <span 
                  v-for="star in 5" 
                  :key="star" 
                  class="star"
                  :class="{ filled: star <= getQualityRating(item) }"
                >
                  ★
                </span>
              </div>
              <span class="rating-text">{{ getQualityRating(item) }}/5</span>
            </div>
          </div>
          
          <div class="cell delivery">
            <span class="delivery-time">{{ getDeliveryTime(item) }} days</span>
          </div>
          
          <div class="cell actions">
            <button 
              class="btn btn-sm btn-outline"
              @click="selectItem(item)"
              :disabled="!item.is_available"
            >
              {{ selectedItem?.id === item.id ? 'Selected' : 'Select' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedItem" class="selection-summary">
      <h4>Selected Item Summary</h4>
      <div class="summary-content">
        <div class="summary-item">
          <span class="label">Vendor:</span>
          <span class="value">{{ selectedItem.vendor_name }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Product:</span>
          <span class="value">{{ selectedItem.product_name }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Cost:</span>
          <span class="value">${{ (selectedItem.price_per_case * quantity).toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Cost per Unit:</span>
          <span class="value">${{ selectedItem.price_per_unit.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { VendorItem } from '../../stores/house-orders';

interface Props {
  vendorItems: VendorItem[];
  houseItemId: number;
  quantity: number;
  loading?: boolean;
  recommendedItem?: VendorItem;
}

interface Emits {
  (e: 'select', item: VendorItem): void;
  (e: 'refresh'): void;
  (e: 'run-selection'): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<Emits>();

const selectedItem = ref<VendorItem | null>(null);

const selectItem = (item: VendorItem) => {
  selectedItem.value = item;
  emit('select', item);
};

const refreshComparison = () => {
  emit('refresh');
};

const runVendorSelection = () => {
  emit('run-selection');
};

// Mock quality rating - in real implementation, this would come from the backend
const getQualityRating = (item: VendorItem): number => {
  // Simple mock based on price and brand
  let rating = 3;
  if (item.brand && item.brand !== 'Generic') rating += 1;
  if (item.price_per_case > 50) rating += 0.5;
  if (item.price_per_case > 100) rating += 0.5;
  return Math.min(5, Math.max(1, Math.round(rating)));
};

// Mock delivery time - in real implementation, this would come from the backend
const getDeliveryTime = (item: VendorItem): number => {
  // Simple mock based on vendor
  const vendorDeliveryTimes: { [key: string]: number } = {
    'Vendor A': 1,
    'Vendor B': 2,
    'Vendor C': 3,
    'Vendor D': 1,
    'Vendor E': 2
  };
  return vendorDeliveryTimes[item.vendor_name] || 3;
};
</script>

<style scoped>
.vendor-comparison {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.comparison-header h3 {
  margin: 0;
  color: #374151;
}

.comparison-controls {
  display: flex;
  gap: 12px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.comparison-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-cell {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row.selected {
  background: #dbeafe;
  border-color: #3b82f6;
}

.table-row.recommended {
  background: #f0fdf4;
  border-color: #22c55e;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 14px;
}

.vendor-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vendor-name {
  font-weight: 600;
  color: #374151;
}

.badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.recommended {
  background: #dcfce7;
  color: #166534;
}

.product-name {
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.sku {
  font-size: 12px;
  color: #6b7280;
}

.brand-name {
  color: #374151;
}

.case-size {
  color: #374151;
}

.price {
  font-weight: 600;
  color: #374151;
}

.unit-price {
  color: #6b7280;
  font-size: 12px;
}

.availability-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.availability-badge.available {
  background: #dcfce7;
  color: #166534;
}

.availability-badge.unavailable {
  background: #fee2e2;
  color: #dc2626;
}

.quality-rating {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #d1d5db;
  font-size: 14px;
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  font-size: 12px;
  color: #6b7280;
}

.delivery-time {
  color: #374151;
}

.selection-summary {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.selection-summary h4 {
  margin: 0 0 16px 0;
  color: #374151;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label {
  font-weight: 500;
  color: #6b7280;
}

.summary-item .value {
  font-weight: 600;
  color: #374151;
}

/* Button Styles */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-outline {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
