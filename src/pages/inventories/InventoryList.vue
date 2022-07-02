<template>
  <base-card>
    <h1>INVENTORIES</h1>
    <div v-if="hasInventories">
      <inventory-item
        v-for="inventory in filteredInventories"
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

<script>
import InventoryItem from "../../components/inventories/InventoryItem.vue";

export default {
  components: { InventoryItem },
  computed: {
    filteredInventories() {
      return this.$store.getters["inventories/inventories"];
    },
    hasInventories() {
      return this.$store.getters["inventories/hasInventories"];
    },
  },
};
</script>
