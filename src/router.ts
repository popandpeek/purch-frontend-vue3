import { createRouter, createWebHistory } from "vue-router";

import Dashboard from "./pages/Dashboard.vue";
import HouseItemList from "./pages/products/HouseItemList.vue";
import HouseItemDetail from "./pages/products/HouseItemDetail.vue";
import HouseItemRegistration from "./pages/products/HouseItemRegistration.vue";
import HouseOrderDetail from "./pages/orders/HouseOrderDetail.vue";
import HouseOrderList from "./pages/orders/HouseOrderList.vue";
import HouseOrderManagement from "./pages/orders/HouseOrderManagement.vue";
import InventoryDetail from "./pages/inventories/InventoryDetail.vue";
import InventoryList from "./pages/inventories/InventoryList.vue";
import InventoryManagement from "./pages/inventories/InventoryManagement.vue";
import OrderManagement from "./pages/orders/OrderManagement.vue";
import VendorManagement from "./pages/vendors/VendorManagement.vue";
import ProductManagement from "./pages/products/ProductManagement.vue";
import InvoiceManagement from "./pages/invoices/InvoiceManagement.vue";
import Settings from "./pages/Settings.vue";
import NewOrderPage from "./pages/orders/NewOrderPage.vue";
import NewVendorOrderPage from "./pages/vendors/orders/NewVendorOrderPage.vue";
import VendorContactDetailPage from "./pages/vendors/contacts/VendorContactDetailPage.vue";
import HouseItemEditPage from "./pages/products/HouseItemEditPage.vue";
import VendorInvoiceDetailPage from "./pages/vendors/invoices/VendorInvoiceDetailPage.vue";
import VendorContactList from "./pages/vendors/contacts/VendorContactList.vue";
import VendorContactRegistration from "./pages/vendors/contacts/VendorContactRegistration.vue";
import VendorInvoiceList from "./pages/vendors/invoices/VendorInvoiceList.vue";
import VendorInvoiceRegistration from "./pages/vendors/invoices/VendorInvoiceRegistration.vue";
import VendorItemDetail from "./pages/vendors/items/VendorItemDetail.vue";
import VendorItemList from "./pages/vendors/items/VendorItemList.vue";
import VendorItemOrderHistory from "./pages/vendors/items/VendorItemOrderHistory.vue";
import VendorOrderDetail from "./pages/vendors/orders/VendorOrderDetail.vue";
import VendorOrderEditPage from "./pages/vendors/orders/VendorOrderEditPage.vue";
import VendorOrderList from "./pages/vendors/orders/VendorOrderList.vue";
import NotFound from "./pages/NotFound.vue";
import Auth from '@/pages/Auth.vue';
import { useAuthStore } from '@/stores/auth';


export const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: 'active',
  routes: [
    { path: "/", component: Dashboard, meta: { requiresAuth: true } },
    { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
    { path: "/auth", component: Auth, meta: { requiresGuest: true } },
    { path: "/login", redirect: "/auth" },
    { path: "/items", component: ProductManagement, meta: { requiresAuth: true } },
    { path: "/items/legacy", component: HouseItemList, meta: { requiresAuth: true } },
    { path: "/items/:houseItemId", component: HouseItemDetail, props: true, meta: { requiresAuth: true } },
    { path: "/items/:houseItemId/edit", component: HouseItemEditPage, props: true, meta: { requiresAuth: true } },
    { path: "/items/registration", component: HouseItemRegistration, meta: { requiresAuth: true } },
    { path: "/orders", component: OrderManagement, meta: { requiresAuth: true } },
    { path: "/orders/house", component: HouseOrderManagement, meta: { requiresAuth: true } },
    { path: "/orders/house/legacy", component: HouseOrderList, meta: { requiresAuth: true } },
    { path: "/orders/house/:houseOrderId", component: HouseOrderDetail, props: true, meta: { requiresAuth: true } },
    { path: "/orders/house/:houseOrderId/edit", component: NewOrderPage, props: true, meta: { requiresAuth: true } },
    { path: "/orders/new", component: NewOrderPage, meta: { requiresAuth: true } },
    { path: "/orders/legacy", component: HouseOrderList, meta: { requiresAuth: true } },
    { path: "/orders/:houseOrderId", component: HouseOrderDetail, props: true, meta: { requiresAuth: true } },
    { path: "/orders/:houseOrderId/edit", component: NewOrderPage, props: true, meta: { requiresAuth: true } },
    { path: "/inventories", component: InventoryManagement, meta: { requiresAuth: true } },
    { path: "/invoices", component: InvoiceManagement, meta: { requiresAuth: true } },
    { path: "/settings", component: Settings, meta: { requiresAuth: true } },
    { path: "/inventories/list", component: InventoryList, meta: { requiresAuth: true } },
    {
      path: "/inventories/:inventoryId",
      component: InventoryDetail,
      props: true,
    },
    { path: "/vendors", component: VendorManagement, meta: { requiresAuth: true } },
    { path: "/vendors/legacy", component: VendorContactList, props: true },
    { path: "/vendors/contacts/:vendorId", component: VendorContactDetailPage, props: true, meta: { requiresAuth: true } },
    { path: "/vendors/contacts/:vendorId/edit", component: VendorContactDetailPage, props: true, meta: { requiresAuth: true } },
    {
      path: "/vendors/:vendorId",
      redirect: (to) => `/vendors/contacts/${to.params.vendorId}`,
    },
    {
      path: "/vendors/:vendorId/items",
      component: VendorItemList,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/vendors/:vendorId/orders",
      component: VendorOrderList,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/vendors/:vendorId/orders/new",
      component: NewVendorOrderPage,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/vendors/:vendorId/invoices",
      component: VendorInvoiceList,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/vendors/items/:vendorItemId",
      component: VendorItemDetail,
      props: true,
    },
    {
      path: "/vendors/items/:vendorItemId/orders",
      component: VendorItemOrderHistory,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/vendors/invoices/:invoiceId",
      name: 'vendor-invoice-details',
      component: VendorInvoiceDetailPage,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/vendors/invoices/:invoiceId/edit",
      name: 'vendor-invoice-edit',
      component: VendorInvoiceDetailPage,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/vendors/orders/:vendorOrderId",
      component: VendorOrderDetail,
      props: true,
    },
    {
      path: "/vendors/orders/:vendorOrderId/edit",
      component: VendorOrderEditPage,
      props: true,
      meta: { requiresAuth: true }
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


router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  
  // If route doesn't require auth, allow navigation
  if (!to.meta.requiresAuth && !to.meta.requiresGuest) {
    console.log('🔐 Router: Public route, allowing navigation to:', to.path);
    next();
    return;
  }
  
  // Initialize auth store if not already done
  if (!authStore.isInitialized) {
    console.log('🔐 Router: Initializing auth store...');
    await authStore.initializeAuth();
  }
  
  // Wait for Firebase auth state to be determined
  return new Promise((resolve) => {
    let unsubscribe: (() => void) | null = null;
    
    unsubscribe = authStore.waitForAuthStateChange((isAuthenticated) => {
      if (unsubscribe) {
        unsubscribe(); // Unsubscribe to prevent multiple calls
      }
      
      console.log('🔐 Router: Auth state determined, isAuthenticated:', isAuthenticated);
      
      if (to.meta.requiresAuth && !isAuthenticated) {
        console.log('🔐 Router: Redirecting to auth page');
        next('/auth');
      } else if (to.meta.requiresGuest && isAuthenticated) {
        console.log('🔐 Router: Redirecting to home page');
        next('/');
      } else {
        console.log('🔐 Router: Allowing navigation to:', to.path);
        next();
      }
      resolve(void 0);
    });
  });
});
