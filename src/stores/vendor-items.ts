import { defineStore } from "pinia";
import json from "../../public/data/vendor-item-data.json"
import { VendorItem } from "@/api/model";

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
    fetchVendorItems() {
      this.vendorItems = json
    }, 
    fetchVendorItemsPerVendor(vendorId: string) {
      this.vendorItems = json.filter((item) => item.vendor_id === vendorId)
    }
  },
});
