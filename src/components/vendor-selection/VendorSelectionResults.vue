<template>
  <div class="vendor-selection-results">
    <div class="results-header">
      <h3>Vendor Selection Results</h3>
      <div class="summary-stats">
        <div class="stat">
          <span class="stat-label">Total Savings</span>
          <span class="stat-value savings">${{ totalSavings.toFixed(2) }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Vendors Used</span>
          <span class="stat-value">{{ uniqueVendors.length }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Items Selected</span>
          <span class="stat-value">{{ selections.length }}</span>
        </div>
      </div>
    </div>

    <div v-if="selections.length === 0" class="empty-state">
      <p>No vendor selections available. Please run vendor selection first.</p>
    </div>

    <div v-else class="selections-list">
      <div v-for="(selection, index) in selections" :key="index" class="selection-item">
        <div class="item-header">
          <div class="item-info">
            <h4>{{ selection.vendor_item.product_name }}</h4>
            <p class="vendor-name">{{ selection.vendor_item.vendor_name }}</p>
            <p class="item-details">
              {{ selection.vendor_item.case_size }} {{ selection.vendor_item.pack_unit }} per case
              • ${{ selection.vendor_item.price_per_case.toFixed(2) }} per case
            </p>
          </div>
          <div class="selection-actions">
            <button 
              class="btn btn-sm btn-outline" 
              @click="showAlternatives(selection)"
            >
              View Alternatives
            </button>
            <button 
              class="btn btn-sm btn-primary" 
              @click="overrideSelection(selection)"
            >
              Override
            </button>
          </div>
        </div>

        <div class="selection-details">
          <div class="reasoning">
            <h5>Selection Reasoning</h5>
            <div class="reasoning-grid">
              <div class="reason-item">
                <span class="reason-label">Primary Factor:</span>
                <span class="reason-value">{{ selection.selection_reason.primary_factor }}</span>
              </div>
              <div class="reason-item">
                <span class="reason-label">Price Difference:</span>
                <span class="reason-value" :class="selection.selection_reason.price_difference < 0 ? 'savings' : 'cost'">
                  ${{ selection.selection_reason.price_difference.toFixed(2) }}
                </span>
              </div>
              <div class="reason-item">
                <span class="reason-label">Delivery Advantage:</span>
                <span class="reason-value" :class="selection.selection_reason.delivery_advantage > 0 ? 'faster' : 'slower'">
                  {{ selection.selection_reason.delivery_advantage }} days
                </span>
              </div>
              <div class="reason-item">
                <span class="reason-label">Quality Rating:</span>
                <span class="reason-value">{{ selection.selection_reason.quality_rating }}/10</span>
              </div>
              <div class="reason-item">
                <span class="reason-label">Consolidation Benefit:</span>
                <span class="reason-value savings">
                  ${{ selection.selection_reason.consolidation_benefit.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <div class="cost-analysis">
            <h5>Cost Analysis</h5>
            <div class="cost-breakdown">
              <div class="cost-item">
                <span>Selected Item Cost:</span>
                <span>${{ selection.vendor_item.price_per_case.toFixed(2) }}</span>
              </div>
              <div class="cost-item">
                <span>Cost Savings:</span>
                <span class="savings">${{ selection.cost_savings.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alternatives Modal -->
    <div v-if="showAlternativesModal" class="modal-overlay" @click="closeAlternatives">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Alternative Vendor Options</h3>
          <button class="modal-close" @click="closeAlternatives">&times;</button>
        </div>
        <div class="modal-body">
          <div v-for="(alternative, index) in currentAlternatives" :key="index" class="alternative-item">
            <div class="alternative-info">
              <h4>{{ alternative.product_name }}</h4>
              <p class="vendor-name">{{ alternative.vendor_name }}</p>
              <p class="alternative-details">
                {{ alternative.case_size }} {{ alternative.pack_unit }} per case
                • ${{ alternative.price_per_case.toFixed(2) }} per case
              </p>
            </div>
            <div class="alternative-actions">
              <button 
                class="btn btn-sm btn-primary" 
                @click="selectAlternative(alternative)"
              >
                Select This Option
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { VendorSelection } from '../../stores/house-orders';

interface Props {
  selections: VendorSelection[];
  loading?: boolean;
}

interface Emits {
  (e: 'override', selection: VendorSelection, vendorItemId: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<Emits>();

const showAlternativesModal = ref(false);
const currentAlternatives = ref<any[]>([]);

const totalSavings = computed(() => {
  return props.selections.reduce((sum, selection) => sum + selection.cost_savings, 0);
});

const uniqueVendors = computed(() => {
  const vendorIds = new Set(props.selections.map(s => s.vendor_item.vendor_id));
  return Array.from(vendorIds).map(id => {
    const selection = props.selections.find(s => s.vendor_item.vendor_id === id);
    return selection?.vendor_item.vendor_name || `Vendor ${id}`;
  });
});

const showAlternatives = (selection: VendorSelection) => {
  currentAlternatives.value = selection.alternatives;
  showAlternativesModal.value = true;
};

const closeAlternatives = () => {
  showAlternativesModal.value = false;
  currentAlternatives.value = [];
};

const selectAlternative = (alternative: any) => {
  // Find the original selection to emit the override
  const originalSelection = props.selections.find(s => 
    s.alternatives.some(a => a.id === alternative.id)
  );
  
  if (originalSelection) {
    emit('override', originalSelection, alternative.id);
  }
  
  closeAlternatives();
};

const overrideSelection = (selection: VendorSelection) => {
  // For now, just show alternatives. In a real implementation,
  // this might open a more detailed override interface
  showAlternatives(selection);
};
</script>

<style scoped>
.vendor-selection-results {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.results-header h3 {
  margin: 0;
  color: #374151;
}

.summary-stats {
  display: flex;
  gap: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #374151;
}

.stat-value.savings {
  color: #059669;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.selections-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selection-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #f9fafb;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.item-info h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 16px;
}

.vendor-name {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.item-details {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.selection-actions {
  display: flex;
  gap: 8px;
}

.selection-details {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.reasoning h5,
.cost-analysis h5 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.reasoning-grid {
  display: grid;
  gap: 8px;
}

.reason-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.reason-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.reason-value {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.reason-value.savings {
  color: #059669;
}

.reason-value.cost {
  color: #dc2626;
}

.reason-value.faster {
  color: #059669;
}

.reason-value.slower {
  color: #dc2626;
}

.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.cost-item span:first-child {
  color: #6b7280;
}

.cost-item span:last-child {
  font-weight: 600;
  color: #374151;
}

.cost-item .savings {
  color: #059669;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #374151;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.alternative-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
}

.alternative-info h4 {
  margin: 0 0 4px 0;
  color: #374151;
  font-size: 14px;
}

.alternative-details {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

/* Button Styles */
.btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-outline {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>
