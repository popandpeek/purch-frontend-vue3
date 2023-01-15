import { defineStore } from "pinia";
import instance from "@/http-common";
import { HouseOrder, HouseOrderUpdateItem } from "@/api/model";


export const useHouseOrderStore = defineStore({
  id: "houseOrdersStore",
  state: () => ({
    orders: [] as HouseOrder[],
  }),
  getters: {
    getOrders: (state) => {
      return state.orders;
    },
    hasOrders: (state) => {
      return state.orders && state.orders.length > 0;
    },
  },
  actions: {
    async fetchOrderItems() {
      const response = await instance.get("/house_orders/", {
        headers: {
          "Authorization": 'Bearer ' + JSON.parse(localStorage.getItem("token")!),
          "Content-Type": "application/json",
        },
      });
      this.orders = response.data;
    },
    async setQuantity(payload: HouseOrderUpdateItem) {
      //  First: get HouseOrder
      const orderObj = this.orders.find((x) => x.id === payload.order_id);

      //  Second: get list of HouseOrderItem's from HouseOrder
      const items = orderObj?.house_order_items;

      //  Third: get HouseOrderItem from list of HouseOrderItem's
      const item = items?.find((y) => y.id === payload.order_item_id);

      //  Fourth: send changes to DB
      if (item != null) {
        item.quantity = payload.updated_quantity;

        //  ** TODO: Axios does not send as json? **
        //   const res = await instance
        //     .put("/house_orders/active_order/1", { item })
        //     .catch((error) => {
        //       console.error("There was an error!", error);
        //       console.log(res?.data.headers["Content-Type"]);
        //     });
        // } else {
        //   console.log("Item to update not found!");
        const access_token = JSON.parse(localStorage.getItem("token")!);
        console.log(access_token);
        const request_options = {
          method: "PUT",
          headers: {
            "Authorization": access_token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            price: item.price,
            measure_unit: item.measure_unit,
            quantity: item.quantity,
          }),
        };
        fetch(
          "http://0.0.0.0:8005/house_orders/active_order/" + item.id,
          request_options
        ).then((response) => console.log(response));
      }
    },
  },
});
