import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import instance from '../http-common';

export interface GeneralSettings {
  company_name: string;
  currency: string;
  date_format: string;
  time_zone: string;
}

export interface InventorySettings {
  low_stock_threshold: number;
  auto_reorder: boolean;
  default_storage_location: string;
  count_frequency: string;
}

export interface OrderSettings {
  default_order_status: string;
  auto_approve_orders: boolean;
  order_approval_limit: number;
  default_vendor_id: number | null;
}

export interface NotificationSettings {
  email_notifications: boolean;
  low_stock_alerts: boolean;
  order_alerts: boolean;
  invoice_alerts: boolean;
}

export interface Settings {
  general: GeneralSettings;
  inventory: InventorySettings;
  orders: OrderSettings;
  notifications: NotificationSettings;
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = reactive<Settings>({
    general: {
      company_name: 'PURCH',
      currency: 'USD',
      date_format: 'MM/DD/YYYY',
      time_zone: 'America/New_York'
    },
    inventory: {
      low_stock_threshold: 20,
      auto_reorder: false,
      default_storage_location: 'Main Storage',
      count_frequency: 'monthly'
    },
    orders: {
      default_order_status: 'draft',
      auto_approve_orders: false,
      order_approval_limit: 500,
      default_vendor_id: null
    },
    notifications: {
      email_notifications: true,
      low_stock_alerts: true,
      order_alerts: true,
      invoice_alerts: true
    }
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchSettings = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await instance.get('/settings/');
      const data = response.data;
      
      // Update settings with API data
      Object.assign(settings, data);
      
      console.log('Settings loaded:', data);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load settings';
      console.error('Error loading settings:', err);
    } finally {
      loading.value = false;
    }
  };

  const updateSettings = async (updatedSettings: Partial<Settings>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await instance.put('/settings/', updatedSettings);
      const data = response.data;
      
      // Update settings with API response
      Object.assign(settings, data);
      
      console.log('Settings updated:', data);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update settings';
      console.error('Error updating settings:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const resetSettings = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await instance.post('/settings/reset');
      const data = response.data;
      
      // Update settings with default values
      Object.assign(settings, data);
      
      console.log('Settings reset to defaults:', data);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to reset settings';
      console.error('Error resetting settings:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Getters
  const getGeneralSettings = () => settings.general;
  const getInventorySettings = () => settings.inventory;
  const getOrderSettings = () => settings.orders;
  const getNotificationSettings = () => settings.notifications;

  return {
    // State
    settings,
    loading,
    error,
    
    // Actions
    fetchSettings,
    updateSettings,
    resetSettings,
    
    // Getters
    getGeneralSettings,
    getInventorySettings,
    getOrderSettings,
    getNotificationSettings
  };
});
