export default {
  namespaced: true,
  state() {
    return {
      vendors: [
        {
          id: "1",
          accountNumber: "",
          name: "MacDonald Meats",
          address: "2701 Airport Way S, Seattle, WA, 98101",
          phone: "206-555-9874",
          email: "orders@macmeats.com",
          deliveryDays: [],
          deliveryTimes: [],
          contactList: [],
        },
        {
          id: "2",
          accountNumber: "",
          name: "Charlies Produce",
          address: "987 15th Ave SW, Seattle, WA 98115",
          phone: "206-555-1234",
          email: "orders@charlies.com",
          deliveryDays: [],
          deliveryTimes: [],
          contactList: [],
        },
        {
          id: "3",
          accountNumber: "",
          name: "Pacific Seafood",
          address: "123 5th St, Seattle, WA, 98101",
          phone: "206-111-5555",
          email: "sales@pacificseafood.com",
          deliveryDays: [],
          deliveryTimes: [],
          contactList: [],
        },
      ],
    };
  },
  getters: {
    vendors(state) {
      return state.vendors;
    },
    hasVendors(state) {
      return state.vendors && state.vendors.length > 0;
    },
  },
  actions: {},
  mutations: {},
};