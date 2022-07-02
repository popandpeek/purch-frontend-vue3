export default {
  namespaced: true,
  state() {
    return {
      storageLocations: [],
      inventories: [
        {
          id: "11589",
          date: "9/30/2021",
          submitted: true,
          items: [
            {
              houseItemId: "crtblk",
              quantity: "12",
              measure: "lb",
            },
          ],
        },
      ],
    };
  },
  getters: {
    inventories(state) {
      return state.inventories;
    },
    hasInventories(state) {
      return state.inventories && state.inventories.length > 0;
    },
  },
  actions: {},
  mutations: {},
};
