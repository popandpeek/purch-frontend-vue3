<template>
  <base-card>
    <h2>{{ vendorName }}</h2>
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
import { defineProps, computed } from 'vue';
import { useVendorStore } from '../../../stores/vendors';
import { useRouter } from 'vue-router';

/**
 * router
 */
const router = useRouter()

/**
 * store
 */
const vendors = useVendorStore()

/**
 * props
 */
const props = defineProps ({
  id: {
    type: String,
    required: true
  }
})

/**
 * computed
 */
const vendorItem = computed(() => {
  return vendors.vendors.find((vendor) => vendor.id === props.id)
})

const vendorName = computed(() => {
  return vendorItem.value.name
})

const backToVendors = computed(() => {
  return router.go(-1)
})

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
