<template>
  <section>
    <base-card>
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

<script setup>
/**
 * imports
 */
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVendorItemStore } from '../../../stores/vendor-items'

/**
 * router
 */
const router = useRouter()

/**
 * store
 */
const vendorProductItems = useVendorItemStore()

/**
 * props
 */
const props = defineProps ({
  vendorItemId: {
    type: String,
    default: "",
  }
})

/**
 * computed
 */
const selectedItem = computed(() => {
  return vendorProductItems.items.find( (item) => item.id === props.vendorItemId)
})

const productName = computed(() => {
  return selectedItem.value.name
})

const productPrice = computed(() => {
  return selectedItem.value.curPrice
})

const productDescription = computed(() => {
  return selectedItem.value.description
})

const itemPackSize = computed(() => {
  return selectedItem.value.packSize
})

const itemPackWeight = computed(() => {
  return selectedItem.value.packWeight
})

const itemPackQuantity = computed(() => {
  return selectedItem.value.packQuantity
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
