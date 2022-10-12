<template>
  <base-card>
    <h1>ORDERS</h1>
    <div v-if="orders">
      <HouseOrderItem
        v-for="order in orders"
        :id="order.id"
        :key="order.id"
        :date="order.date"
      />
    </div>
    <h3 v-else>
      No house orders found!
    </h3>
  </base-card>
</template>

<script setup>
/**
 * imports
 */
import HouseOrderItem from "../../components/house-orders/HouseOrderItem.vue";
import { useHouseOrderStore } from '../../stores/house-orders'
import { storeToRefs } from 'pinia';

/**
 * store
*/
const { orders } = storeToRefs(useHouseOrderStore())
const { fetchOrderItems } = useHouseOrderStore()

fetchOrderItems()

</script>

<style>
</style>