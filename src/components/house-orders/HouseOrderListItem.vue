<template>
  <div>
    <base-input-list-item>
      <p>{{ itemName }}</p>
      <p>${{ itemPrice }}</p>
      <p>{{ itemMeasure }}</p>
      <input
        v-model="amount"
        type="number"
      >
    </base-input-list-item>
  </div>
</template>

<script>
export default {
  props: ["id", "quantity", "measure", "price", 'orderId'],
  data() {
    return {
      amount: this.quantity,
      itemId: this.id,
      houseOrderId: this.orderId,
    };
  },
  computed: {
    getOrderId() {
      return this.houseOrderId;
    },
    itemName() {
      return this.id;
    },
    itemPrice() {
      return this.price;
    },
    itemMeasure() {
      return this.measure;
    },
  },
  watch: {
    amount(val) {
      this.$store.dispatch(
        "houseOrders/getQuantity", { 
        houseOrderId: this.getOrderId,
        itemId: this.id,
        updatedQuantity: val,
      });
    },
  },
  methods: {
    
  }
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
