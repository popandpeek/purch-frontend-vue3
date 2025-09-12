<template>
  <base-card>
    <h1>INVENTORIES</h1>
    <div v-if="inventories && inventories.length > 0">
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
import { onMounted } from 'vue';

/**
 * store  
*/
const inventoriesStore = useInventoriesStore()
const { inventories } = storeToRefs(inventoriesStore)

onMounted(async () => {
  await inventoriesStore.fetchInventories()
  console.log('Inventories after fetch:', inventories.value)
  console.log('Inventories length:', inventories.value?.length)
})

</script>
