<template>
  <li>
    <h2>{{ props.name }}</h2>
    <h5>{{ props.email }}</h5>
    <h5>{{ props.phone }}</h5>
    <div class="actions">
      <base-button
        link
        :to="vendorInvoices"
      >
        View Invoices
      </base-button>
      <base-button
        link
        :to="vendorItems"
      >
        View Items
      </base-button>
      <base-button
        link
        :to="vendorOrders"
      >
        View Orders
      </base-button>
    </div>
  </li>
</template>

<script setup>
/**
 * imports
 */
import { defineProps, computed } from 'vue';
import { useRoute } from 'vue-router';

/**
 * route
 */
const route = useRoute()

/**
 * props
 */
const props = defineProps ({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
})

/**
 * computed
 */
const vendorInvoices = computed(() => {
  return route.path + '/' + props.id + '/invoices/'
})

const vendorItems = computed(() => {
  return route.path + '/' + props.id + '/items/'
})

const vendorOrders = computed(() => {
  return route.path + '/' + props.id + '/orders/'
})

</script>

<style scoped>
li {
  list-style-type: none;
  margin: 1rem 0;
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
