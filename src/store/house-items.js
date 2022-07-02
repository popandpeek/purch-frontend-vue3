export default {
  namespaced: true,
  state() {
    return {
      items: [
        {
          id: "crtblk",
          name: "Carrot, bulk",
          description: "raw unpeeled carrots",
          vendorList: ['Charlies Produce'],
          vendorItemIdList: [],
          storageLocations: [],
          measure: "lb",
          lastPrice: "0.59",
        },
        {
          id: "codfrz",
          name: "Cod, frozen",
          description: "Flash frozen at sea, shatterpack",
          vendorList: ['MacDonald Meats', 'Pacific Seafood'],
          vendorItemIdList: [],
          storageLocations: [],
          measure: "lb",
          lastPrice: "5.39",
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
    }
  },
  actions: {

  }, 
  mutations: {

  }
};
