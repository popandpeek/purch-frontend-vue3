import { createStore } from "vuex";
import houseItemModule from "./house-items.js";
import houseOrdersModule from "./house-orders.js";
import inventoriesModule from "./inventories.js";
import invoicesModule from "./invoices.js";
import vendorsModule from "./vendors.js";
import vendorItemsModule from "./vendor-items.js";
import vendorOrdersModule from "./vendor-orders.js";

const store = createStore({
  modules: {
    houseItems: houseItemModule,
    houseOrders: houseOrdersModule,
    inventories: inventoriesModule,
    invoices: invoicesModule,
    vendorContacts: vendorsModule,
    vendorItems: vendorItemsModule,
    vendorOrders: vendorOrdersModule,
  },
});

export default store;
