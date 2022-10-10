<template>
  <base-card>
    <h2>{{ vendor.name }}</h2>
    <div class="actions">
      <base-button @click="backToVendors">
        Back
      </base-button>
    </div>
  </base-card>
  <router-view />
</template>

<script setup>
/**
 * imports
 */
import { defineProps } from 'vue';
import { useVendorStore } from '../../../stores/vendors';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia'
/**
 * router
 */
const router = useRouter()

/**
 * store
 */
const { vendor } = storeToRefs(useVendorStore())
const { fetchVendor } = useVendorStore()
fetchVendor(props.vendorId)

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
// const vendorItem = computed(() => {
//   return vendor
// })

// const vendorName = computed(() => {
//   return vendorItem.value.name
// })

const backToVendors = () => { 
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
