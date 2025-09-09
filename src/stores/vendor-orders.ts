import { defineStore } from "pinia";
import type { VendorOrder } from "@/api/model";
import instance from "../http-common";

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
      const response = await instance.get('/vendor-orders/');
      console.log('🔍 Vendor orders response:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('🔍 First order structure:', response.data[0]);
        console.log('🔍 First order keys:', Object.keys(response.data[0]));
        console.log('🔍 First order values:', Object.values(response.data[0]));
      }
      this.vendorOrders = response.data;
    },
    async fetchVendorOrdersPerVendor(vendorId: number) {
      const response = await instance.get('/vendor-orders/' + vendorId);
      this.vendorOrders = response.data;
    }
  },
});
