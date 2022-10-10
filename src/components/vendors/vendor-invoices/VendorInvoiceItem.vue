<template>
  <base-input-list-item>
    <h3>date: {{ props.date }}</h3>
    <h5>invoice #: {{ props.docId }}</h5>
    <div class="actions">
      <base-button
        link
        :to="'/vendors/invoices/' + props.id"
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
import { defineProps } from "vue"

/**
 * props
 */
const props = defineProps ({
  id: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  docId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
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
