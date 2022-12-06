import { defineStore } from "pinia";
import json from "../../public/data/house-item-data.json"
import { HouseItem } from "@/api/model";
import axios from "../http-common";

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
    async fetchHouseItems() {
      const response = await axios.get('/house_items');
      this.items = response.data;
    }
  }
});
