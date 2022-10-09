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

<script setup>
/**
 * imports
 */
import { defineProps, computed } from "vue"
import { useVendorOrderStore } from "../../../stores/vendor-orders"
import { useRouter } from "vue-router"

/**
 * store
 */
const vendorOrders = useVendorOrderStore()

/**
 * router
 */
const router = useRouter()

/**
 * props
 */
const props = defineProps ({
  vendorOrderId: {
    type: String,
    required: true
  }
})

/**
 * computed
 */
const vendorOrderItems = computed(() => {
  return vendorOrders.orders.find((order) => (order.id === props.vendorOrderId))
})

const vendorName = computed(() => {
  return vendorOrderItems.value.vendorName
})

const orderDate = computed(() => {
  return vendorOrderItems.value.date
})

const orderItems = computed(() => {
  return vendorOrderItems.value.items
})

const hasOrderItems = computed(() => {
  return vendorOrderItems.value && vendorOrderItems.value.items.length > 0
})

/**
 * methods
 */
const backToOrderList = () => {
  return router.go(-1)
}

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
