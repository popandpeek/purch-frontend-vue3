export default {
  namespaced: true,
  state() {
    return {
      orders: [
        {
          id: "21",
          date: "09/21/2021",
          submitted: false,
          items: [
            {
              id: "crtblk",
              quantity: "1",
              measure: "case",
              price: "19.65",
            },
            {
              id: "codfrz",
              quantity: "20",
              measure: "lb",
              price: "49.65",
            },
          ],
          users: [{ userId: "" }],
        },
      ],
    };
  },
  getters: {
    orders(state) {
      return state.orders;
    },
    hasOrders(state) {
      return state.orders && state.orders.length > 0;
    },
  },
  actions: {
    getQuantity(context, payload) {
      context.commit("setQuantity", payload);
    },
  },
  mutations: {
    setQuantity(state, payload) {
      console.log(payload.houseOrderId);
      console.log(payload.itemId);
      console.log(payload.updatedQuantity);

      //  First: get order-item
      const orderObj = state.orders.find((x) => x.id === payload.houseOrderId);
      //  Second: get list of items from order-item
      const items = orderObj.items;
      //  Third: get order-list-item from list of items
      const item = items.find((y) => y.id === payload.itemId);
      //  Fourth: set quantity
      item.quantity = payload.updatedQuantity;
    },
  },
};
