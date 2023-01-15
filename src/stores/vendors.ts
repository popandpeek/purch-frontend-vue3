import { defineStore } from "pinia";
import { Vendor } from "@/api/model";
import instance from "../http-common";

export const useVendorStore = defineStore({
  id: "vendorsStore",
  state: () => ({
    vendors: [] as Vendor[],
    vendorList: [] as Vendor[],
    vendor: undefined as Vendor | undefined,
  }),
  getters: {
    getVendors: (state) => {
      return state.vendors;
    },
    hasVendors: (state) => {
      return state.vendors && state.vendors.length > 0;
    },
  },
  actions: {
    async fetchVendors() {
      const response = await instance.get("/vendors/", {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      });
      this.vendors = response.data;
    },
    async fetchVendor(vendorId: string) {
      const response = await instance.get("/vendors/" + Number(vendorId), {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      });
      this.vendor = response.data;
    },
    async fetchVendorsList(vendor_ids: Array<number>) {
      const response = await instance.get("/vendors/list", {
        params: { vendor_ids },
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      });
      this.vendorList = response.data;
    },
  },
});
