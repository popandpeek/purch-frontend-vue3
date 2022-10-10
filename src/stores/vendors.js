import { defineStore } from "pinia";
import json from "../../public/data/vendor-data.json"

export const useVendorStore = defineStore({ 
  id: 'vendorsStore',
  state: () => ({
    vendors: [],
    vendor: null,
    loading: false,
    error: null
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
    fetchVendor(vendorId) {
      this.vendor = json.find((vendor) => vendor.id === vendorId)
    }
  },
});
