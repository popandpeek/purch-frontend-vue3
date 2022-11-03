import { defineStore } from "pinia";
import json from "../../public/data/vendor-order-data.json"
import { VendorOrder } from "@/api/model";

export const useVendorOrderStore = defineStore({ 
  id: "vendorOrdersStore", 
  state: () => ({
    vendorOrders: [] as VendorOrder[],
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
    fetchVendorOrdersPerVendor(vendorId: string) {
      this.vendorOrders = json.filter((order) => order.vendor_id === vendorId)
    }
  },
});
