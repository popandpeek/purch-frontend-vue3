<template>
  <div>
    <base-input-list-item>
      <p>{{ houseItemName }}</p>
      <p>${{ props.price }}</p>
      <p>{{ props.measure }}</p>
      <p v-if="props.orderSubmitted">{{ props.quantity }}</p>
      <p v-else><input v-model="amount" type="string" /></p>
    </base-input-list-item>
  </div>
</template>

<script setup lang="ts">
/**
 * imports
 */
import { computed, defineProps } from "vue";
import { useHouseOrderStore } from "@/stores/house-orders";
import { useHouseItemsStore } from "@/stores/house-items";

/*
  store
*/
const orderStore = useHouseOrderStore();
const itemStore = useHouseItemsStore();
const { fetchHouseItems } = useHouseItemsStore();

fetchHouseItems();

/*
  props
*/
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  houseItemId: {
    type: Number,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  measure: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  orderId: {
    type: Number,
    required: true,
  },
  orderSubmitted: {
    type: Boolean,
    required: true,
  },
});

/*
  computed
*/
const amount = computed({
  get() {
    return props.quantity;
  },
  set(newValue) {
    orderStore.setQuantity({
      order_id: props.orderId,
      order_item_id: props.id,
      updated_quantity: newValue,
    });
  },
});

const houseItemName = computed(() => {
  return itemStore.items.find((item) => item.id === props.houseItemId)?.name;
});
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
