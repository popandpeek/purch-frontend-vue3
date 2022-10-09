import { defineStore } from "pinia";
import json from "../../public/data/inventory-data.json"

export const useInventoriesStore = defineStore({ 
  id: 'inventoriesStore',
  state: () => ({
    storageLocations: [],
    inventories: [],
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
