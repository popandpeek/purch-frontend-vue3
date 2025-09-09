<template>
  <base-input-list-item>
    <h3>{{ props.name }}</h3>
    <p>Price: ${{ props.curPrice }} per {{ props.measure }}</p>
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

<script setup lang="ts">
/**
 * imports
 */
import { computed, defineProps, onMounted } from 'vue'
import { useRoute } from 'vue-router';

/**
 * props
 */
const props = defineProps ({
  id: {
    type: Number,
    required: true, 
  },
  name: {
    type: String,
    required: true, 
  },
  measure: {
    type: String,
    required: false,
    default: 'unit'
  },
  curPrice: {
    type: String,
    required: true, 
  },
  description: {
    type: String,
    required: false,
  },
  storageLocation: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  par: {
    type: Number,
    required: false,
  },
  have: {
    type: Number,
    required: false,
  }
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

onMounted(() => {
  console.log('🔍 HouseProductItem props:', props)
  console.log('🔍 HouseProductItem name:', props.name)
  console.log('🔍 HouseProductItem curPrice:', props.curPrice)
  console.log('🔍 HouseProductItem measure:', props.measure)
  console.log('🔍 HouseProductItem description:', props.description)
  console.log('🔍 HouseProductItem storageLocation:', props.storageLocation)
  console.log('🔍 HouseProductItem category:', props.category)
  console.log('🔍 HouseProductItem par:', props.par)
  console.log('🔍 HouseProductItem have:', props.have)
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
