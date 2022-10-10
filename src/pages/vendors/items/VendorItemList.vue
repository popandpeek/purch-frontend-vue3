<template>
  <base-card>
    <h1>PRODUCTS</h1>
    <div v-if="vendorItems">
      <VendorProductItem
        v-for="item in vendorItems"
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
import { defineProps } from "vue";
import { storeToRefs } from "pinia";

/**
 * store
 */
const { vendorItems } = storeToRefs(useVendorItemStore())
const { fetchVendorItemsPerVendor } = useVendorItemStore()

fetchVendorItemsPerVendor(props.vendorId)

/**
 * props
 */
const props = defineProps ({
  vendorId: {
    type: String,
    required: true
  }
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
