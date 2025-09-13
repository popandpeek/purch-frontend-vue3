<template>
  <div class="order-details-with-vendor-selection">
    <!-- Order Basic Info -->
    <div class="order-info-section">
      <div class="order-header">
        <h3>Order #{{ order.id }}</h3>
        <div class="order-status">
          <span class="status-badge" :class="order.status">{{ order.status }}</span>
        </div>
      </div>
      
      <div class="order-meta">
        <div class="meta-item">
          <span class="label">Date:</span>
          <span class="value">{{ formatDate(order.date) }}</span>
        </div>
        <div class="meta-item">
          <span class="label">Total Cost:</span>
          <span class="value">${{ order.total_estimated_cost.toFixed(2) }}</span>
        </div>
        <div class="meta-item">
          <span class="label">Items:</span>
          <span class="value">{{ order.items.length }}</span>
        </div>
        <div class="meta-item">
          <span class="label">Vendor Orders:</span>
          <span class="value">{{ order.vendor_orders.length }}</span>
        </div>
      </div>

      <div v-if="order.notes" class="order-notes">
        <h4>Notes</h4>
        <p>{{ order.notes }}</p>
      </div>
    </div>

    <!-- Vendor Selection Configuration -->
    <div class="vendor-selection-section">
      <div class="section-header">
        <h3>Vendor Selection Configuration</h3>
        <div class="section-actions">
          <button 
            class="btn btn-outline btn-sm" 
            @click="showConfigModal = true"
          >
            Configure
          </button>
          <button 
            class="btn btn-primary btn-sm" 
            @click="runVendorSelection"
            :disabled="loading"
          >
            {{ loading ? 'Running...' : 'Run Selection' }}
          </button>
        </div>
      </div>

      <div v-if="vendorSelections.length > 0" class="selection-results">
        <VendorSelectionResults
          :selections="vendorSelections"
          :loading="loading"
          @override="handleVendorOverride"
        />
      </div>

      <div v-else class="no-selections">
        <p>No vendor selections available. Click "Run Selection" to generate vendor recommendations.</p>
      </div>
    </div>

    <!-- Order Items -->
    <div class="order-items-section">
      <h3>Order Items</h3>
      <div class="items-list">
        <div v-for="item in order.items" :key="item.id" class="item-card">
          <div class="item-header">
            <h4>Item #{{ item.house_item_id }}</h4>
            <div class="item-actions">
              <button 
                class="btn btn-outline btn-sm"
                @click="showItemVendorComparison(item)"
              >
                Compare Vendors
              </button>
            </div>
          </div>
          
          <div class="item-details">
            <div class="detail-item">
              <span class="label">Quantity:</span>
              <span class="value">{{ item.quantity }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Priority:</span>
              <span class="value priority" :class="item.priority">{{ item.priority }}</span>
            </div>
          </div>

          <!-- Item-specific vendor selection config -->
          <div v-if="item.vendor_selection_config" class="item-config">
            <h5>Item Configuration</h5>
            <div class="config-summary">
              <span class="config-item">Strategy: {{ item.vendor_selection_config.strategy }}</span>
              <span class="config-item">Quality: {{ item.vendor_selection_config.quality_preference }}</span>
              <span v-if="item.vendor_selection_config.brand_preference" class="config-item">
                Brand: {{ item.vendor_selection_config.brand_preference }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vendor Orders -->
    <div v-if="order.vendor_orders.length > 0" class="vendor-orders-section">
      <h3>Generated Vendor Orders</h3>
      <div class="vendor-orders-list">
        <div v-for="vendorOrder in order.vendor_orders" :key="vendorOrder.id" class="vendor-order-card">
          <div class="vendor-order-header">
            <h4>{{ vendorOrder.vendor.name }}</h4>
            <span class="vendor-order-status" :class="vendorOrder.status">
              {{ vendorOrder.status }}
            </span>
          </div>
          <div class="vendor-order-details">
            <div class="detail-item">
              <span class="label">Total Amount:</span>
              <span class="value">${{ vendorOrder.total_amount.toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Items:</span>
              <span class="value">{{ vendorOrder.items.length }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Submitted:</span>
              <span class="value">{{ vendorOrder.submitted ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Modal -->
    <div v-if="showConfigModal" class="modal-overlay" @click="closeConfigModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Vendor Selection Configuration</h3>
          <button class="modal-close" @click="closeConfigModal">&times;</button>
        </div>
        <div class="modal-body">
          <VendorSelectionConfig
            :config="order.vendor_selection_config || defaultConfig"
            :level="'order'"
            :level-id="order.id"
            :available-vendors="availableVendors"
            :show-inheritance="true"
            :inheritance="configInheritance"
            :loading="loading"
            @update:config="updateOrderConfig"
            @save="saveOrderConfig"
            @reset="resetOrderConfig"
          />
        </div>
      </div>
    </div>

    <!-- Vendor Comparison Modal -->
    <div v-if="showComparisonModal" class="modal-overlay" @click="closeComparisonModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Vendor Comparison - Item #{{ selectedItem?.house_item_id }}</h3>
          <button class="modal-close" @click="closeComparisonModal">&times;</button>
        </div>
        <div class="modal-body">
          <VendorComparison
            :vendor-items="vendorItems"
            :house-item-id="selectedItem?.house_item_id || 0"
            :quantity="selectedItem?.quantity || 1"
            :loading="loading"
            :recommended-item="getRecommendedItem(selectedItem)"
            @select="handleItemSelection"
            @refresh="refreshVendorItems"
            @run-selection="runItemVendorSelection"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHouseOrdersStore } from '../../stores/house-orders';
import { useVendorsStore } from '../../stores/vendors';
import VendorSelectionConfig from '../vendor-selection/VendorSelectionConfig.vue';
import VendorSelectionResults from '../vendor-selection/VendorSelectionResults.vue';
import VendorComparison from '../vendor-selection/VendorComparison.vue';
import type { HouseOrder, VendorSelection, VendorSelectionConfig, ConfigInheritance, VendorItem, HouseOrderItem } from '../../stores/house-orders';

interface Props {
  order: HouseOrder;
}

const props = defineProps<Props>();

const houseOrderStore = useHouseOrdersStore();
const vendorsStore = useVendorsStore();

// Reactive state
const loading = ref(false);
const showConfigModal = ref(false);
const showComparisonModal = ref(false);
const vendorSelections = ref<VendorSelection[]>([]);
const configInheritance = ref<ConfigInheritance | null>(null);
const selectedItem = ref<HouseOrderItem | null>(null);
const vendorItems = ref<VendorItem[]>([]);

// Computed properties
const availableVendors = computed(() => 
  vendorsStore.vendors.map(vendor => ({
    id: vendor.id,
    name: vendor.name
  }))
);

const defaultConfig = computed(() => houseOrderStore.getDefaultVendorSelectionConfig());

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const runVendorSelection = async () => {
  loading.value = true;
  try {
    vendorSelections.value = await houseOrderStore.getVendorSelections(props.order.id);
  } catch (error) {
    console.error('Failed to run vendor selection:', error);
  } finally {
    loading.value = false;
  }
};

const handleVendorOverride = async (selection: VendorSelection, vendorItemId: number) => {
  try {
    await houseOrderStore.overrideVendorSelection(selection.vendor_item.id, vendorItemId);
    // Refresh vendor selections after override
    await runVendorSelection();
  } catch (error) {
    console.error('Failed to override vendor selection:', error);
  }
};

const showItemVendorComparison = async (item: HouseOrderItem) => {
  selectedItem.value = item;
  loading.value = true;
  try {
    // Fetch vendor items for this house item
    // This would typically be an API call
    vendorItems.value = []; // Placeholder - would fetch from API
    showComparisonModal.value = true;
  } catch (error) {
    console.error('Failed to load vendor items:', error);
  } finally {
    loading.value = false;
  }
};

const closeComparisonModal = () => {
  showComparisonModal.value = false;
  selectedItem.value = null;
  vendorItems.value = [];
};

const closeConfigModal = () => {
  showConfigModal.value = false;
};

const updateOrderConfig = (config: VendorSelectionConfig) => {
  // Update local config
  props.order.vendor_selection_config = config;
};

const saveOrderConfig = async (config: VendorSelectionConfig) => {
  loading.value = true;
  try {
    await houseOrderStore.updateVendorSelectionConfig('order', props.order.id, config);
    closeConfigModal();
  } catch (error) {
    console.error('Failed to save configuration:', error);
  } finally {
    loading.value = false;
  }
};

const resetOrderConfig = () => {
  props.order.vendor_selection_config = defaultConfig.value;
};

const handleItemSelection = (item: VendorItem) => {
  console.log('Item selected:', item);
  // Handle item selection logic
};

const refreshVendorItems = async () => {
  if (!selectedItem.value) return;
  
  loading.value = true;
  try {
    // Refresh vendor items for the selected item
    // This would typically be an API call
    vendorItems.value = []; // Placeholder
  } catch (error) {
    console.error('Failed to refresh vendor items:', error);
  } finally {
    loading.value = false;
  }
};

const runItemVendorSelection = async () => {
  if (!selectedItem.value) return;
  
  loading.value = true;
  try {
    // Run vendor selection for specific item
    // This would typically be an API call
    console.log('Running vendor selection for item:', selectedItem.value);
  } catch (error) {
    console.error('Failed to run item vendor selection:', error);
  } finally {
    loading.value = false;
  }
};

const getRecommendedItem = (item: HouseOrderItem | null): VendorItem | undefined => {
  if (!item) return undefined;
  
  // Find recommended vendor item for this house item
  // This would typically come from the vendor selection results
  return undefined;
};

// Load initial data
onMounted(async () => {
  try {
    // Load vendors
    await vendorsStore.fetchVendors();
    
    // Load config inheritance if available
    if (props.order.items.length > 0) {
      try {
        configInheritance.value = await houseOrderStore.getConfigInheritance(props.order.items[0].id || 0);
      } catch (error) {
        console.log('Config inheritance not available');
      }
    }
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }
});
</script>

<style scoped>
.order-details-with-vendor-selection {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.order-info-section,
.vendor-selection-section,
.order-items-section,
.vendor-orders-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  margin: 0;
  color: #374151;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-header h3 {
  margin: 0;
  color: #374151;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.draft {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.submitted {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.processing {
  background: #fce7f3;
  color: #be185d;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.order-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.meta-item .label {
  font-weight: 500;
  color: #6b7280;
}

.meta-item .value {
  font-weight: 600;
  color: #374151;
}

.order-notes {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.order-notes h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
}

.order-notes p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.no-selections {
  text-align: center;
  padding: 32px;
  color: #6b7280;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-header h4 {
  margin: 0;
  color: #374151;
  font-size: 16px;
}

.item-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item .label {
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
}

.detail-item .value {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.detail-item .value.priority {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item .value.priority.low {
  background: #fef3c7;
  color: #92400e;
}

.detail-item .value.priority.normal {
  background: #dbeafe;
  color: #1e40af;
}

.detail-item .value.priority.high {
  background: #fee2e2;
  color: #dc2626;
}

.item-config {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.item-config h5 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 14px;
}

.config-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.config-item {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.vendor-orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vendor-order-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.vendor-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.vendor-order-header h4 {
  margin: 0;
  color: #374151;
  font-size: 16px;
}

.vendor-order-status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.vendor-order-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.vendor-order-status.confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.vendor-order-status.shipped {
  background: #fce7f3;
  color: #be185d;
}

.vendor-order-status.delivered {
  background: #d1fae5;
  color: #065f46;
}

.vendor-order-status.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.vendor-order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
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

.modal-content.large {
  max-width: 1000px;
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
  padding: 6px 12px;
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

.btn-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
