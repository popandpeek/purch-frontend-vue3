import { defineStore } from "pinia";
import json from "../../public/data/vendor-item-data.json"
import { VendorItem } from "@/api/model";
import instance from "../http-common";

export const useVendorItemStore = defineStore({ 
  id: "vendorItemsStore",
  state: () => ({
    vendorItems: [] as VendorItem[],
  }),
  getters: {
    getItems: (state) => {
      return state.vendorItems
    },
    hasItems: (state) => {
      return state.vendorItems && state.vendorItems.length > 0
    }
  },
  actions: {
    async fetchAllVendorItems() {
      const response = await instance.get('/vendor_items/', {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      })
      this.vendorItems = response.data
    }
  },
});
