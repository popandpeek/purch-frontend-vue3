<template>
  <base-card>
    <h1>ORDERS</h1>
    <div v-if="hasOrders">
      <house-order-item
        v-for="order in filteredHouseOrders"
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

<script>
import HouseOrderItem from "../../components/house-orders/HouseOrderItem.vue";
export default {
  components: { HouseOrderItem },
  computed: {
    filteredHouseOrders() {
      return this.$store.getters["houseOrders/orders"];
    },
    hasOrders() {
      return this.$store.getters["houseOrders/hasOrders"];
    },
  },
};
</script>
