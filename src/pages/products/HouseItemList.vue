<template>
  <base-card>
    <h1>PRODUCTS</h1>
    <div v-if="items">
      <house-product-item
        v-for="item in items"
        :id="item.id"
        :key="item.id"
        :name="item.name"
        :measure="item.measure_unit"
        :cur-price="item.cur_price"
      />
    </div>
    <h3 v-else>
      No items found!
    </h3>
  </base-card>
</template>

<script setup lang="ts">
import HouseProductItem from '../../components/house-products/HouseProductItem.vue'
import { useHouseItemsStore } from '../../stores/house-items'
import { storeToRefs } from 'pinia';

/*
  store
*/
const { items } = storeToRefs(useHouseItemsStore())
const { fetchHouseItems } = useHouseItemsStore()

fetchHouseItems()

</script>
