<template>
  <base-input-list-item>
    <h3>{{ props.date }}</h3>
    <div class="order-info">
      <p><strong>Status:</strong> {{ props.status }}</p>
      <p><strong>Total:</strong> ${{ props.totalAmount }}</p>
      <p><strong>Vendor ID:</strong> {{ props.vendorId }}</p>
      <p><strong>Items:</strong> {{ order?.items?.length || 0 }} items</p>
    </div>
    <div class="actions">
      <base-button
        link
        :to="viewOrderDetails"
      >
        View Details
      </base-button>
    </div>
  </base-input-list-item>
</template>

<script setup lang="ts">
/*
  imports
*/
import { computed } from 'vue'
import { useRoute } from 'vue-router';

/*
  props
*/
const props = defineProps ({
  id: {
    type: Number,
    required: true, 
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: false,
    default: 'Unknown'
  },
  totalAmount: {
    type: String,
    required: false,
    default: '0.00'
  },
  vendorId: {
    type: Number,
    required: false,
    default: 0
  },
  order: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

/*
  route
*/
const route = useRoute()

/*
  computed
*/
const viewOrderDetails = computed(() => {
  return route.path + '/' + props.id
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
