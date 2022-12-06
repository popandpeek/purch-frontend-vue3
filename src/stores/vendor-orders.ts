import { defineStore } from "pinia";
import json from "../../public/data/vendor-order-data.json"
import { VendorOrder } from "@/api/model";
import axios from "../http-common";

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
    async fetchVendorOrders() {
      const response = await axios.get('/vendor_orders/')
      this.vendorOrders = response.data
    },
    async fetchVendorOrdersPerVendor(vendorId: number) {
      const response = await axios.get('/vendor_orders/' + vendorId)
      this.vendorOrders = response.data
    }
  },
});
