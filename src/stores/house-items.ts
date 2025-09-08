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
      const response = await instance.get("/house_items/", {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      });
      this.items = response.data;
    },
  },
});
