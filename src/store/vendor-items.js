export default {
  namespaced: true,
  state() {
    return {
      items: [
        {
          id: "015456464",
          name: "Cod, frozen",
          description: "Frozen fresh at sea",
          vendorId: "1",
          VendorItemId: "4368531",
          packSize: "1",
          packWeight: "lb",
          packQuantity: "20",
          curPrice: "59.62",
          pastPrices: [{ date: "", price: "" }],
        },
        {
          id: "015456465",
          name: "Cod, frozen",
          description: "Frozen fresh at sea",
          vendorId: "3",
          VendorItemId: "55289741",
          packSize: "1",
          packWeight: "lb",
          packQuantity: "20",
          curPrice: "63.21",
          pastPrices: [{ date: "", price: "" }],
        },
        {
          id: "015456466",
          name: "Carrots, orange, bulk",
          description: "Bulk raw carrots",
          vendorId: "2",
          VendorItemId: "11335587",
          packSize: "1",
          packWeight: "lb",
          packQuantity: "50",
          curPrice: "18.65",
          pastPrices: [{ date: "", price: "" }],
        },
      ],
    };
  },
  getters: {
    items(state) {
      return state.items;
    },
    hasItems(state) {
      return state.items && state.items.length > 0;
    },
  },
  actions: {},
  mutations: {},
};
