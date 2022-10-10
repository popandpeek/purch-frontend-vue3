<template>
  <base-input-list-item>
    <h3>{{ props.name }}</h3>
    <div class="actions">
      <base-button
        link
        :to="viewDetailsLink"
      >
        View Details
      </base-button>
    </div>
  </base-input-list-item>
</template>

<script setup>
/**
 * imports
 */
import { computed, defineProps } from 'vue'
import { useRoute } from 'vue-router';

/**
 * props
 */
const props = defineProps ({
  id: {
    type: String,
    required: true, 
  },
  name: {
    type: String,
    required: true, 
  },
  measure: {
    type: String,
    required: true, 
  },
  lastPrice: {
    type: String,
    required: true, 
  },
  vendorList: {
    type: Array,
    required: true, 
  },
})

/**
 * use route
 */
const route = useRoute()

/**
 * computed
 */
const viewDetailsLink = computed(() => {
  return route.path + "/" + props.id
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
