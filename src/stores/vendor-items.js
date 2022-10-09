import { defineStore } from "pinia";
import json from "../../public/data/vendor-item-data.json"

export const useVendorItemStore = defineStore({ 
  id: "vendorItemsStore",
  state: () => ({
    vendorItems: [],
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
    fetchVendorItems() {
      this.vendorItems = json
    }
  },
});
