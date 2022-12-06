import { defineStore } from "pinia";
import json from "../../public/data/vendor-item-data.json"
import { VendorItem } from "@/api/model";
import axios from "../http-common";

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
      const response = await axios.get('/vendor_items')
      this.vendorItems = response.data
    }
  },
});
