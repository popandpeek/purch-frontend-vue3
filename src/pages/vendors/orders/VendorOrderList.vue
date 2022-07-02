<template>
  <base-card>
    <h1>ORDERS</h1>
    <div v-if="hasOrders">
      <vendor-order-item
        v-for="order in filteredOrders"
        :id="order.id"
        :key="order.id"
        :date="order.date"
      />
    </div>
    <h3 v-else>
      No items found!
    </h3>
  </base-card>
</template>

<script>
import VendorOrderItem from "../../../components/vendors/vendor-orders/VendorOrderItem.vue";
export default {
  components: { VendorOrderItem },
  props: ["vendorId"],
  data() {
    return { vendorOrders: null };
  },
  computed: {
    filteredOrders() {
      return this.vendorOrders;
    },
    hasOrders() {
      return this.vendorOrders && this.vendorOrders.length > 0;
    },
  },
  created() {
    this.vendorOrders = this.$store.getters["vendorOrders/orders"].filter(
      (order) => order.vendorId === this.vendorId
    );
  },
};
</script>

<style scoped>
li {
  /* margin: 1rem 0; */
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
