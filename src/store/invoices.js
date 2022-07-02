export default {
  namespaced: true,
  state() {
    return {
      invoices: [
        {
          id: "145",
          date: "9/5/2021",
          vendorId: "1",
          vendorName: "MacDonald Meats",
          invoiceDocId: "545645121231",
          status: "open",
          items: [
            {
              id: "4368531",
              description: "Cod, frozen",
              packSize: "1",
              packWeight: "lb",
              packQuantity: "20",
              price: "59.62",
              quantity: "20",
            },
          ],
        },
      ],
    };
  },
  getters: {
    invoices(state) {
      return state.invoices;
    },
    hasInvoices(state) {
      return state.invoices && state.invoices.length > 0;
    },
  },
  actions: {},
  mutations: {},
};