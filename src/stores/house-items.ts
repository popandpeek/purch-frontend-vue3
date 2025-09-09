import { defineStore } from "pinia";
import type { HouseItem } from "@/api/model";
import instance from "../http-common";

export const useHouseItemsStore = defineStore({
  id: "houseItemsStore",
  state: () => ({
    items: [] as HouseItem[],
  }),
  getters: {
    getItems: (state) => {
      return state.items;
    },
    hasItems: (state) => {
      return state.items && state.items.length > 0;
    },
  },
  actions: {
    async fetchHouseItems() {
      // Check if this endpoint exists or needs to be updated
      const response = await instance.get("/house-items/");
      console.log('🔍 House items response:', response.data);
      console.log('🔍 First house item:', response.data[0]);
      console.log('🔍 First house item keys:', Object.keys(response.data[0]));
      this.items = response.data;
    },
  },
});