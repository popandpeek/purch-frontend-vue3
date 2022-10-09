import { defineStore } from "pinia";
import json from "../../public/data/house-order-data.json"

export const useHouseOrderStore = defineStore({
  id: 'houseOrdersStore',
  state: () => ({
      orders: [],
  }),
  getters: {
    getOrders: (state) => {
      return state.orders
    },
    hasOrders: (state) => {
      return state.orders && state.orders.length > 0
    }
  },
  actions: {
    fetchOrderItems() {
      this.orders = json
    },
    setQuantity(payload) {
      console.log(payload.houseOrderId);
      console.log(payload.itemId);
      console.log(payload.updatedQuantity);

      //  First: get order-item
      const orderObj = this.orders.find((x) => x.id === payload.houseOrderId);
      //  Second: get list of items from order-item
      const items = orderObj.items;
      //  Third: get order-list-item from list of items
      const item = items.find((y) => y.id === payload.id);
      //  Fourth: set quantity
      item.quantity = payload.updatedQuantity;
    },
  },
})
