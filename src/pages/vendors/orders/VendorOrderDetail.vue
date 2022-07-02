<template>
  <section>
    <base-card>
      <h2>{{ vendorName }}</h2>
      <h3>{{ orderDate }}</h3>
      <div class="actions">
        <base-button @click="backToOrderList">
          Back
        </base-button>
      </div>
    </base-card>
    <base-card>
      <div v-if="hasOrderItems">
        <li
          v-for="orderItem in orderItems"
          :key="orderItem"
          :type="orderItem"
          :title="orderItem"
        >
          {{ orderItem.itemId }} - {{ orderItem.vendorItemId }} -
          {{ orderItem.quantity }}{{ orderItem.measure }} - {{ orderItem.price
          }}{{ orderItem.measure }} = ${{ orderItem.costExtended }}
        </li>
      </div>
      <h3 v-else>
        No items on invoice!
      </h3>
    </base-card>
  </section>
</template>

<script>
export default {
  props: ["vendorOrderId"],
  data() {
    return {
      orderItem: null,
    };
  },
  computed: {
    vendorName() {
      return this.orderItem.vendorName;
    },
    orderDate() {
      return this.orderItem.date;
    },
    orderItems() {
      return this.orderItem.items;
    },
    hasOrderItems() {
      return this.orderItem && this.orderItem.items.length > 0;
    },
  },
  created() {
    this.orderItem = this.$store.getters["vendorOrders/orders"].find(
      (order) => (order.id = this.vendorOrderId)
    );
  },
  methods: {
    backToOrderList() {
      return this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
li {
  margin: 1rem 0;
  list-style-type: none;
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
