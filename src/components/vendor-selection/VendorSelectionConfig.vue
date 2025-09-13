<template>
  <div class="vendor-selection-config">
    <h3>Vendor Selection Configuration</h3>
    
    <div class="config-section">
      <div class="form-group">
        <label class="form-label">Selection Strategy</label>
        <select v-model="localConfig.strategy" class="form-select" @change="updateConfig">
          <option value="lowest_price">Lowest Price</option>
          <option value="best_value">Best Value</option>
          <option value="preferred_vendor">Preferred Vendor</option>
          <option value="delivery_optimization">Delivery Optimization</option>
        </select>
        <p class="form-help">
          {{ strategyDescriptions[localConfig.strategy] }}
        </p>
      </div>

      <div class="form-group">
        <label class="form-label">Minimum Order Threshold</label>
        <input 
          v-model.number="localConfig.min_order_threshold" 
          type="number" 
          step="0.01" 
          min="0"
          class="form-input"
          @change="updateConfig"
        >
        <p class="form-help">Minimum order amount to trigger bulk discounts</p>
      </div>

      <div class="form-group">
        <label class="form-label">
          <input 
            v-model="localConfig.delivery_priority" 
            type="checkbox" 
            @change="updateConfig"
          >
          Prioritize Fast Delivery
        </label>
        <p class="form-help">When enabled, faster delivery options will be preferred over cost savings</p>
      </div>

      <div class="form-group">
        <label class="form-label">Quality Preference</label>
        <select v-model="localConfig.quality_preference" class="form-select" @change="updateConfig">
          <option value="budget">Budget</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Organic Preference</label>
        <div class="slider-container">
          <input 
            v-model.number="localConfig.organic_preference" 
            type="range" 
            min="0" 
            max="1" 
            step="0.1"
            class="form-range"
            @change="updateConfig"
          >
          <span class="slider-value">{{ Math.round(localConfig.organic_preference * 100) }}%</span>
        </div>
        <p class="form-help">Higher values prefer organic products (may increase cost)</p>
      </div>

      <div class="form-group">
        <label class="form-label">Preferred Vendors</label>
        <div class="vendor-selection">
          <div v-for="vendor in availableVendors" :key="vendor.id" class="vendor-option">
            <label>
              <input 
                v-model="localConfig.preferred_vendor_ids" 
                type="checkbox" 
                :value="vendor.id"
                @change="updateConfig"
              >
              {{ vendor.name }}
            </label>
          </div>
        </div>
        <p class="form-help">Select vendors to prioritize (leave empty for no restrictions)</p>
      </div>

      <div class="form-group">
        <label class="form-label">Brand Preference</label>
        <input 
          v-model="localConfig.brand_preference" 
          type="text" 
          class="form-input"
          placeholder="Enter preferred brand name"
          @change="updateConfig"
        >
        <p class="form-help">Specify a preferred brand (leave empty for no brand restrictions)</p>
      </div>

      <div class="form-group">
        <label class="form-label">Maximum Price Multiplier</label>
        <input 
          v-model.number="localConfig.max_price_multiplier" 
          type="number" 
          step="0.1" 
          min="1.0"
          class="form-input"
          @change="updateConfig"
        >
        <p class="form-help">Maximum price increase allowed for preferred options (1.0 = no premium, 2.0 = 2x price)</p>
      </div>
    </div>

    <div v-if="showInheritance" class="inheritance-section">
      <h4>Configuration Inheritance</h4>
      <div class="inheritance-tree">
        <div class="inheritance-level" :class="{ active: inheritance?.system_config }">
          <span class="level-name">System Default</span>
          <span class="level-status">{{ inheritance?.system_config ? 'Active' : 'Inherited' }}</span>
        </div>
        <div class="inheritance-level" :class="{ active: inheritance?.order_config }">
          <span class="level-name">Order Level</span>
          <span class="level-status">{{ inheritance?.order_config ? 'Active' : 'Inherited' }}</span>
        </div>
        <div class="inheritance-level" :class="{ active: inheritance?.item_config }">
          <span class="level-name">Item Level</span>
          <span class="level-status">{{ inheritance?.item_config ? 'Active' : 'Inherited' }}</span>
        </div>
        <div class="inheritance-level" :class="{ active: inheritance?.order_item_config }">
          <span class="level-name">Order Item Level</span>
          <span class="level-status">{{ inheritance?.order_item_config ? 'Active' : 'Inherited' }}</span>
        </div>
      </div>
    </div>

    <div class="config-actions">
      <button class="btn btn-outline" @click="resetToDefault">
        Reset to Default
      </button>
      <button class="btn btn-primary" @click="saveConfig" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Configuration' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { VendorSelectionConfig, ConfigInheritance } from '../../stores/house-orders';

interface Props {
  config: VendorSelectionConfig;
  level: 'system' | 'order' | 'item' | 'order_item';
  levelId?: number;
  availableVendors?: Array<{ id: number; name: string }>;
  showInheritance?: boolean;
  inheritance?: ConfigInheritance;
  loading?: boolean;
}

interface Emits {
  (e: 'update:config', config: VendorSelectionConfig): void;
  (e: 'save', config: VendorSelectionConfig): void;
  (e: 'reset'): void;
}

const props = withDefaults(defineProps<Props>(), {
  availableVendors: () => [],
  showInheritance: false,
  loading: false
});

const emit = defineEmits<Emits>();

const localConfig = ref<VendorSelectionConfig>({ ...props.config });

const strategyDescriptions = {
  lowest_price: 'Select the vendor with the lowest price for each item',
  best_value: 'Balance price, quality, and delivery time for optimal value',
  preferred_vendor: 'Prioritize selected preferred vendors when available',
  delivery_optimization: 'Minimize delivery time and consolidate shipments'
};

const updateConfig = () => {
  emit('update:config', { ...localConfig.value });
};

const resetToDefault = () => {
  localConfig.value = {
    strategy: 'lowest_price',
    min_order_threshold: 0,
    delivery_priority: false,
    quality_preference: 'standard',
    organic_preference: 0.0,
    preferred_vendor_ids: [],
    brand_preference: '',
    max_price_multiplier: 1.0
  };
  updateConfig();
  emit('reset');
};

const saveConfig = () => {
  emit('save', { ...localConfig.value });
};

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig };
}, { deep: true });
</script>

<style scoped>
.vendor-selection-config {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.config-section {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-select,
.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-help {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-range {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  font-weight: 600;
  color: #374151;
  min-width: 40px;
  text-align: center;
}

.vendor-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
}

.vendor-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vendor-option label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.inheritance-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.inheritance-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inheritance-level {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.inheritance-level.active {
  background: #dbeafe;
  border-color: #3b82f6;
}

.level-name {
  font-weight: 500;
  color: #374151;
}

.level-status {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
}

.config-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  background: #3b82f6;
  border: 1px solid #3b82f6;
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
