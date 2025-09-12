import { defineStore } from "pinia";
import type { HouseItem } from "@/api/model";
import instance from "../http-common";

export const useHouseItemsStore = defineStore({
  id: "houseItemsStore",
  state: () => ({
    items: [] as HouseItem[],
    loading: false,
    error: null as string | null,
  }),
  getters: {
    getItems: (state) => state.items,
    hasItems: (state) => state.items && state.items.length > 0,
    getItemById: (state) => (id: number) => state.items.find(item => item.id === id),
    getLowStockItems: (state) => state.items.filter(item => item.current_count < item.par_level),
    getItemsByCategory: (state) => (category: string) => 
      state.items.filter(item => item.inventory_category === category),
  },
  actions: {
    async fetchHouseItems() {
      this.loading = true;
      this.error = null;
      try {
        const response = await instance.get("/house-items/");
        this.items = response.data;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch house items';
        console.error('Error fetching house items:', error);
      } finally {
        this.loading = false;
      }
    },
    async updateItemCount(itemId: number, newCount: number) {
      try {
        // This would need to be implemented based on available API endpoints
        const item = this.items.find(item => item.id === itemId);
        if (item) {
          item.current_count = newCount;
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to update item count';
        console.error('Error updating item count:', error);
      }
    },
  },
});