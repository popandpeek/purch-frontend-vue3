import { defineStore } from "pinia";
import json from "../../public/data/house-order-data.json"
import { HouseOrder, HouseOrderUpdateItem } from "@/api/model";

export const useHouseOrderStore = defineStore({
  id: 'houseOrdersStore',
  state: () => ({
      orders: [] as HouseOrder[]
  }),
  getters: {
    getOrders: (state) => {
      return state.orders
    },
    hasOrders: (state) => {
      return state.orders && state.orders.length > 0
    }
  },
  actions: {
    fetchOrderItems() {
      this.orders = json
    },
    setQuantity(payload: HouseOrderUpdateItem) {
      //  First: get HouseOrder
      const orderObj = this.orders.find((x) => x.id === payload.id);

      //  Second: get list of HouseOrderItem's from HouseOrder
      const items = orderObj?.items;

      //  Third: get HouseOrderItem from list of HouseOrderItem's
      const item = items?.find((y) => y.itemId === payload.id);

      //  Fourth: set HouseOrderItem quantity
      if (item) {
        item.quantity = payload.updatedQuantity;
      } else {
        console.log("Item to update not found!")
      }
    },
  },
})
