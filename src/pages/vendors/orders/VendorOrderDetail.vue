<template>
  <section>
    <base-card>
      <h2>{{ vendorName }}</h2>
      <h3>{{ orderDate }}</h3>
      <div class="actions">
        <base-button @click="backToOrderList"> Back </base-button>
      </div>
    </base-card>
    <base-card>
      <div v-if="orderItems">
        <li>
          <VendorOrderItemListItem
            v-for="orderItem in orderItems"
            :id="orderItem.id"
            :key="orderItem.id"
            :vendorItemId="orderItem.vendor_item_id"
            :vendorOrderId="orderItem.vendor_order_id"
            :quantity="orderItem.quantity"
            :measure="orderItem.measure_unit"
            :price="orderItem.price"
          />
        </li>
      </div>
      <h3 v-else>No items on invoice!</h3>
    </base-card>
  </section>
</template>

<script setup lang="ts">
/**
 * imports
 */
import VendorOrderItemListItem from "@/components/vendors/vendor-orders/VendorOrderItemListItem.vue";
import { defineProps, computed } from "vue";
import { useVendorOrderStore } from "@/stores/vendor-orders";
import { useVendorStore } from "@/stores/vendors";
import { useRouter } from "vue-router";

/**
 * store
 */
const vendorOrders = useVendorOrderStore();
const vendorStore = useVendorStore();
const { fetchVendors } = useVendorStore();

fetchVendors();

/**
 * router
 */
const router = useRouter();

/**
 * props
 */
const props = defineProps({
  vendorOrderId: {
    type: String,
    required: true,
  },
});

/**
 * computed
 */
const vendorOrder = computed(() => {
  return vendorOrders.vendorOrders.find(
    (order) => order.id === Number(props.vendorOrderId)
  );
});

const orderDate = computed(() => {
  return vendorOrder.value?.date;
});

const orderItems = computed(() => {
  return vendorOrder.value?.vendor_order_items;
});

const vendorName = computed(() => {
  return vendorStore.vendors.find((vendor) => vendor.id === vendorOrder.value?.vendor_id)?.name;
});

/**
 * methods
 */
const backToOrderList = () => {
  return router.go(-1);
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
