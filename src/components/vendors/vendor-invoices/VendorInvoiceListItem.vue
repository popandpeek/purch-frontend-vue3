<template>
  <div>
    <base-input-list-item>
      <p>{{ itemNumber }}</p>
      <p>{{ itemBrand }}</p>
      <p>{{ itemName }}</p>
      <p>{{ props.measure }}</p>
      <p>{{ props.quantity }}</p>
    </base-input-list-item>
  </div>
</template>

<script setup lang="ts">
/**
 * imports
 */
import { computed, defineProps } from "vue";
import { useVendorItemStore } from "@/stores/vendor-items";

/**
 * store
 */
const vendorItemStore = useVendorItemStore();
const { fetchAllVendorItems } = useVendorItemStore();

fetchAllVendorItems();

/**
 *   props
 */
const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  vendorItemId: {
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
});

/**
 * computed
 */
const vendorItem = computed(() => {
  return vendorItemStore.vendorItems.find(
    (item) => item.id === props.vendorItemId
  );
});

const itemName = computed(() => {
  return vendorItem.value?.product_name;
});

const itemNumber = computed(() => {
  return vendorItem.value?.vendor_SKU;
});

const itemBrand = computed(() => {
  return vendorItem.value?.brand_name;
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
