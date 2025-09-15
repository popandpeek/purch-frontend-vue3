<template>
  <div class="vendor-selection-card" :class="cardClasses">
    <div class="vendor-selection-card__header">
      <div class="selection-info">
        <h4 class="selection-title">{{ selection.houseOrderItemId }}</h4>
        <span class="selection-status" :class="statusClass">
          {{ statusText }}
        </span>
      </div>
      <div class="confidence-badge" :class="confidenceClass">
        {{ confidenceText }}
      </div>
    </div>

    <div class="vendor-selection-card__content">
      <!-- Selected Vendor -->
      <div class="selected-vendor">
        <h5 class="vendor-title">Selected Vendor</h5>
        <div class="vendor-details">
          <div class="vendor-info">
            <span class="vendor-name">{{ selectedVendorName }}</span>
            <span class="vendor-product">{{ selectedProductName }}</span>
          </div>
          <div class="vendor-metrics">
            <span class="vendor-price">{{ selectedPrice }}</span>
            <span class="savings">{{ savingsText }}</span>
          </div>
        </div>
        <div class="selection-reason">
          <span class="strategy">{{ strategyText }}</span>
          <span class="reason">{{ selection.selectionReason.reason }}</span>
        </div>
      </div>

      <!-- Alternatives -->
      <div v-if="hasAlternatives" class="alternatives">
        <h5 class="alternatives-title">Alternative Options</h5>
        <div class="alternatives-list">
          <div 
            v-for="alternative in selection.alternatives" 
            :key="alternative.vendor_item_id"
            class="alternative-item"
          >
            <div class="alternative-info">
              <span class="alternative-vendor">{{ alternative.vendor_item.vendor.name }}</span>
              <span class="alternative-product">{{ alternative.vendor_item.product_name }}</span>
            </div>
            <div class="alternative-metrics">
              <span class="alternative-price">${{ alternative.vendor_item.price_per_case }}</span>
              <span 
                class="cost-difference"
                :class="alternative.cost_difference > 0 ? 'cost-higher' : 'cost-lower'"
              >
                {{ alternative.cost_difference > 0 ? '+' : '' }}${{ alternative.cost_difference.toFixed(2) }}
              </span>
            </div>
            <button 
              class="btn btn--tertiary btn--xs"
              @click="handleOverride(alternative.vendor_item_id)"
              :disabled="loading"
            >
              Select
            </button>
          </div>
        </div>
      </div>

      <!-- Override Information -->
      <div v-if="selection.isOverridden" class="override-info">
        <div class="override-badge">
          <span class="override-icon">⚠️</span>
          <span class="override-text">Manually Overridden</span>
        </div>
        <div class="override-details">
          <span class="override-by">Overridden by: {{ selection.overriddenBy }}</span>
          <span class="override-date">{{ formatDate(selection.overriddenAt) }}</span>
        </div>
        <button 
          class="btn btn--secondary btn--xs"
          @click="handleResetOverride"
          :disabled="loading"
        >
          Reset to Auto
        </button>
      </div>
    </div>

    <div class="vendor-selection-card__footer">
      <div class="selection-actions">
        <button 
          class="btn btn--ghost btn--sm"
          @click="handleViewDetails"
          :disabled="loading"
        >
          View Details
        </button>
        <button 
          class="btn btn--ghost btn--sm"
          @click="handleViewConfig"
          :disabled="loading"
        >
          View Config
        </button>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="vendor-selection-card__loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { VendorSelection } from '@/core/entities/VendorSelection';
import { VendorSelectionService } from '@/application/services/VendorSelectionService';

interface Props {
  selection: VendorSelection;
  vendorSelectionService?: VendorSelectionService;
}

const props = withDefaults(defineProps<Props>(), {
  vendorSelectionService: undefined
});

const emit = defineEmits<{
  override: [itemId: number, vendorItemId: number];
  resetOverride: [itemId: number];
  viewDetails: [selection: VendorSelection];
  viewConfig: [selection: VendorSelection];
  selectionUpdated: [selection: VendorSelection];
}>();

const loading = ref(false);

// Computed properties
const cardClasses = computed(() => ({
  'vendor-selection-card--overridden': props.selection.isOverridden,
  'vendor-selection-card--high-confidence': props.selection.isConfidentSelection(),
  'vendor-selection-card--loading': loading.value
}));

const statusClass = computed(() => {
  if (props.selection.isOverridden) return 'status--overridden';
  if (props.selection.isConfidentSelection()) return 'status--confident';
  return 'status--auto';
});

const statusText = computed(() => {
  if (props.selection.isOverridden) return 'Manual Override';
  if (props.selection.isConfidentSelection()) return 'Auto Selected';
  return 'Auto Selected';
});

const confidenceClass = computed(() => {
  const level = props.selection.getConfidenceLevel();
  return `confidence--${level}`;
});

const confidenceText = computed(() => props.selection.getFormattedConfidenceScore());

const hasAlternatives = computed(() => props.selection.hasAlternatives());

const strategyText = computed(() => props.selection.getStrategyDisplayName());

const savingsText = computed(() => {
  const savings = props.selection.getFormattedCostSavings();
  return savings !== '$0.00' ? `Save ${savings}` : 'No savings';
});

// Mock data - in real implementation, this would come from the selection data
const selectedVendorName = computed(() => {
  // This would be populated from the actual vendor item data
  return 'Selected Vendor Name';
});

const selectedProductName = computed(() => {
  // This would be populated from the actual vendor item data
  return 'Selected Product Name';
});

const selectedPrice = computed(() => {
  // This would be populated from the actual vendor item data
  return '$25.99';
});

// Event handlers
const handleOverride = async (vendorItemId: number) => {
  if (!props.vendorSelectionService) {
    // Emit event to parent component
    emit('override', props.selection.houseOrderItemId, vendorItemId);
    return;
  }

  loading.value = true;
  try {
    const updatedSelection = await props.vendorSelectionService.overrideSelection({
      itemId: props.selection.houseOrderItemId,
      vendorItemId,
      overriddenBy: 'Current User' // This would come from auth context
    });
    
    emit('selectionUpdated', updatedSelection);
  } catch (error) {
    console.error('Failed to override selection:', error);
    // Handle error
  } finally {
    loading.value = false;
  }
};

const handleResetOverride = async () => {
  if (!props.vendorSelectionService) {
    // Emit event to parent component
    emit('resetOverride', props.selection.houseOrderItemId);
    return;
  }

  loading.value = true;
  try {
    const updatedSelection = await props.vendorSelectionService.resetOverride(props.selection.houseOrderItemId);
    emit('selectionUpdated', updatedSelection);
  } catch (error) {
    console.error('Failed to reset override:', error);
    // Handle error
  } finally {
    loading.value = false;
  }
};

const handleViewDetails = () => {
  emit('viewDetails', props.selection);
};

const handleViewConfig = () => {
  emit('viewConfig', props.selection);
};

// Utility function
const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
</script>

<style scoped>
@import '@/shared/design-system/styles/tokens';
@import '@/shared/design-system/styles/buttons';
@import '@/shared/design-system/styles/cards';

.vendor-selection-card {
  @extend .card;
  position: relative;
  border: 2px solid var(--color-neutral-200);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.vendor-selection-card:hover {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-lg);
}

.vendor-selection-card--overridden {
  border-color: var(--color-warning);
  background-color: #fffbf0;
}

.vendor-selection-card--high-confidence {
  border-color: var(--color-success);
}

.vendor-selection-card--loading {
  opacity: 0.7;
  pointer-events: none;
}

.vendor-selection-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.selection-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.selection-title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
  margin: 0;
}

.selection-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  width: fit-content;
}

.status--auto {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.status--confident {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.status--overridden {
  background-color: var(--color-warning-light);
  color: #856404;
}

.confidence-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  min-width: 60px;
}

.confidence--high {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.confidence--medium {
  background-color: var(--color-warning-light);
  color: #856404;
}

.confidence--low {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

.vendor-selection-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.selected-vendor {
  background-color: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.vendor-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-700);
  margin: 0 0 var(--spacing-sm) 0;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.vendor-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.vendor-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.vendor-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
}

.vendor-product {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
}

.vendor-metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.vendor-price {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-neutral-900);
}

.savings {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-success);
}

.selection-reason {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.strategy {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-700);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.reason {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-600);
  font-style: italic;
}

.alternatives {
  border-top: 1px solid var(--color-neutral-200);
  padding-top: var(--spacing-md);
}

.alternatives-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-700);
  margin: 0 0 var(--spacing-sm) 0;
}

.alternatives-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.alternative-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--border-radius-md);
  gap: var(--spacing-sm);
}

.alternative-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.alternative-vendor {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-neutral-900);
}

.alternative-product {
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
}

.alternative-metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.alternative-price {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-900);
}

.cost-difference {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.cost-higher {
  color: var(--color-error);
}

.cost-lower {
  color: var(--color-success);
}

.override-info {
  background-color: #fffbf0;
  border: 1px solid var(--color-warning);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

.override-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.override-icon {
  font-size: var(--font-size-sm);
}

.override-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #856404;
}

.override-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-neutral-600);
}

.vendor-selection-card__footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--color-neutral-200);
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.selection-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.vendor-selection-card__loading {
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
  .vendor-details {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .vendor-metrics {
    align-items: flex-start;
  }
  
  .alternative-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .alternative-metrics {
    align-items: flex-start;
  }
  
  .selection-actions {
    flex-direction: column;
  }
}
</style>
