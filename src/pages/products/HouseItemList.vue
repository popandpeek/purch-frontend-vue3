<template>
  <base-card>
    <h1>PRODUCTS</h1>
    <div v-if="items && items.length > 0">
      <house-product-item
        v-for="item in items"
        :id="item.id"
        :key="item.id"
        :name="item.name"
        :measure="item.tracking_unit"
        :cur-price="item.current_price_per_unit"
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
import { onMounted } from 'vue';

/*
  store
*/
const houseItemsStore = useHouseItemsStore()
const { items } = storeToRefs(houseItemsStore)

onMounted(async () => {
  await houseItemsStore.fetchHouseItems()
  console.log('Items after fetch:', items.value)
  console.log('Items length:', items.value?.length)
  if (items.value && items.value.length > 0) {
    console.log('First item details:', items.value[0])
    console.log('First item name:', items.value[0].name)
    console.log('First item cur_price:', items.value[0].cur_price)
    console.log('First item unit:', items.value[0].unit)
  }
})

</script>
