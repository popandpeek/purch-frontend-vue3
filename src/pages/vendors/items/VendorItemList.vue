<template>
  <base-card>
    <h1>PRODUCTS</h1>
    <div v-if="vendorItems">
      <VendorProductItem
        v-for="item in items"
        :id="item.id"
        :key="item.id"
        :name="item.product_name"
        :price="item.latest_price"
        :measure-unit="item.unit"
        :pack-size="item.pack_size"
        :pack-number="item.pack_number"
      />
    </div>
    <h3 v-else>
      No items found!
    </h3>
  </base-card>
</template>

<script setup lang="ts">
/**
 * imports
 */
import VendorProductItem from "../../../components/vendors/vendor-products/VendorProductItem.vue";
import { useVendorItemStore } from '../../../stores/vendor-items'
import { computed, defineProps } from "vue";
import { storeToRefs } from "pinia";

/**
 * store
 */
const itemsStore = useVendorItemStore()
const { vendorItems } = storeToRefs(useVendorItemStore())
const { fetchAllVendorItems } = useVendorItemStore()

fetchAllVendorItems()

/**
 * props
 */
const props = defineProps ({
  vendorId: {
    type: String,
    required: true
  }
}) 

/**
 * computed
 */
const items = computed(() => {
  return itemsStore.vendorItems.filter(function(obj) {return obj.vendor_id === Number(props.vendorId)})
});

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
