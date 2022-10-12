<template>
  <div>
    <base-input-list-item>
      <p>{{ props.itemId }}</p>
      <p>${{ props.price }}</p>
      <p>{{ props.measure }}</p>
      <input v-model="amount" type="number" />
    </base-input-list-item>
  </div>
</template>

<script setup>
/**
 * imports
 */
import { computed, defineProps } from 'vue'
import { useHouseOrderStore } from '../../stores/house-orders'

/*
  store
*/
const orderStore = useHouseOrderStore()

/*
  props
*/
const props = defineProps ({
  id: {
    type: String,
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  measure: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
})

/*
  computed
*/
const amount = computed({
  get() {
    return props.quantity
  },
  set(newValue) {
    orderStore.setQuantity({
      id: props.orderId,
      itemId: props.itemId,
      updatedQuantity: newValue,
    })
  },
})

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
