<template>
  <base-card>
    <h1>PRODUCTS</h1>
    <div v-if="hasItems">
      <house-product-item
        v-for="item in filteredHouseItems"
        :id="item.id"
        :key="item.id"
        :name="item.name"
        :measure="item.measure"
        :last-price="item.lastPrice"
        :vendor-list="item.vendorList"
      />
    </div>
    <h3 v-else>
      No house order found!
    </h3>
  </base-card>
</template>

<script>
import HouseProductItem from "../../components/house-products/HouseProductItem.vue";

export default {
  components: { HouseProductItem },
  computed: {
    filteredHouseItems() {
      return this.$store.getters["houseItems/items"];
    },
    hasItems() {
      return this.$store.getters["houseItems/hasItems"];
    },
  },
};
</script>
