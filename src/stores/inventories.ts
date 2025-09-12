import { defineStore } from "pinia";
import instance from "../http-common";
import type { Inventory, InventoryItem, HouseInventoryUpdateItem } from "@/api/model";

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
      // Check if this endpoint exists or needs to be updated
      const response = await instance.get('/inventories/');
      console.log('Inventories response:', response.data);
      this.inventories = response.data;
    },
    async setQuantity(payload: HouseInventoryUpdateItem) {
      //  First: get HouseInventory
      const inventoryObj = this.inventories.find((x) => x.id === payload.inventory_id);

      //  Second: get list of HouseInventoryItem's from HouseInventory
      const items = inventoryObj?.house_inventory_items;

      //  Third: get HouseInventoryItem from list of HouseInventoryItem's
      const item = items?.find((y: InventoryItem) => y.id === payload.inventory_item_id);
      
      //  Fourth: send changes to DB
      if (item != null) {
        item.quantity = payload.updated_quantity;
        
        const request_options = {
          method: "PUT",
          headers: {
            "Authorization": 'Bearer ' + JSON.parse(localStorage.getItem("token")!),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price: item.price,
            measure: item.measure,
            unit: item.unit,
            quantity: item.quantity
          })
        };
        fetch(`${instance.defaults.baseURL}/inventory/inventory_item/` + item.id, request_options)
          .then(response => console.log(response));
      }
    },
  },
});
