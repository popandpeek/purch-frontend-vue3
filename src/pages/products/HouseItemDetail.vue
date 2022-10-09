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
          v-for="vendor in vendors"
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

<script setup>

import { computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseItemsStore } from '../../stores/house-items';

/**
 * store
 */
const itemsStore = useHouseItemsStore()

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
const selectedItem = computed(() => {
  return itemsStore.items.find( (item) => item.id === props.houseItemId)
})

const productName = computed(() => {
  return selectedItem.value.name
})

const productPrice = computed(() => {
  return selectedItem.value.lastPrice
})

const productDescription = computed(() => {
  return selectedItem.value.productDescription
})

const vendors = computed(() => {
  return selectedItem.value.vendorList
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
