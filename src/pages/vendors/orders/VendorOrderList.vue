<template>
  <base-card>
    <h1>ORDERS</h1>
    <div v-if="vendorOrders">
      <VendorOrderItem
        v-for="order in vendorOrders"
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

<script setup>
/**
 * imports
 */
import VendorOrderItem from "../../../components/vendors/vendor-orders/VendorOrderItem.vue";
import { useVendorOrderStore } from '../../../stores/vendor-orders'
import { defineProps } from 'vue'
import { storeToRefs } from 'pinia'

/**
 * store
 */
const { vendorOrders } = storeToRefs(useVendorOrderStore())
const { fetchVendorOrdersPerVendor } = useVendorOrderStore()

fetchVendorOrdersPerVendor(props.vendorId)

/**
 * props
 */
const props = defineProps({
  vendorId: {
    type: String,
    required: true
  },
})

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
