<template>
  <section>
    <base-card>
      <h2>{{ orderDate }}</h2>
      <h3>Status:</h3>
      <h5 v-if="orderSubmitted">
        CLOSED
      </h5>
      <h6 v-else>
        OPEN
      </h6>
      <div class="actions">
        <base-button @click="backToOrders">
          BACK
        </base-button>
      </div>
    </base-card>
  </section>
  <base-card>
    <div v-if="hasItem">
      <li>
        <HouseOrderListItem
          v-for="item in itemList"
          :id="item.id"
          :key="item.id"
          :item-list="item"
          :itemId="item.itemId"
          :type="item.itemId"
          :title="item.itemId"
          :quantity="item.quantity"
          :measure="item.measure"
          :price="item.price"
          :order-id="getOrderId"
        />
      </li>
    </div>
    <div v-else>
      Item not found!
    </div>
  </base-card>
</template>

<script setup>
/**
 * imports
 */
import HouseOrderListItem from "../../components/house-orders/HouseOrderListItem.vue"
import { computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseOrderStore } from '../../stores/house-orders'

/**
 * store
 */
const houseOrderStore = useHouseOrderStore()

/**
 * router
 */
const router = useRouter()

/**
 * props
 */
const props = defineProps ({
  houseOrderId: {
    type: String,
    required: true, 
  }
})

/**
 * computed
 */
const orderDate = computed(() => {
  return selectedItem.value.date
})

const orderSubmitted = computed(() => {
  return selectedItem.value.submitted
})

const selectedItem = computed(() => {
  return houseOrderStore.orders.find( (order) => order.id === props.houseOrderId);
})

const hasItem = computed(() => {
  if (selectedItem.value) {
    return true;
  }
  return false;
})

const itemList = computed(() => {
  return selectedItem.value['items'];
})

/**
 * methods
 */
const backToOrders = () => {
      return router.go(-1);
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

h5 {
  color: red;
}

h6 {
  color: green;
}
</style>
