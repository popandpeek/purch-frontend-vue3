<template>
  <base-input-list-item>
    <h5>
      Date: {{ props.date }} <br/><br/>
      Invoice#: {{ props.docId }}
    </h5>
    <div class="actions" >
      <base-button 
        link
        :to="'/vendors/invoices/' + props.id"
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
// defineProps is a compiler macro and doesn't need to be imported

/**
 * props
 */
const props = defineProps ({
  id: {
    type: Number,
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
    type: Boolean,
    required: true
  },
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
  justify-content: flex-end;
  align-items: center;
}
</style>
