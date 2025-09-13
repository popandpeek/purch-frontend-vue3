import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import instance from '@/http-common';

export interface HouseOrderItem {
  id?: number;
  house_item_id: number;
  quantity: number;
  priority: 'low' | 'normal' | 'high';
  vendor_selection_config?: VendorSelectionConfig;
}

export interface HouseOrder {
  id: number;
  date: string;
  status: 'draft' | 'submitted' | 'processing' | 'completed';
  total_estimated_cost: number;
  notes: string;
  created_at: string;
  updated_at: string;
  items: HouseOrderItem[];
  vendor_orders: VendorOrder[];
  vendor_selection_config?: VendorSelectionConfig;
}

export interface VendorOrder {
  id: number;
  house_order_id: number | null;
  vendor_id: number;
  date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  notes: string;
  submitted: boolean;
  created_at: string;
  updated_at: string;
  items: VendorOrderItem[];
  vendor: {
    id: number;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
  };
}

export interface VendorOrderItem {
  id: number;
  house_item_id: number;
  house_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  vendor_item_id: number;
  vendor_item_name: string;
}


export interface OrderSubmissionResult {
  message: string;
  vendor_orders_created: number;
  house_order_id: number;
  status: string;
}


export interface VendorItem {
  id: number;
  vendor_id: number;
  vendor_name: string;
  product_name: string;
  brand: string;
  category: string;
  case_size: number;
  pack_size: number;
  pack_unit: string;
  price_per_case: number;
  price_per_unit: number;
  is_available: boolean;
  house_item_id: number;
}

export interface SelectionReason {
  primary_factor: string;
  price_difference: number;
  delivery_advantage: number;
  quality_rating: number;
  consolidation_benefit: number;
}

export interface VendorSelectionConfig {
  strategy: 'lowest_price' | 'best_value' | 'preferred_vendor' | 'delivery_optimization';
  min_order_threshold: number;
  delivery_priority: boolean;
  quality_preference: 'premium' | 'standard' | 'budget';
  organic_preference: number; // 0.0 to 1.0
  preferred_vendor_ids: number[];
  brand_preference: string;
  max_price_multiplier: number;
}

export interface VendorSelection {
  vendor_item: VendorItem;
  selection_reason: SelectionReason;
  cost_savings: number;
  alternatives: VendorItem[];
}

export interface ConfigInheritance {
  system_config: VendorSelectionConfig;
  order_config?: VendorSelectionConfig;
  item_config?: VendorSelectionConfig;
  order_item_config?: VendorSelectionConfig;
  resolved_config: VendorSelectionConfig;
}

export const useHouseOrdersStore = defineStore('houseOrders', () => {
  // State
  const orders = ref<HouseOrder[]>([]);
  const currentOrder = ref<HouseOrder | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const draftOrders = computed(() => 
    orders.value.filter(order => order.status === 'draft')
  );
  
  const submittedOrders = computed(() => 
    orders.value.filter(order => order.status === 'submitted')
  );
  
  const processingOrders = computed(() => 
    orders.value.filter(order => order.status === 'processing')
  );
  
  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'completed')
  );

  const totalOrders = computed(() => orders.value.length);
  const totalEstimatedCost = computed(() => 
    orders.value.reduce((sum, order) => sum + order.total_estimated_cost, 0)
  );

  // Actions
  const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.get('/house-orders/');
      // Transform the data to match our interface
      orders.value = response.data.map((order: any) => transformOrderData(order));
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch orders';
      console.error('Error fetching orders:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchOrderById = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.get(`/house-orders/${id}`);
      currentOrder.value = transformOrderData(response.data);
      return currentOrder.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch order';
      console.error('Error fetching order:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createOrder = async (orderData: Partial<HouseOrder>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.post('/house-orders/', orderData);
      const newOrder = response.data;
      orders.value.unshift(newOrder);
      currentOrder.value = newOrder;
      return newOrder;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create order';
      console.error('Error creating order:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateOrder = async (id: number, orderData: Partial<HouseOrder>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.put(`/house-orders/${id}`, orderData);
      const updatedOrder = response.data;
      const index = orders.value.findIndex(order => order.id === id);
      if (index !== -1) {
        orders.value[index] = updatedOrder;
      }
      if (currentOrder.value?.id === id) {
        currentOrder.value = updatedOrder;
      }
      return updatedOrder;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update order';
      console.error('Error updating order:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteOrder = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
      await instance.delete(`/house-orders/${id}`);
      orders.value = orders.value.filter(order => order.id !== id);
      if (currentOrder.value?.id === id) {
        currentOrder.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete order';
      console.error('Error deleting order:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const submitOrder = async (id: number): Promise<OrderSubmissionResult> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.post(`/house-orders/${id}/submit`);
      const result = response.data;
      
      // Update order status
      const order = orders.value.find(o => o.id === id);
      if (order) {
        order.status = 'submitted';
      }
      if (currentOrder.value?.id === id) {
        currentOrder.value.status = 'submitted';
      }
      
      return result;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to submit order';
      console.error('Error submitting order:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Order Items Management
  const addOrderItem = async (orderId: number, itemData: Partial<HouseOrderItem>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.post(`/house-orders/${orderId}/items/`, itemData);
      const newItem = response.data;
      
      // Update local state
      const order = orders.value.find(o => o.id === orderId);
      if (order) {
        order.items.push(newItem);
        // Recalculate total cost
        order.total_estimated_cost = calculateOrderTotal();
      }
      if (currentOrder.value?.id === orderId) {
        currentOrder.value.items.push(newItem);
        currentOrder.value.total_estimated_cost = calculateOrderTotal();
      }
      
      return newItem;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add item to order';
      console.error('Error adding order item:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateOrderItem = async (orderId: number, itemId: number, itemData: Partial<HouseOrderItem>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.put(`/house-orders/${orderId}/items/${itemId}`, itemData);
      const updatedItem = response.data;
      
      // Update local state
      const order = orders.value.find(o => o.id === orderId);
      if (order) {
        const itemIndex = order.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          order.items[itemIndex] = updatedItem;
          order.total_estimated_cost = calculateOrderTotal();
        }
      }
      if (currentOrder.value?.id === orderId) {
        const itemIndex = currentOrder.value.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          currentOrder.value.items[itemIndex] = updatedItem;
          currentOrder.value.total_estimated_cost = calculateOrderTotal();
        }
      }
      
      return updatedItem;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update order item';
      console.error('Error updating order item:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removeOrderItem = async (orderId: number, itemId: number) => {
    loading.value = true;
    error.value = null;
    try {
      await instance.delete(`/house-orders/${orderId}/items/${itemId}`);
      
      // Update local state
      const order = orders.value.find(o => o.id === orderId);
      if (order) {
        order.items = order.items.filter(item => item.id !== itemId);
        order.total_estimated_cost = calculateOrderTotal();
      }
      if (currentOrder.value?.id === orderId) {
        currentOrder.value.items = currentOrder.value.items.filter(item => item.id !== itemId);
        currentOrder.value.total_estimated_cost = calculateOrderTotal();
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove order item';
      console.error('Error removing order item:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Helper functions
  const transformOrderData = (order: any): HouseOrder => {
    const id = order.id || order[0];
    if (!id) {
      throw new Error('Order ID is required');
    }
    
    return {
      id: Number(id),
      date: order.date || order[1],
      status: order.status || order[2],
      total_estimated_cost: parseFloat(order.total_estimated_cost || order.total_amount || order[3] || '0'),
      notes: order.notes || order[4] || '',
      created_at: order.created_at || order[6],
      updated_at: order.updated_at || order[7],
      items: order.items || order[8] || [],
      vendor_orders: order.vendor_orders || order[9] || [],
      vendor_selection_config: order.vendor_selection_config || order[10] || getDefaultVendorSelectionConfig()
    };
  };

  const calculateOrderTotal = (): number => {
    // This would need to be calculated based on house item prices
    // For now, return 0 as we don't have house item pricing in the store
    return 0;
  };

  const clearError = () => {
    error.value = null;
  };

  const setCurrentOrder = (order: HouseOrder | null) => {
    currentOrder.value = order;
  };

  // Vendor Selection Methods
  const getVendorSelections = async (orderId: number): Promise<VendorSelection[]> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.get(`/house-orders/${orderId}/vendor-selections`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch vendor selections';
      console.error('Error fetching vendor selections:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const overrideVendorSelection = async (orderItemId: number, vendorItemId: number) => {
    loading.value = true;
    error.value = null;
    try {
      await instance.post(`/house-orders/items/${orderItemId}/override-vendor-selection`, {
        vendor_item_id: vendorItemId
      });
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to override vendor selection';
      console.error('Error overriding vendor selection:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getConfigInheritance = async (orderItemId: number): Promise<ConfigInheritance> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await instance.get(`/house-orders/items/${orderItemId}/config-inheritance`);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch config inheritance';
      console.error('Error fetching config inheritance:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateVendorSelectionConfig = async (
    level: 'system' | 'order' | 'item' | 'order_item',
    id: number,
    config: VendorSelectionConfig
  ) => {
    loading.value = true;
    error.value = null;
    try {
      await instance.put(`/vendor-selection-config/${level}/${id}`, config);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update vendor selection config';
      console.error('Error updating vendor selection config:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getDefaultVendorSelectionConfig = (): VendorSelectionConfig => {
    return {
      strategy: 'lowest_price',
      min_order_threshold: 0,
      delivery_priority: false,
      quality_preference: 'standard',
      organic_preference: 0.0,
      preferred_vendor_ids: [],
      brand_preference: '',
      max_price_multiplier: 1.0
    };
  };

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    
    // Getters
    draftOrders,
    submittedOrders,
    processingOrders,
    completedOrders,
    totalOrders,
    totalEstimatedCost,
    
    // Actions
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    submitOrder,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    clearError,
    setCurrentOrder,
    
    // Vendor Selection Actions
    getVendorSelections,
    overrideVendorSelection,
    getConfigInheritance,
    updateVendorSelectionConfig,
    getDefaultVendorSelectionConfig
  };
});