import { defineStore } from "pinia";
import json from "../../public/data/house-item-data.json"
import { HouseItem } from "@/api/model";

export const useHouseItemsStore = defineStore({
  id: "houseItemsStore",
  state: () => ({
    items: [] as HouseItem[]
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
    fetchHouseItems() {
      this.items = json
    }
  }
});
