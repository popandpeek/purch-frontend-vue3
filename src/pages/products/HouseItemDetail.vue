<template>
  <section>
    <base-card>
      <h2>{{ productName }}</h2>
      <h3>${{ productPrice }}</h3>
      <div class="actions">
        <base-button @click="backToOrders">
          BACK
        </base-button>
      </div>
    </base-card>
  </section>
  <section>
    <base-card>
      <p>
        {{ productDescription }}
      </p>
      <div>
        <base-badge
          v-for="vendor in vendorList"
          :key="vendor"
          :type="vendor"
          :title="vendor"
        >
          {{ vendor }}
        </base-badge>
      </div>
    </base-card>
  </section>
</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseItemsStore } from '../../stores/house-items'
import { useVendorStore } from '../../stores/vendors'

/**
 * store
 */
const itemsStore = useHouseItemsStore()
const {fetchVendors} = useVendorStore()
const {vendors} = storeToRefs(useVendorStore())

fetchVendors()

/*
  route
*/
const router = useRouter()

/*
  props
*/
const props = defineProps ({
  houseItemId: {
    type: String,
    required: true, 
  }
})

/*
  computed
*/
const item = computed(() => {
  return itemsStore.items.find( (item) => item.id === Number(props.houseItemId))
})

const productName = computed(() => {
  return item?.value?.name
})

const productPrice = computed(() => {
  return item?.value?.cur_price
})

const productDescription = computed(() => {
  return item?.value?.description
})

const vendorList = computed(() => {
  let v_items: Array<import('@/api/model').VendorItem> = item?.value?.vendor_items!;
  let vendor_ids: number[] = [];
  v_items.forEach(element =>  {
    vendor_ids.push(element.vendor_id);
  });

  let filteredVendors: Array<import('@/api/model').Vendor> = vendors.value.filter(function(item) {return vendor_ids.includes(item.id)})
  let vendorNames: string[] = []
  filteredVendors.forEach(element => {
    vendorNames.push(element.name);
  });
  return vendorNames
})

/*
  route function
*/
const backToOrders = () => {
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
