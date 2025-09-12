<template>
  <div class="settings">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Settings</h1>
        <p>Manage your application preferences and configuration</p>
      </div>
    </div>

    <!-- Settings Tabs -->
    <div class="settings-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'general' }"
        @click="activeTab = 'general'"
      >
        General
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'inventory' }"
        @click="activeTab = 'inventory'"
      >
        Inventory
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'orders' }"
        @click="activeTab = 'orders'"
      >
        Orders
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'notifications' }"
        @click="activeTab = 'notifications'"
      >
        Notifications
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading settings...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="settingsStore.fetchSettings()">
        Retry
      </button>
    </div>

    <!-- Settings Content -->
    <div v-else class="settings-content">
      <!-- Success/Error Message -->
      <div v-if="saveMessage" class="message" :class="saveMessage.includes('success') ? 'success' : 'error'">
        {{ saveMessage }}
      </div>

      <!-- General Settings -->
      <div v-if="activeTab === 'general'" class="settings-section">
        <h3>General Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">Company Name</label>
            <input v-model="settings.general.company_name" type="text" class="setting-input">
          </div>
          <div class="setting-item">
            <label class="setting-label">Default Currency</label>
            <select v-model="settings.general.currency" class="setting-select">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">Date Format</label>
            <select v-model="settings.general.date_format" class="setting-select">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">Time Zone</label>
            <select v-model="settings.general.time_zone" class="setting-select">
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Inventory Settings -->
      <div v-if="activeTab === 'inventory'" class="settings-section">
        <h3>Inventory Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">Low Stock Threshold (%)</label>
            <input v-model="settings.inventory.low_stock_threshold" type="number" min="0" max="100" class="setting-input">
          </div>
          <div class="setting-item">
            <label class="setting-label">Auto-reorder Level</label>
            <div class="setting-checkbox">
              <input v-model="settings.inventory.auto_reorder" type="checkbox" id="autoReorder">
              <label for="autoReorder">Enable automatic reordering</label>
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">Default Storage Location</label>
            <input v-model="settings.inventory.default_storage_location" type="text" class="setting-input">
          </div>
          <div class="setting-item">
            <label class="setting-label">Inventory Count Frequency</label>
            <select v-model="settings.inventory.count_frequency" class="setting-select">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Order Settings -->
      <div v-if="activeTab === 'orders'" class="settings-section">
        <h3>Order Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">Default Order Status</label>
            <select v-model="settings.orders.default_order_status" class="setting-select">
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
          <div class="setting-item">
            <label class="setting-label">Auto-approve Orders</label>
            <div class="setting-checkbox">
              <input v-model="settings.orders.auto_approve_orders" type="checkbox" id="autoApproveOrders">
              <label for="autoApproveOrders">Automatically approve orders under $500</label>
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">Order Approval Limit ($)</label>
            <input v-model="settings.orders.order_approval_limit" type="number" min="0" class="setting-input">
          </div>
          <div class="setting-item">
            <label class="setting-label">Default Vendor</label>
            <select v-model="settings.orders.default_vendor_id" class="setting-select">
              <option :value="null">No default vendor</option>
              <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                {{ vendor.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div v-if="activeTab === 'notifications'" class="settings-section">
        <h3>Notification Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <label class="setting-label">Email Notifications</label>
            <div class="setting-checkbox">
              <input v-model="settings.notifications.email_notifications" type="checkbox" id="emailNotifications">
              <label for="emailNotifications">Enable email notifications</label>
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">Low Stock Alerts</label>
            <div class="setting-checkbox">
              <input v-model="settings.notifications.low_stock_alerts" type="checkbox" id="lowStockAlerts">
              <label for="lowStockAlerts">Send alerts when stock is low</label>
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">Order Alerts</label>
            <div class="setting-checkbox">
              <input v-model="settings.notifications.order_alerts" type="checkbox" id="orderAlerts">
              <label for="orderAlerts">Send alerts for new orders</label>
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">Invoice Alerts</label>
            <div class="setting-checkbox">
              <input v-model="settings.notifications.invoice_alerts" type="checkbox" id="invoiceAlerts">
              <label for="invoiceAlerts">Send alerts for overdue invoices</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div v-if="!loading && !error" class="settings-footer">
      <button 
        class="btn btn-primary" 
        @click="saveSettings"
        :disabled="saveLoading"
      >
        <span v-if="saveLoading" class="btn-icon">⏳</span>
        <span v-else class="btn-icon">💾</span>
        {{ saveLoading ? 'Saving...' : 'Save Settings' }}
      </button>
      <button 
        class="btn btn-outline" 
        @click="resetSettings"
        :disabled="resetLoading"
      >
        {{ resetLoading ? 'Resetting...' : 'Reset to Defaults' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVendorStore } from '../stores/vendors';
import { useSettingsStore } from '../stores/settings';
import type { Vendor } from '../api/model';

const vendorStore = useVendorStore();
const settingsStore = useSettingsStore();

// Reactive state
const activeTab = ref<'general' | 'inventory' | 'orders' | 'notifications'>('general');
const saveLoading = ref(false);
const resetLoading = ref(false);
const saveMessage = ref<string | null>(null);

// Computed properties
const vendors = computed(() => vendorStore.vendors);
const settings = computed(() => settingsStore.settings);
const loading = computed(() => settingsStore.loading);
const error = computed(() => settingsStore.error);

// Methods
const saveSettings = async () => {
  saveLoading.value = true;
  saveMessage.value = null;
  
  try {
    const success = await settingsStore.updateSettings(settings.value);
    if (success) {
      saveMessage.value = 'Settings saved successfully!';
      setTimeout(() => {
        saveMessage.value = null;
      }, 3000);
    } else {
      saveMessage.value = 'Failed to save settings. Please try again.';
    }
  } catch (error) {
    saveMessage.value = 'An error occurred while saving settings.';
  } finally {
    saveLoading.value = false;
  }
};

const resetSettings = async () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    resetLoading.value = true;
    saveMessage.value = null;
    
    try {
      const success = await settingsStore.resetSettings();
      if (success) {
        saveMessage.value = 'Settings reset to defaults successfully!';
        setTimeout(() => {
          saveMessage.value = null;
        }, 3000);
      } else {
        saveMessage.value = 'Failed to reset settings. Please try again.';
      }
    } catch (error) {
      saveMessage.value = 'An error occurred while resetting settings.';
    } finally {
      resetLoading.value = false;
    }
  }
};

// Lifecycle
onMounted(async () => {
  // Load settings and vendors
  await Promise.all([
    settingsStore.fetchSettings(),
    vendors.value.length === 0 ? vendorStore.fetchVendors() : Promise.resolve()
  ]);
});
</script>

<style scoped>
.settings {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 2rem;
}

.header-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.settings-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ecf0f1;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #7f8c8d;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #3d008d;
  background: #f8f9fa;
}

.tab-btn.active {
  color: #3d008d;
  border-bottom-color: #3d008d;
  background: #e8f4fd;
}

.tab-icon {
  font-size: 1.2rem;
}

.settings-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.settings-section h3 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.setting-input,
.setting-select {
  padding: 0.75rem 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.setting-input:focus,
.setting-select:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.setting-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #3d008d;
}

.setting-checkbox label {
  font-size: 0.9rem;
  color: #2c3e50;
  cursor: pointer;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #ecf0f1;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover {
  background: #2a0063;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-icon {
  font-size: 1rem;
}

/* Loading and Error States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .settings {
    padding: 1rem;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
