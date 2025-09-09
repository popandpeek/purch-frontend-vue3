<template>
  <base-card>
    <h1>ORDERS</h1>
    <div v-if="orders && orders.length > 0">
      <p>Found {{ orders.length }} orders</p>
      <HouseOrderItem
        v-for="order in orders"
        :id="order.id"
        :key="order.id"
        :date="order.date"
        :status="order.status || 'Unknown'"
        :total-amount="order.total_amount || '0.00'"
        :vendor-id="order.vendor_id || 0"
        :order="order"
      />
    </div>
    <div v-else>
      <h3>No orders found!</h3>
    </div>
  </base-card>
</template>

<script setup lang="ts">
/**
 * imports
 */
import HouseOrderItem from "../../components/house-orders/HouseOrderItem.vue";
import { useHouseOrderStore } from '../../stores/house-orders'
import { storeToRefs } from 'pinia';
import { onMounted, watch } from 'vue';

/**
 * store
*/
const houseOrderStore = useHouseOrderStore()
const { orders } = storeToRefs(houseOrderStore)

console.log('🔍 Orders before fetch:', orders.value)

onMounted(async () => {
  await houseOrderStore.fetchOrderItems()
  console.log('🔍 Orders after fetch:', orders.value)
  console.log('🔍 Orders length:', orders.value?.length)
})

// Watch for changes in orders
watch(orders, (newOrders) => {
  console.log('🔍 Orders changed:', newOrders)
  console.log('🔍 New orders length:', newOrders?.length)
}, { deep: true })

</script>

<style>
</style>