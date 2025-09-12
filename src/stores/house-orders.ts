import { defineStore } from 'pinia'
import api from '../http-common'
import type { HouseOrder, HouseOrderItem } from '../api/model'

interface HouseOrderState {
  orders: HouseOrder[]
  currentOrder: HouseOrder | null
  loading: boolean
  error: string | null
}

export const useHouseOrderStore = defineStore('houseOrders', {
  state: (): HouseOrderState => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null
  }),

  getters: {
    // Get all house orders
    allOrders: (state) => state.orders,
    
    // Get orders by status
    getOrdersByStatus: (state) => (status: string) => 
      state.orders.filter(order => order.status === status),
    
    // Get draft orders
    draftOrders: (state) => 
      state.orders.filter(order => order.status === 'draft'),
    
    // Get processing orders
    processingOrders: (state) => 
      state.orders.filter(order => order.status === 'processing'),
    
    // Get completed orders
    completedOrders: (state) => 
      state.orders.filter(order => order.status === 'completed'),
    
    // Get order by ID
    getOrderById: (state) => (id: number) => 
      state.orders.find(order => order.id === id),
    
    // Get total estimated cost for all orders
    totalEstimatedCost: (state) => 
      state.orders.reduce((total, order) => total + (order.total_estimated_cost ?? 0), 0),
    
    // Get orders count by status
    ordersCountByStatus: (state) => {
      const counts = { draft: 0, processing: 0, completed: 0, cancelled: 0 }
      state.orders.forEach(order => {
        counts[order.status as keyof typeof counts]++
      })
      return counts
    }
  },

  actions: {
    // Fetch all house orders
    async fetchHouseOrders() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<HouseOrder[]>('/house-orders/')
        this.orders = response.data
        return true
      } catch (err: any) {
        this.error = 'Failed to fetch house orders: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return false
      } finally {
        this.loading = false
      }
    },

    // Fetch single house order by ID
    async fetchHouseOrderById(id: number) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<HouseOrder>(`/house-orders/${id}`)
        this.currentOrder = response.data
        
        // Update in orders array if it exists
        const index = this.orders.findIndex(order => order.id === id)
        if (index !== -1) {
          this.orders[index] = response.data
        } else {
          this.orders.push(response.data)
        }
        
        return response.data
      } catch (err: any) {
        this.error = 'Failed to fetch house order: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return null
      } finally {
        this.loading = false
      }
    },

    // Create new house order
    async createHouseOrder(orderData: Partial<HouseOrder>) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post<HouseOrder>('/house-orders/', orderData)
        this.orders.push(response.data)
        return response.data
      } catch (err: any) {
        this.error = 'Failed to create house order: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return null
      } finally {
        this.loading = false
      }
    },

    // Update house order
    async updateHouseOrder(id: number, orderData: Partial<HouseOrder>) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put<HouseOrder>(`/house-orders/${id}`, orderData)
        const index = this.orders.findIndex(order => order.id === id)
        if (index !== -1) {
          this.orders[index] = response.data
        }
        if (this.currentOrder?.id === id) {
          this.currentOrder = response.data
        }
        return response.data
      } catch (err: any) {
        this.error = 'Failed to update house order: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return null
      } finally {
        this.loading = false
      }
    },

    // Delete house order
    async deleteHouseOrder(id: number) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/house-orders/${id}`)
        this.orders = this.orders.filter(order => order.id !== id)
        if (this.currentOrder?.id === id) {
          this.currentOrder = null
        }
        return true
      } catch (err: any) {
        this.error = 'Failed to delete house order: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return false
      } finally {
        this.loading = false
      }
    },

    // Add item to house order
    async addOrderItem(orderId: number, itemData: Partial<HouseOrderItem>) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post<HouseOrderItem>(`/house-orders/${orderId}/items/`, itemData)
        
        // Update the order in our state
        const order = this.orders.find(o => o.id === orderId)
        if (order && order.items) {
          order.items.push(response.data)
          order.total_estimated_cost = this.calculateOrderTotal(order)
        }
        
        if (this.currentOrder?.id === orderId && this.currentOrder.items) {
          this.currentOrder.items.push(response.data)
          this.currentOrder.total_estimated_cost = this.calculateOrderTotal(this.currentOrder)
        }
        
        return response.data
      } catch (err: any) {
        this.error = 'Failed to add item to order: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return null
      } finally {
        this.loading = false
      }
    },

    // Update house order item
    async updateOrderItem(orderId: number, itemId: number, itemData: Partial<HouseOrderItem>) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put<HouseOrderItem>(`/house-orders/${orderId}/items/${itemId}`, itemData)
        
        // Update the order in our state
        const order = this.orders.find(o => o.id === orderId)
        if (order && order.items) {
          const itemIndex = order.items.findIndex(item => item.id === itemId)
          if (itemIndex !== -1) {
            order.items[itemIndex] = response.data
            order.total_estimated_cost = this.calculateOrderTotal(order)
          }
        }
        
        if (this.currentOrder?.id === orderId && this.currentOrder.items) {
          const itemIndex = this.currentOrder.items.findIndex(item => item.id === itemId)
          if (itemIndex !== -1) {
            this.currentOrder.items[itemIndex] = response.data
            this.currentOrder.total_estimated_cost = this.calculateOrderTotal(this.currentOrder)
          }
        }
        
        return response.data
      } catch (err: any) {
        this.error = 'Failed to update order item: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return null
      } finally {
        this.loading = false
      }
    },

    // Remove item from house order
    async removeOrderItem(orderId: number, itemId: number) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/house-orders/${orderId}/items/${itemId}`)
        
        // Update the order in our state
        const order = this.orders.find(o => o.id === orderId)
        if (order && order.items) {
          order.items = order.items.filter(item => item.id !== itemId)
          order.total_estimated_cost = this.calculateOrderTotal(order)
        }
        
        if (this.currentOrder?.id === orderId && this.currentOrder.items) {
          this.currentOrder.items = this.currentOrder.items.filter(item => item.id !== itemId)
          this.currentOrder.total_estimated_cost = this.calculateOrderTotal(this.currentOrder)
        }
        
        return true
      } catch (err: any) {
        this.error = 'Failed to remove order item: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return false
      } finally {
        this.loading = false
      }
    },

    // Generate vendor breakdown for house order
    async generateVendorBreakdown(orderId: number) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post<HouseOrder>(`/house-orders/${orderId}/breakdown`)
        
        // Update the order in our state
        const order = this.orders.find(o => o.id === orderId)
        if (order) {
          order.vendor_orders = response.data.vendor_orders
          order.status = response.data.status
        }
        
        if (this.currentOrder?.id === orderId) {
          this.currentOrder.vendor_orders = response.data.vendor_orders
          this.currentOrder.status = response.data.status
        }
        
        return response.data
      } catch (err: any) {
        this.error = 'Failed to generate vendor breakdown: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return null
      } finally {
        this.loading = false
      }
    },

    // Helper method to calculate order total
    calculateOrderTotal(order: HouseOrder): number {
      if (!order.items) return 0
      return order.items.reduce((total, item) => {
        const itemPrice = parseFloat(item.house_item.current_price_per_unit) ?? 0
        return total + (itemPrice * item.quantity)
      }, 0)
    },

    // Clear current order
    clearCurrentOrder() {
      this.currentOrder = null
    },

    // Set quantity for order item
    async setQuantity(data: { order_id: number; order_item_id: number; updated_quantity: string }) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put<HouseOrderItem>(
          `/house-orders/${data.order_id}/items/${data.order_item_id}`,
          { quantity: parseInt(data.updated_quantity) }
        )
        
        // Update the order in our state
        const order = this.orders.find(o => o.id === data.order_id)
        if (order && order.items) {
          const itemIndex = order.items.findIndex(item => item.id === data.order_item_id)
          if (itemIndex !== -1) {
            order.items[itemIndex] = response.data
            order.total_estimated_cost = this.calculateOrderTotal(order)
          }
        }
        
        if (this.currentOrder?.id === data.order_id && this.currentOrder.items) {
          const itemIndex = this.currentOrder.items.findIndex(item => item.id === data.order_item_id)
          if (itemIndex !== -1) {
            this.currentOrder.items[itemIndex] = response.data
            this.currentOrder.total_estimated_cost = this.calculateOrderTotal(this.currentOrder)
          }
        }
        
        return response.data
      } catch (err: any) {
        this.error = 'Failed to update quantity: ' + (err.response?.data?.detail || err.message)
        console.error(this.error, err)
        return null
      } finally {
        this.loading = false
      }
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})