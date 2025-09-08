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
      const response = await instance.get("/invoices/", {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      });
      this.vendor_invoices = response.data;
    },
    async fetchVendorInvoicesPerVendor(vendorId: string) {
      const response = await instance.get("/invoices/" + Number(vendorId), {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      });
      this.vendor_invoices = response.data;
    },
  },
});
