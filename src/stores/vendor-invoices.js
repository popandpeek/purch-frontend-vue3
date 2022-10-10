import { defineStore } from "pinia";
import json from "../../public/data/vendor-invoice-data.json"

export const useInvoiceStore = defineStore({ 
  id: "invoicesStore",
  state: () => ({
    invoices: [],
  }),
  getters: {
    getInvoices: (state) => { 
      return state.invoices
    },
    hasInvoices: (state) => {
      return state.invoices && state.invoices.length > 0
    }
  },
  actions: {
    fetchVendorInvoices() {
      this.invoices = json
    },
    fetchVendorInvoicesPerVendor(vendorId) {
      this.invoices = json.filter((invoice) => invoice.vendorId === vendorId)
    }
  },
});
