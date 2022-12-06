<template>
  <base-card>
    <h1>INVENTORIES</h1>
    <div v-if="inventories">
      <InventoryItem
        v-for="inventory in inventories"
        :id="inventory.id"
        :key="inventory.id"
        :date="inventory.date"
      />
    </div>
    <h3 v-else>
      No inventories found!
    </h3>
  </base-card>
</template>

<script setup lang="ts">
/**
 * imports
 */
import InventoryItem from "../../components/inventories/InventoryItem.vue";
import { useInventoriesStore } from '../../stores/inventories'
import { storeToRefs } from "pinia";

/**
 * store  
*/
const { inventories } = storeToRefs(useInventoriesStore())
const { fetchInventories } = useInventoriesStore()

fetchInventories()

</script>
