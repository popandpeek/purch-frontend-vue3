import { defineStore } from "pinia";
import json from "../../public/data/vendor-invoice-data.json"
import { VendorInvoice } from "@/api/model";

export const useInvoiceStore = defineStore({ 
  id: "invoicesStore",
  state: () => ({
    invoices: [] as VendorInvoice[],
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
    fetchVendorInvoicesPerVendor(vendorId: string) {
      this.invoices = json.filter((invoice) => invoice.vendor_id === vendorId)
    }
  },
});
