import { defineStore } from "pinia";
import json from "../../public/data/inventory-data.json"
import { Inventory } from "@/api/model";

export const useInventoriesStore = defineStore({ 
  id: 'inventoriesStore',
  state: () => ({
    inventories: [] as Inventory[],
  }),
  getters: {
    getInventories: (state) => {
      return state.inventories;
    },
    hasInventories: (state) => {
      return state.inventories && state.inventories.length > 0
    },
  },
  actions: { 
    fetchInventories() {
      this.inventories = json
    }
  },
});
