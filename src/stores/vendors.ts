import { defineStore } from "pinia";
import json from "../../public/data/vendor-data.json"
import { Vendor } from "@/api/model";

export const useVendorStore = defineStore({ 
  id: 'vendorsStore',
  state: () => ({
    vendors: [] as Vendor[],
    vendor: undefined as Vendor | undefined
  }),
  getters: {
    getVendors: (state) => {
      return state.vendors
    },
    hasVendors: (state) => { 
      return state.vendors && state.vendors.length > 0
    }
  },
  actions: {
    fetchVendors() {
      this.vendors = json
    },
    fetchVendor(vendorId: string) {
      this.vendor = json.find((vendor) => vendor.id === vendorId);
    }
  },
});
