import { defineStore } from "pinia";
import type { VendorInvoice } from "@/api/model";
import instance from "../http-common";

export const useInvoiceStore = defineStore({
  id: "invoicesStore",
  state: () => ({
    vendor_invoices: [] as VendorInvoice[],
  }),
  getters: {
    getInvoices: (state) => {
      return state.vendor_invoices;
    },
    hasInvoices: (state) => {
      return state.vendor_invoices && state.vendor_invoices.length > 0;
    },
  },
  actions: {
    async fetchAllVendorInvoices() {
      const response = await instance.get("/vendor-invoices/");
      console.log('Vendor invoices response:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('First invoice structure:', response.data[0]);
        console.log('First invoice keys:', Object.keys(response.data[0]));
        console.log('First invoice values:', Object.values(response.data[0]));
      }
      this.vendor_invoices = response.data;
    },
    async fetchVendorInvoicesPerVendor(vendorId: string) {
      const response = await instance.get("/vendor-invoices/" + Number(vendorId));
      this.vendor_invoices = response.data;
    },
  },
});
