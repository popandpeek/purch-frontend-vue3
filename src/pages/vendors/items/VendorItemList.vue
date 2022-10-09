<template>
  <base-card>
    <h1>PRODUCTS</h1>
    <div v-if="hasItems">
      <VendorProductItem
        v-for="item in vendorProductItems"
        :id="item.id"
        :key="item.id"
        :name="item.name"
        :price="item.curPrice"
        :pack-quantity="item.packQuantity"
        :pack-weight="item.packWeight"
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
import VendorProductItem from "../../../components/vendors/vendor-products/VendorProductItem.vue";
import { useVendorItemStore } from '../../../stores/vendor-items'
import { defineProps, computed } from "vue";
import { storeToRefs } from "pinia";

/**
 * store
 */
const { vendorItems } = storeToRefs(useVendorItemStore())
const { fetchVendorItems } = useVendorItemStore()

fetchVendorItems()

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
const vendorProductItems = computed(() => {
  return vendorItems.filter((item) => item.vendorId === props.vendorId)
})

const hasItems = computed(() => {
  return vendorProductItems.value.length > 0
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
