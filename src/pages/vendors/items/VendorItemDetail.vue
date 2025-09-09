<template>
  <section>
    <base-card>
      <h1>{{ vendorName }}</h1>
      <h2>{{ productName }}</h2>
      <h3>${{ productPrice }}</h3>
      <p>{{ productDescription }}</p>
      <p>{{ itemPackSize }} / {{ itemPackQuantity }}{{ itemPackWeight }}</p>
      <div class="actions">
        <base-button @click="backToItemList">
          Back
        </base-button>
      </div>
    </base-card>
  </section>
</template>

<script setup lang="ts">
/**
 * imports
 */
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVendorItemStore } from '../../../stores/vendor-items'
import { useVendorStore } from "@/stores/vendors";

/**
 * router
 */
const router = useRouter()

/**
 * store
 */

const vendorStore = useVendorStore()
const vendorProductItems = useVendorItemStore()
const { fetchVendors } = useVendorStore()

fetchVendors()

/**
 * props
 */
const props = defineProps ({
  vendorItemId: {
    type: String,
    required: true,
  }
})

/**
 * computed
 */
const selectedItem = computed(() => {
  return vendorProductItems.vendorItems.find( (item) => item.id === Number(props.vendorItemId))
})

const productName = computed(() => {
  return selectedItem.value?.product_name
})

const productPrice = computed(() => {
  return selectedItem.value?.latest_price
})

const productDescription = computed(() => {
  return selectedItem.value?.description
})

const itemPackSize = computed(() => {
  return selectedItem.value?.pack_size
})

const itemPackWeight = computed(() => {
  return selectedItem.value?.unit
})

const itemPackQuantity = computed(() => {
  return selectedItem.value?.pack_number
})

const vendorName = computed(() => {
  return vendorStore.vendors.find((vendor) => vendor.id === selectedItem.value?.vendor_id)?.name;
})



/**
 * methods
 */
const backToItemList = () => {
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
