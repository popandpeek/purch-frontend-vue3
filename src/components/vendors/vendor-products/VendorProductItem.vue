<template>
  <base-input-list-item>
    <h3>{{ props.name }}</h3>
    <h4>{{ productMeasure }} --- ${{ props.price }}</h4>
    <div class="actions">
      <base-button
        link
        :to="'/vendors/items/' + props.id"
      >
        View Details
      </base-button>
    </div>
  </base-input-list-item>
</template>

<script setup lang="ts">
/**
 * imports
 */
import { defineProps, computed } from 'vue';

/**
 * props
 */
const props = defineProps ({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  measureUnit: {
    type: String,
    required: true
  },
  packSize: {
    type: Number,
    required: true
  },
  packNumber: {
    type: Number,
    required: true
  },
  price: {
    type: String,
    required: true
  },
})

/**
 * computed
 */
const productMeasure = computed(() => {
  return props.packNumber + 'x' + props.packSize + ' / ' + props.measureUnit
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