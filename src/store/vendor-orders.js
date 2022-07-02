export default {
  namespaced: true,
  state() {
    return {
      vendorOrders: [
        {
          id: "7",
          date: "9/16/2021",
          vendorId: "1",
          vendorName: "MacDonald Meats",
          items: [
            {
              itemId: "codfrz",
              vendorItemId: "4368531",
              quantity: "20",
              measure: "lb",
              price: "2.981",
              costExtended: "59.62",
            },
          ],
        },
      ],
    };
  },
  getters: {
    orders(state) {
      return state.vendorOrders;
    },
    hasOrders(state) {
      return state.vendorOrders && state.vendorOrders.length > 0;
    },
  },
  actions: {},
  mutations: {},
};
