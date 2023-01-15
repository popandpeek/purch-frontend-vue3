import { defineStore } from "pinia";
import json from "../../public/data/vendor-order-data.json"
import { VendorOrder } from "@/api/model";
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
      const response = await instance.get('/vendor_orders/', {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      })
      this.vendorOrders = response.data
    },
    async fetchVendorOrdersPerVendor(vendorId: number) {
      const response = await instance.get('/vendor_orders/' + vendorId, {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      })
      this.vendorOrders = response.data
    }
  },
});
