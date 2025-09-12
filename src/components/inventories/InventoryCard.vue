<template>
  <div class="inventory-card" :class="cardClasses">
    <div class="card-header">
      <h3 class="item-name">{{ item.name }}</h3>
      <div class="status-badge" :class="statusClass">
        {{ statusText }}
      </div>
    </div>
    
    <div class="card-content">
      <div class="stock-info">
        <div class="current-stock">
          <span class="label">Current:</span>
          <span class="value">{{ item.current_count }}</span>
        </div>
        <div class="par-level">
          <span class="label">Par Level:</span>
          <span class="value">{{ item.par_level }}</span>
        </div>
      </div>
      
      <div class="stock-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :class="progressClass"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ progressPercentage }}%</span>
      </div>
      
      <div class="item-details">
        <div class="detail-row">
          <span class="detail-label">Category:</span>
          <span class="detail-value">{{ item.inventory_category }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Storage:</span>
          <span class="detail-value">{{ item.storage_location }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unit:</span>
          <span class="detail-value">{{ item.tracking_unit }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unit Price:</span>
          <span class="detail-value">${{ item.current_price_per_unit }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Case Price:</span>
          <span class="detail-value">${{ casePrice }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-actions">
      <button 
        class="action-btn secondary" 
        @click="$emit('adjust-count', item)"
      >
        Adjust Count
      </button>
      <button 
        class="action-btn primary" 
        @click="$emit('create-order', item)"
        :disabled="!canOrder"
      >
        Create Order
      </button>
      <button 
        class="action-btn tertiary" 
        @click="$emit('view-details', item)"
      >
        Details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HouseItem } from '@/api/model';

interface Props {
  item: HouseItem;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'order-more': [item: HouseItem];
  'adjust-count': [item: HouseItem];
  'view-details': [item: HouseItem];
}>();

const progressPercentage = computed(() => {
  if (props.item.par_level === 0) return 0;
  return Math.min(100, Math.round((props.item.current_count / props.item.par_level) * 100));
});

const isLowStock = computed(() => props.item.current_count < props.item.par_level);
const isCriticalStock = computed(() => props.item.current_count < (props.item.par_level * 0.5));
const isOutOfStock = computed(() => props.item.current_count === 0);

const cardClasses = computed(() => ({
  'low-stock': isLowStock.value && !isCriticalStock.value,
  'critical-stock': isCriticalStock.value,
  'out-of-stock': isOutOfStock.value,
  'good-stock': !isLowStock.value
}));

const statusClass = computed(() => {
  if (isOutOfStock.value) return 'out-of-stock';
  if (isCriticalStock.value) return 'critical';
  if (isLowStock.value) return 'low';
  return 'good';
});

const statusText = computed(() => {
  if (isOutOfStock.value) return 'Out of Stock';
  if (isCriticalStock.value) return 'Critical';
  if (isLowStock.value) return 'Low Stock';
  return 'In Stock';
});

const progressClass = computed(() => {
  if (isOutOfStock.value) return 'out-of-stock';
  if (isCriticalStock.value) return 'critical';
  if (isLowStock.value) return 'low';
  return 'good';
});

const canOrder = computed(() => props.item.active && !isOutOfStock.value);

const casePrice = computed(() => {
  // For now, we'll use the unit price as case price since the API doesn't provide separate case pricing
  // In a real implementation, this would come from vendor items or a separate case pricing field
  return props.item.current_price_per_unit;
});
</script>

<style scoped>
.inventory-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.inventory-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.inventory-card.low-stock {
  border-left-color: #f39c12;
}

.inventory-card.critical-stock {
  border-left-color: #e74c3c;
}

.inventory-card.out-of-stock {
  border-left-color: #c0392b;
  background: #fdf2f2;
}

.inventory-card.good-stock {
  border-left-color: #27ae60;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem 0.5rem;
  border-bottom: 1px solid #ecf0f1;
}

.item-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.good {
  background: #d4edda;
  color: #155724;
}

.status-badge.low {
  background: #fff3cd;
  color: #856404;
}

.status-badge.critical {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.out-of-stock {
  background: #f5c6cb;
  color: #721c24;
}

.card-content {
  padding: 1rem 1.5rem;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.current-stock, .par-level {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.stock-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.good {
  background: #27ae60;
}

.progress-fill.low {
  background: #f39c12;
}

.progress-fill.critical {
  background: #e74c3c;
}

.progress-fill.out-of-stock {
  background: #c0392b;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #7f8c8d;
  min-width: 35px;
  text-align: right;
}

.item-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.detail-value {
  font-size: 0.8rem;
  font-weight: 500;
  color: #2c3e50;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #ecf0f1;
}

.action-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #3498db;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2980b9;
}

.action-btn.secondary {
  background: #95a5a6;
  color: white;
}

.action-btn.secondary:hover {
  background: #7f8c8d;
}

.action-btn.tertiary {
  background: transparent;
  color: #7f8c8d;
  border: 1px solid #bdc3c7;
}

.action-btn.tertiary:hover {
  background: #ecf0f1;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .item-details {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .action-btn {
    flex: none;
  }
}
</style>
