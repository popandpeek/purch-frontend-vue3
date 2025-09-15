<template>
  <div class="product-card" :class="cardClasses">
    <div class="product-card__header">
      <div class="product-card__title-section">
        <h3 class="product-card__title">{{ product.name }}</h3>
        <span class="product-card__status" :class="statusClass">
          {{ statusText }}
        </span>
      </div>
      <div class="product-card__meta">
        <span class="product-card__category">{{ product.inventoryCategory }}</span>
        <span class="product-card__location">{{ product.storageLocation }}</span>
      </div>
    </div>

    <div class="product-card__content">
      <div class="product-card__stock-info">
        <div class="stock-display">
          <div class="stock-current">
            <span class="stock-label">Current</span>
            <span class="stock-value">{{ product.currentCount }} {{ product.trackingUnit }}</span>
          </div>
          <div class="stock-par">
            <span class="stock-label">Par Level</span>
            <span class="stock-value">{{ product.parLevel }} {{ product.trackingUnit }}</span>
          </div>
        </div>
        
        <div class="stock-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :class="progressClass"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ progressPercentage }}%</span>
        </div>
      </div>

      <div class="product-card__details">
        <div class="detail-row">
          <span class="detail-label">Price:</span>
          <span class="detail-value">{{ formattedPrice }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Unit:</span>
          <span class="detail-value">{{ product.trackingUnit }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value" :class="statusClass">{{ statusText }}</span>
        </div>
      </div>
    </div>

    <div class="product-card__footer">
      <div class="product-card__actions">
        <button 
          class="btn btn--secondary btn--sm"
          @click="handleEdit"
          :disabled="loading"
        >
          Edit
        </button>
        <button 
          class="btn btn--primary btn--sm"
          @click="handleAdjustStock"
          :disabled="loading"
        >
          Adjust Stock
        </button>
        <button 
          v-if="product.needsReorder()"
          class="btn btn--success btn--sm"
          @click="handleCreateOrder"
          :disabled="loading"
        >
          Create Order
        </button>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="product-card__loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Product } from '@/core/entities/Product';
import { ProductService } from '@/application/services/ProductService';

interface Props {
  product: Product;
  productService?: ProductService;
}

const props = withDefaults(defineProps<Props>(), {
  productService: undefined
});

const emit = defineEmits<{
  edit: [product: Product];
  adjustStock: [product: Product];
  createOrder: [product: Product];
  stockUpdated: [product: Product];
}>();

const loading = ref(false);

// Computed properties for styling and display
const cardClasses = computed(() => ({
  'product-card--low-stock': props.product.isLowStock(),
  'product-card--out-of-stock': props.product.isOutOfStock(),
  'product-card--critical': props.product.isCriticalStock(),
  'product-card--overstocked': props.product.isOverstocked(),
  'product-card--loading': loading.value
}));

const statusClass = computed(() => {
  const status = props.product.getStockStatus();
  return `status--${status.replace('_', '-')}`;
});

const statusText = computed(() => props.product.getStockDisplayText());

const progressPercentage = computed(() => props.product.getStockPercentage());

const progressClass = computed(() => {
  const status = props.product.getStockStatus();
  return `progress--${status.replace('_', '-')}`;
});

const formattedPrice = computed(() => props.product.getFormattedPrice());

// Event handlers
const handleEdit = () => {
  emit('edit', props.product);
};

const handleAdjustStock = () => {
  emit('adjustStock', props.product);
};

const handleCreateOrder = () => {
  emit('createOrder', props.product);
};

// Method to update stock (could be called from parent)
const updateStock = async (newCount: number) => {
  if (!props.productService) return;
  
  loading.value = true;
  try {
    const updatedProduct = await props.productService.setStockCount(props.product.id, newCount);
    emit('stockUpdated', updatedProduct);
  } catch (error) {
    console.error('Failed to update stock:', error);
    // Handle error (could emit an error event)
  } finally {
    loading.value = false;
  }
};

// Expose methods for parent component
defineExpose({
  updateStock
});
</script>

<style scoped>
@import '@/shared/design-system/styles/tokens';
@import '@/shared/design-system/styles/buttons';
@import '@/shared/design-system/styles/cards';

.product-card {
  @extend .card;
  position: relative;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Status-based styling */
.product-card--low-stock {
  border-left: 4px solid var(--color-warning);
}

.product-card--out-of-stock {
  border-left: 4px solid var(--color-error);
}

.product-card--critical {
  border-left: 4px solid #dc3545;
  background-color: #fff5f5;
}

.product-card--overstocked {
  border-left: 4px solid var(--color-info);
}

.product-card--loading {
  opacity: 0.7;
  pointer-events: none;
}

.product-card__header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.product-card__title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.product-card__title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
  margin: 0;
  line-height: var(--line-height-tight);
  flex: 1;
}

.product-card__status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  white-space: nowrap;
}

.status--normal {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.status--low-stock {
  background-color: var(--color-warning-light);
  color: #856404;
}

.status--out-of-stock {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

.status--critical {
  background-color: #fed7d7;
  color: #c53030;
}

.status--overstocked {
  background-color: var(--color-info-light);
  color: var(--color-info);
}

.product-card__meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
}

.product-card__category,
.product-card__location {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-neutral-100);
  border-radius: var(--border-radius-sm);
}

.product-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.product-card__stock-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.stock-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.stock-current,
.stock-par {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stock-label {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
  margin-bottom: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.stock-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
}

.stock-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--color-neutral-200);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--border-radius-full);
  transition: width var(--duration-normal) var(--easing-ease-out);
}

.progress--normal {
  background-color: var(--color-success);
}

.progress--low-stock {
  background-color: var(--color-warning);
}

.progress--out-of-stock {
  background-color: var(--color-error);
}

.progress--critical {
  background-color: #dc3545;
}

.progress--overstocked {
  background-color: var(--color-info);
}

.progress-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-600);
  min-width: 35px;
  text-align: right;
}

.product-card__details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  font-weight: var(--font-weight-medium);
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-900);
  font-weight: var(--font-weight-medium);
}

.product-card__footer {
  display: flex;
  justify-content: flex-end;
}

.product-card__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.product-card__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-lg);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-neutral-300);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-card__title-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .product-card__status {
    align-self: flex-start;
  }
  
  .stock-display {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .product-card__actions {
    justify-content: stretch;
  }
  
  .product-card__actions .btn {
    flex: 1;
  }
}
</style>
