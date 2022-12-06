import { defineStore } from "pinia";
import { Vendor } from "@/api/model";
import axios from "../http-common";


export const useVendorStore = defineStore({ 
  id: 'vendorsStore',
  state: () => ({
    vendors: [] as Vendor[],
    vendorList: [] as Vendor[],
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
    async fetchVendors() {
      const response = await axios.get('/vendors')
      this.vendors = response.data
    },
    async fetchVendor(vendorId: string) {
      const response = await axios.get('/vendors/' + Number(vendorId))
      this.vendor = response.data;
    },
    async fetchVendorsList(vendor_ids: Array<number>) {
        const response = await axios.get('/vendors/list', { params: {vendor_ids} })
        this.vendorList = response.data
    }
  },
});
