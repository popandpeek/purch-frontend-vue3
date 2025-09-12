import { defineStore } from "pinia";
import type { Vendor } from "@/api/model";
import instance from "../http-common";

export const useVendorStore = defineStore({
  id: "vendorsStore",
  state: () => ({
    vendors: [] as Vendor[],
    loading: false,
    error: null as string | null,
  }),
  getters: {
    getVendors: (state) => state.vendors,
    hasVendors: (state) => state.vendors && state.vendors.length > 0,
    getVendorById: (state) => (id: number) => state.vendors.find(vendor => vendor.id === id),
    getVendorByName: (state) => (name: string) => 
      state.vendors.find(vendor => vendor.name.toLowerCase().includes(name.toLowerCase())),
  },
  actions: {
    async fetchVendors() {
      this.loading = true;
      this.error = null;
      try {
        const response = await instance.get("/vendors/");
        this.vendors = response.data;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch vendors';
        console.error('Error fetching vendors:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchVendorById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await instance.get(`/vendors/${id}`);
        const vendor = response.data;
        const existingIndex = this.vendors.findIndex(v => v.id === id);
        if (existingIndex >= 0) {
          this.vendors[existingIndex] = vendor;
        } else {
          this.vendors.push(vendor);
        }
        return vendor;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch vendor';
        console.error('Error fetching vendor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
