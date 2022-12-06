import { defineStore } from "pinia";
import axios from "../http-common";
import { Inventory, HouseInventoryUpdateItem } from "@/api/model";

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
    async fetchInventories() {
      const response = await axios.get('/inventory/');
      this.inventories = response.data;
    },
    async setQuantity(payload: HouseInventoryUpdateItem) {
      //  First: get HouseInventory
      const inventoryObj = this.inventories.find((x) => x.id === payload.inventory_id);

      //  Second: get list of HouseInventoryItem's from HouseInventory
      const items = inventoryObj?.house_inventory_items;

      //  Third: get HouseInventoryItem from list of HouseInventoryItem's
      const item = items?.find((y) => y.id === payload.inventory_item_id);
      
      //  Fourth: send changes to DB
      if (item != null) {
        item.quantity = payload.updated_quantity;
        
        const request_options = {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            price: item.price,
            measure_unit: item.measure_unit,
            quantity: item.quantity
          })
        };
        fetch("http://0.0.0.0:8007/inventory/inventory_item/" + item.id, request_options)
          .then(response => console.log(response));
      }
    },
  },
});
