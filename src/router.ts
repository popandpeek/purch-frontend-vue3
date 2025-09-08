import { createRouter, createWebHistory } from "vue-router";

import HouseItemList from "./pages/products/HouseItemList.vue";
import HouseItemDetail from "./pages/products/HouseItemDetail.vue";
import HouseItemRegistration from "./pages/products/HouseItemRegistration.vue";
import HouseOrderDetail from "./pages/orders/HouseOrderDetail.vue";
import HouseOrderList from "./pages/orders/HouseOrderList.vue";
import InventoryDetail from "./pages/inventories/InventoryDetail.vue";
import InventoryList from "./pages/inventories/InventoryList.vue";
import VendorContactDetail from "./pages/vendors/contacts/VendorContactDetail.vue";
import VendorContactList from "./pages/vendors/contacts/VendorContactList.vue";
import VendorContactRegistration from "./pages/vendors/contacts/VendorContactRegistration.vue";
import VendorInvoiceList from "./pages/vendors/invoices/VendorInvoiceList.vue";
import VendorInvoiceDetail from "./pages/vendors/invoices/VendorInvoiceDetail.vue";
import VendorInvoiceRegistration from "./pages/vendors/invoices/VendorInvoiceRegistration.vue";
import VendorItemDetail from "./pages/vendors/items/VendorItemDetail.vue";
import VendorItemList from "./pages/vendors/items/VendorItemList.vue";
import VendorOrderDetail from "./pages/vendors/orders/VendorOrderDetail.vue";
import VendorOrderList from "./pages/vendors/orders/VendorOrderList.vue";
import NotFound from "./pages/NotFound.vue";
import Auth from '@/pages/Auth.vue';
import { useAuthStore } from '@/stores/auth';


export const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: 'active',
  routes: [
    { path: "/", redirect: "/orders" },
    { path: "/auth", component: Auth, meta: { requiresGuest: true } },
    { path: "/login", redirect: "/auth" },
    { path: "/items", component: HouseItemList, meta: { requiresAuth: true } },
    { path: "/items/:houseItemId", component: HouseItemDetail, props: true, meta: { requiresAuth: true } },
    { path: "/items/registration", component: HouseItemRegistration, meta: { requiresAuth: true } },
    { path: "/orders", component: HouseOrderList, meta: { requiresAuth: true } },
    { path: "/orders/:houseOrderId", component: HouseOrderDetail, props: true, meta: { requiresAuth: true } },
    { path: "/inventories", component: InventoryList, meta: { requiresAuth: true } },
    {
      path: "/inventories/:inventoryId",
      component: InventoryDetail,
      props: true,
    },
    { path: "/vendors", component: VendorContactList, props: true },
    {
      path: "/vendors/:vendorId",
      component: VendorContactDetail,
      props: true,
      children: [
        {
          path: "invoices",
          component: VendorInvoiceList,
          props: true, 
        },
        {
          path: "items",
          component: VendorItemList,
          props: true,
        },
        {
          path: "orders",
          component: VendorOrderList,
          props: true,
        },
      ],
    },
    {
      path: "/vendors/items/:vendorItemId",
      component: VendorItemDetail,
      props: true,
    },
    {
      path: "/vendors/invoices/:invoiceId",
      name: 'vendor-invoice-details',
      component: VendorInvoiceDetail,
      props: true,
    },
    {
      path: "/vendors/orders/:vendorOrderId",
      component: VendorOrderDetail,
      props: true,
    },
    {
      path: "/vendors/registration",
      component: VendorContactRegistration,
      props: true,
    },
    {
      path: "/vendors/invoiceRegistration",
      component: VendorInvoiceRegistration,
      props: true,
    },
    { path: "/:notFound(.*)", component: NotFound },
  ],
});


router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize Firebase auth state listener if not already done
  if (!authStore.isAuthenticated) {
    authStore.initializeAuth();
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth');
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});
