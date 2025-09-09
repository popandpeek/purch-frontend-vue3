<template>
  <section>
    <base-card>
      <h2>{{ inventoryDate }}</h2>
      <h3>Status:</h3>
      <h5 v-if="inventorySubmitted">SUBMITTED</h5>
      <h6 v-else>OPEN</h6>
      <div class="actions">
        <base-button @click="backToInventories"> BACK </base-button>
      </div>
    </base-card>
  </section>
  <section>
    <base-card>
      <div v-if="hasItems">
        <li>
          <InventoryItemListItem
            v-for="invItem in inventoryItemList"
            :id="invItem.id"
            :key="invItem.id"
            :inventory-id="invItem.house_inventory_id"
            :house-item-id="invItem.house_item_id"
            :measure="invItem.house_item_unit"
            :price="invItem.unit_cost"
            :quantity="invItem.quantity"
            :order-submitted="inventorySubmitted"
          />
        </li>
      </div>
      <div v-else>Item not found!</div>
    </base-card>
  </section>
</template>

<script setup lang="ts">
/**
 * imports
 */
import InventoryItemListItem from "@/components/inventories/InventoryItemListItem.vue";
import { computed, defineProps } from "vue";
import { useRouter } from "vue-router";
import { useInventoriesStore } from "@/stores/inventories";

/**
 * store
 */
const inventoryItems = useInventoriesStore();

/**
 * router
 */
 const router = useRouter();

/**
 * props
 */
const props = defineProps({
  inventoryId: {
    type: String,
    required: true,
  },
});

/**
 * computed
 */
const inventoryItem = computed(() => {
  return inventoryItems.inventories.find(
    (item) => item.id === Number(props.inventoryId)
  );
});

const inventoryDate = computed(() => {
  return inventoryItem.value?.date;
});

const inventorySubmitted = computed(() => {
  return inventoryItem.value?.submitted;
});

const hasItems = computed(() => {
  if (inventoryItem.value) {
    return true;
  }
  return false
});

const inventoryItemList = computed(() => {
  console.log('🔍 Inventory item:', inventoryItem.value);
  console.log('🔍 Inventory items:', inventoryItem.value?.items);
  return inventoryItem.value?.items;
});

/**
 * methods
 */
const backToInventories = () => {
  return router.go(-1);
};
</script>

<style scoped>
li {
  margin: 1rem 0;
  list-style-type: none;
  border: 1px solid #424242;
  border-radius: 12px;
  padding: 1rem;
}

h3 {
  font-size: 1.5rem;
}

h3,
h4 {
  margin: 0.5rem 0;
}

div {
  margin: 0.5rem 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
