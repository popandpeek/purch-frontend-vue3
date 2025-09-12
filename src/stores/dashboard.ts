import { defineStore } from "pinia";
import { useHouseItemsStore } from "./house-items";
import { useVendorOrderStore } from "./vendor-orders";
import { useInvoiceStore } from "./vendor-invoices";
import { useInventoriesStore } from "./inventories";

export const useDashboardStore = defineStore({
  id: "dashboardStore",
  state: () => ({
    loading: false,
    error: null as string | null,
  }),
  getters: {
    // Low stock items count
    lowStockItemsCount: () => {
      const houseItemsStore = useHouseItemsStore();
      return houseItemsStore.getLowStockItems.length;
    },
    
    // Pending orders count and total value
    pendingOrders: () => {
      const vendorOrderStore = useVendorOrderStore();
      const pending = vendorOrderStore.vendorOrders.filter(order => order.status === 'pending');
      const totalValue = pending.reduce((sum, order) => {
        if (order.total_amount === undefined || order.total_amount === null) return sum;
        return sum + order.total_amount;
      }, 0);
      return {
        count: pending.length,
        totalValue: isNaN(totalValue) ? 0 : totalValue
      };
    },
    
    // Overdue invoices count and total amount
    overdueInvoices: () => {
      const vendorInvoiceStore = useInvoiceStore();
      const today = new Date();
      const overdue = vendorInvoiceStore.vendor_invoices.filter(invoice => {
        const dueDate = new Date(invoice.due_date);
        return dueDate < today && invoice.status !== 'paid';
      });
      const totalAmount = overdue.reduce((sum, invoice) => {
        if (invoice.total_amount === undefined || invoice.total_amount === null) return sum;
        return sum + parseFloat(invoice.total_amount);
      }, 0);
      return {
        count: overdue.length,
        totalAmount: isNaN(totalAmount) ? 0 : totalAmount
      };
    },
    
    // Monthly spend (current month)
    monthlySpend: () => {
      const vendorInvoiceStore = useInvoiceStore();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyInvoices = vendorInvoiceStore.vendor_invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoice_date);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear &&
               invoice.status === 'paid';
      });
      
      const totalSpend = monthlyInvoices.reduce((sum, invoice) => {
        if (invoice.total_amount === undefined || invoice.total_amount === null) return sum;
        return sum + parseFloat(invoice.total_amount);
      }, 0);
      
      return isNaN(totalSpend) ? 0 : totalSpend;
    },
    
    // Recent activity (last 10 items)
    recentActivity: () => {
      const activities: Array<{
        id: string;
        type: 'order' | 'invoice' | 'inventory';
        title: string;
        timestamp: string;
        status?: string;
      }> = [];
      
      const vendorOrderStore = useVendorOrderStore();
      const vendorInvoiceStore = useInvoiceStore();
      const inventoryStore = useInventoriesStore();
      
      // Add recent orders
      vendorOrderStore.vendorOrders.slice(0, 5).forEach(order => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          title: `Order #${order.id} created`,
          timestamp: order.created_at,
          status: order.status
        });
      });
      
      // Add recent invoices
      vendorInvoiceStore.vendor_invoices.slice(0, 5).forEach(invoice => {
        activities.push({
          id: `invoice-${invoice.id}`,
          type: 'invoice',
          title: `Invoice ${invoice.invoice_number} received`,
          timestamp: invoice.created_at,
          status: invoice.status
        });
      });
      
      // Add recent inventory updates
      inventoryStore.inventories.slice(0, 3).forEach(inventory => {
        activities.push({
          id: `inventory-${inventory.id}`,
          type: 'inventory',
          title: `Inventory updated`,
          timestamp: inventory.updated_at,
          status: inventory.status
        });
      });
      
      // Sort by timestamp and return last 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    }
  },
  actions: {
    async refreshDashboard() {
      this.loading = true;
      this.error = null;
      try {
        const houseItemsStore = useHouseItemsStore();
        const vendorOrderStore = useVendorOrderStore();
        const vendorInvoiceStore = useInvoiceStore();
        const inventoryStore = useInventoriesStore();
        
        // Fetch all data in parallel
        await Promise.all([
          houseItemsStore.fetchHouseItems(),
          vendorOrderStore.fetchVendorOrders(),
          vendorInvoiceStore.fetchAllVendorInvoices(),
          inventoryStore.fetchInventories()
        ]);
      } catch (error: any) {
        this.error = error.message;
        console.error('Error refreshing dashboard:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
