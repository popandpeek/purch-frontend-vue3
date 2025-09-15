<template>
  <div class="order-details">
    <!-- Order Header -->
    <div class="order-header">
      <div class="order-info">
        <h2>Order #{{ order.id }}</h2>
        <div class="order-meta">
          <span class="order-date">{{ formatDate(order.created_at) }}</span>
          <span class="order-status" :class="order.status">{{ order.status }}</span>
        </div>
      </div>
      <div class="order-actions">
        <BaseButton variant="secondary" @click="editOrder">
          Edit
        </BaseButton>
        <BaseButton variant="secondary" @click="configureOrder">
          Configure
        </BaseButton>
        <BaseButton variant="secondary" @click="generateVendorOrders">
          Generate Vendor Orders
        </BaseButton>
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
              <BaseButton variant="ghost" size="sm" @click="configureItem(item)">
                Configure
              </BaseButton>
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
        </div>
      </div>
    </div>

    <!-- Generated Vendor Orders -->
    <div v-if="order.vendor_orders.length > 0" class="vendor-orders-section">
      <h3>Generated Vendor Orders</h3>
      <div class="vendor-orders-list">
        <div v-for="vendorOrder in order.vendor_orders" :key="vendorOrder.id" class="vendor-order-card">
          <div class="vendor-order-header">
            <h4>{{ vendorOrder.vendor?.name || 'Unknown Vendor' }}</h4>
            <span class="vendor-order-status" :class="vendorOrder.status">
              {{ vendorOrder.status }}
            </span>
          </div>
          <div class="vendor-order-details">
            <div class="detail-item">
              <span class="label">Total Amount:</span>
              <span class="value">${{ parseFloat(vendorOrder.total_amount).toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Items:</span>
              <span class="value">{{ vendorOrder.items?.length || 0 }}</span>
            </div>
          </div>
          <div class="vendor-order-actions">
            <BaseButton variant="ghost" size="sm" @click="viewVendorOrder(vendorOrder)">
              View Details
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="editVendorOrder(vendorOrder)">
              Edit Order
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Modals -->
    <div v-if="showOrderConfigModal" class="modal-overlay" @click="closeOrderConfigModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Configure Order #{{ order.id }}</h3>
          <BaseButton variant="ghost" @click="closeOrderConfigModal">
            Close
          </BaseButton>
        </div>
        <div class="modal-body">
          <div class="order-config">
            <h4>Order Configuration</h4>
            <p class="config-description">
              Configure vendor selection preferences for this specific order.
              These settings will override system defaults and apply to all items in this order.
            </p>
            
            <div class="config-section">
              <h5>Order-Specific Strategy</h5>
              <div class="config-field">
                <label>Selection Strategy</label>
                <select v-model="orderConfig.strategy">
                  <option value="lowest_price">Lowest Price</option>
                  <option value="best_value">Best Value</option>
                  <option value="preferred_vendor">Preferred Vendor</option>
                  <option value="delivery_optimization">Delivery Optimization</option>
                </select>
                <p class="field-description">Strategy used for all items in this order</p>
              </div>
            </div>

            <div class="config-section">
              <h5>Order-Wide Preferences</h5>
              
              <div class="config-field">
                <label>
                  <input 
                    type="checkbox" 
                    v-model="orderConfig.organic_preference"
                  />
                  Prefer Organic Products
                </label>
                <p class="field-description">When enabled, organic products will be preferred for all items in this order</p>
              </div>
              
              <div class="config-field">
                <label>
                  <input 
                    type="checkbox" 
                    v-model="orderConfig.delivery_priority"
                  />
                  Prioritize Fast Delivery
                </label>
                <p class="field-description">When enabled, faster delivery options will be preferred over cost savings</p>
              </div>
            </div>

            <div class="config-section">
              <h5>Order Constraints</h5>
              <div class="config-field">
                <label>Preferred Vendors for Entire Order</label>
                <div class="checkbox-group">
                  <label v-for="vendor in availableVendors" :key="vendor.id" class="checkbox-item">
                    <input 
                      type="checkbox" 
                      :value="vendor.id" 
                      v-model="orderConfig.preferred_vendor_ids"
                    />
                    {{ vendor.name }}
                  </label>
                </div>
                <p class="field-description">Select preferred vendors for all items in this order</p>
              </div>
              
              <div class="config-field">
                <label>Brand Preference</label>
                <input 
                  type="text" 
                  v-model="orderConfig.brand_preference"
                  placeholder="e.g., Heinz, Generic, etc."
                />
                <p class="field-description">Preferred brand for all items in this order (optional)</p>
              </div>
              
              <div class="config-field">
                <label>Minimum Order Threshold</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  v-model="orderConfig.min_order_threshold"
                />
                <p class="field-description">Minimum order amount for this order</p>
              </div>
              
              <div class="config-field">
                <label>Maximum Price Multiplier</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5" 
                  step="0.1" 
                  v-model="orderConfig.max_price_multiplier"
                />
                <p class="field-description">Maximum price multiplier for this order (1.0 = no limit)</p>
              </div>
            </div>

            <div class="config-actions">
              <BaseButton variant="primary" @click="saveOrderConfig" :loading="configSaving">
                Save Order Configuration
              </BaseButton>
              <BaseButton variant="secondary" @click="resetOrderConfig">
                Reset to Defaults
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showItemConfigModal && selectedItem" class="modal-overlay" @click="closeItemConfigModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Configure Item #{{ selectedItem.house_item_id }}</h3>
          <BaseButton variant="ghost" @click="closeItemConfigModal">
            Close
          </BaseButton>
        </div>
        <div class="modal-body">
          <div class="order-item-config">
            <h4>Order Item Override</h4>
            <p class="config-description">
              Override vendor selection preferences for this specific item within this order.
              These settings will override all higher-level configurations for this item only.
            </p>
            
            <div class="config-section">
              <h5>Strategy Override</h5>
              <div class="config-field">
                <label>Override Strategy</label>
                <select v-model="itemConfig.strategy">
                  <option value="">Use inherited strategy</option>
                  <option value="lowest_price">Lowest Price</option>
                  <option value="best_value">Best Value</option>
                  <option value="preferred_vendor">Preferred Vendor</option>
                  <option value="delivery_optimization">Delivery Optimization</option>
                </select>
                <p class="field-description">Override the strategy for this item only</p>
              </div>
            </div>

            <div class="config-section">
              <h5>Vendor & Brand Override</h5>
              <div class="config-field">
                <label>Override Preferred Vendors</label>
                <div class="checkbox-group">
                  <label v-for="vendor in availableVendors" :key="vendor.id" class="checkbox-item">
                    <input 
                      type="checkbox" 
                      :value="vendor.id" 
                      v-model="itemConfig.preferred_vendor_ids"
                    />
                    {{ vendor.name }}
                  </label>
                </div>
                <p class="field-description">Override preferred vendors for this specific item</p>
              </div>
              
              <div class="config-field">
                <label>Override Brand Preference</label>
                <input 
                  type="text" 
                  v-model="itemConfig.brand_preference"
                  placeholder="e.g., Heinz, Generic, etc."
                />
                <p class="field-description">Override brand preference for this item only</p>
              </div>
            </div>

            <div class="config-section">
              <h5>Quality & Delivery Override</h5>
              
              <div class="config-field">
                <label>
                  <input 
                    type="checkbox" 
                    v-model="itemConfig.organic_preference"
                  />
                  Override Organic Preference
                </label>
                <p class="field-description">Override organic preference for this specific item</p>
              </div>
              
              <div class="config-field">
                <label>
                  <input 
                    type="checkbox" 
                    v-model="itemConfig.delivery_priority"
                  />
                  Override Delivery Priority
                </label>
                <p class="field-description">Override delivery priority for this item only</p>
      </div>
    </div>

            <div class="config-actions">
              <BaseButton variant="primary" @click="saveItemConfig" :loading="configSaving">
                Save Item Override
              </BaseButton>
              <BaseButton variant="secondary" @click="resetItemConfig">
                Clear Override
              </BaseButton>
            </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHouseOrdersStore } from '../../stores/house-orders';
import { useVendorStore } from '../../stores/vendors';
import BaseButton from '../ui/BaseButton.vue';
import type { HouseOrder, ConfigInheritance, HouseOrderItem } from '../../stores/house-orders';

interface Props {
  order: HouseOrder;
}

const props = defineProps<Props>();

const router = useRouter();
const houseOrderStore = useHouseOrdersStore();
const vendorStore = useVendorStore();

// Reactive state
const showOrderConfigModal = ref(false);
const showItemConfigModal = ref(false);
const selectedItem = ref<HouseOrderItem | null>(null);
const configSaving = ref(false);

// Configuration state
const orderConfig = ref({
  strategy: 'lowest_price',
  organic_preference: false,
  delivery_priority: false,
  min_order_threshold: 0,
  preferred_vendor_ids: [],
  brand_preference: '',
  max_price_multiplier: 1.0
});

const itemConfig = ref({
  strategy: '',
  organic_preference: false,
  preferred_vendor_ids: [],
  brand_preference: '',
  min_order_threshold: 0,
  delivery_priority: false,
  max_price_multiplier: 1.0
});

const configInheritance = ref<ConfigInheritance | null>(null);
const itemConfigInheritance = ref<ConfigInheritance | null>(null);

const availableVendors = computed(() => 
  vendorStore.vendors.map(vendor => ({
    id: vendor.id,
    name: vendor.name
  }))
);

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const editOrder = () => {
  router.push(`/orders/house/${props.order.id}/edit`);
};

const configureOrder = async () => {
  showOrderConfigModal.value = true;
  
  // TODO: Load configuration for this order
  // try {
  //   orderConfig.value = await houseOrderStore.getVendorSelectionConfig('order', props.order.id);
  //   configInheritance.value = await houseOrderStore.getConfigInheritance(props.order.id);
  // } catch (error) {
  //   console.error('Failed to load order configuration:', error);
  // }
};

const configureItem = async (item: HouseOrderItem) => {
  selectedItem.value = item;
  showItemConfigModal.value = true;
  
  // TODO: Load configuration for this item
  // try {
  //   itemConfig.value = await houseOrderStore.getVendorSelectionConfig('order_item', item.id);
  //   itemConfigInheritance.value = await houseOrderStore.getConfigInheritance(item.id);
  // } catch (error) {
  //   console.error('Failed to load item configuration:', error);
  // }
};

const generateVendorOrders = async () => {
  try {
    await houseOrderStore.generateVendorBreakdown(props.order.id);
    // Refresh the order data
    await houseOrderStore.fetchOrders();
  } catch (error) {
    console.error('Failed to generate vendor orders:', error);
  }
};

const viewVendorOrder = (vendorOrder: any) => {
  router.push(`/orders/vendor/${vendorOrder.id}`);
};

const editVendorOrder = (vendorOrder: any) => {
  router.push(`/orders/vendor/${vendorOrder.id}/edit`);
};

// Modal handlers
const closeOrderConfigModal = () => {
  showOrderConfigModal.value = false;
  configInheritance.value = null;
};

const closeItemConfigModal = () => {
  showItemConfigModal.value = false;
  selectedItem.value = null;
  itemConfigInheritance.value = null;
};

// Configuration handlers
const saveOrderConfig = async () => {
  configSaving.value = true;
  try {
    // TODO: Implement order configuration save API
    // await houseOrderStore.updateVendorSelectionConfig('order', props.order.id, orderConfig.value);
    showOrderConfigModal.value = false;
  } catch (error) {
    console.error('Failed to save order configuration:', error);
  } finally {
    configSaving.value = false;
  }
};

const resetOrderConfig = () => {
  orderConfig.value = {
    strategy: 'lowest_price',
    organic_preference: false,
    delivery_priority: false,
    min_order_threshold: 0,
    preferred_vendor_ids: [],
    brand_preference: '',
    max_price_multiplier: 1.0
  };
};

const saveItemConfig = async () => {
  if (!selectedItem.value) return;
  
  configSaving.value = true;
  try {
    // TODO: Implement order item configuration save API
    // await houseOrderStore.updateVendorSelectionConfig('order_item', selectedItem.value.id, itemConfig.value);
    showItemConfigModal.value = false;
  } catch (error) {
    console.error('Failed to save item configuration:', error);
  } finally {
    configSaving.value = false;
  }
};

const resetItemConfig = () => {
  itemConfig.value = {
    strategy: '',
    organic_preference: false,
    preferred_vendor_ids: [],
    brand_preference: '',
    min_order_threshold: 0,
    delivery_priority: false,
    max_price_multiplier: 1.0
  };
};

// Lifecycle
onMounted(async () => {
  await vendorStore.fetchVendors();
});
</script>

<style scoped>
.order-details {
  padding: 1.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.order-info h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.order-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.order-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.processing {
  background: #cce5ff;
  color: #004085;
}

.order-status.completed {
  background: #d4edda;
  color: #155724;
}

.order-actions {
  display: flex;
  gap: 0.75rem;
}

.order-items-section,
.vendor-orders-section {
  margin-bottom: 2rem;
}

.order-items-section h3,
.vendor-orders-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.items-list,
.vendor-orders-list {
  display: grid;
  gap: 1rem;
}

.item-card,
.vendor-order-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.item-header,
.vendor-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.item-header h4,
.vendor-order-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
}

.item-actions,
.vendor-order-actions {
  display: flex;
  gap: 0.5rem;
}

.item-details,
.vendor-order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.detail-item .value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.priority {
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority.low {
  background: #d4edda;
  color: #155724;
}

.priority.medium {
  background: #fff3cd;
  color: #856404;
}

.priority.high {
  background: #f8d7da;
  color: #721c24;
}

.vendor-order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.vendor-order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.vendor-order-status.processing {
  background: #cce5ff;
  color: #004085;
}

.vendor-order-status.completed {
  background: #d4edda;
  color: #155724;
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
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 1000px;
}

.modal-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .order-actions {
    justify-content: stretch;
  }
  
  .item-details,
  .vendor-order-details {
    grid-template-columns: 1fr;
  }
}

/* Configuration Styles */
.order-config,
.order-item-config {
  margin-bottom: 1rem;
}

.order-config h4,
.order-item-config h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
}

.config-description {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Order Configuration Styles */
.order-config,
.order-item-config {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.order-config h4,
.order-item-config h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.config-section {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.config-section h5 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
}

.config-field {
  margin-bottom: 1rem;
}

.config-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.config-field select,
.config-field input[type="text"],
.config-field input[type="number"],
.config-field input[type="range"],
.config-field textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.config-field input[type="range"] {
  padding: 0;
  height: 6px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.config-field input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

.range-value {
  display: inline-block;
  margin-left: 0.5rem;
  font-weight: 600;
  color: #007bff;
  min-width: 30px;
}

.field-description {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

.config-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
    gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: normal;
  cursor: pointer;
  }

.checkbox-item input[type="checkbox"] {
  width: auto;
  margin: 0;
}
</style>