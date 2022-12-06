import { defineStore } from "pinia";
import { VendorInvoice } from "@/api/model";
import axios from "../http-common";

export const useInvoiceStore = defineStore({ 
  id: "invoicesStore",
  state: () => ({
    vendor_invoices: [] as VendorInvoice[],
  }),
  getters: {
    getInvoices: (state) => { 
      return state.vendor_invoices
    },
    hasInvoices: (state) => {
      return state.vendor_invoices && state.vendor_invoices.length > 0
    }
  },
  actions: {
    async fetchAllVendorInvoices() {
      const response = await axios.get('/invoices/')
      this.vendor_invoices = response.data
    },
    async fetchVendorInvoicesPerVendor(vendorId: string) {
      const response = await axios.get('/invoices/' + Number(vendorId))
      this.vendor_invoices = response.data
    }
  },
});
