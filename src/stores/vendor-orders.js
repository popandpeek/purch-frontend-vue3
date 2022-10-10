import { defineStore } from "pinia";
import json from "../../public/data/vendor-order-data.json"

export const useVendorOrderStore = defineStore({ 
  id: "vendorOrdersStore", 
  state: () => ({
    vendorOrders: [],
  }),
  getters: {
    getOrders: (state) => {
      return state.vendorOrders
    },
    hasOrders: (state) => {
      return state.vendorOrders && state.vendorOrders.length > 0
    }
  },
  actions: {
    fetchVendorOrders() {
      this.vendorOrders = json
    },
    fetchVendorOrdersPerVendor(vendorId) {
      this.vendorOrders = json.filter((order) => order.vendorId === vendorId)
    }
  },
});
