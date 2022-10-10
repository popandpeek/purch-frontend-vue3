<template>
  <base-card>
    <div>
      <h2>{{ vendorName }}</h2>
      <h3>{{ invoiceDate }}</h3>
      <h5>invoice #: {{ documentId }}</h5>
      <h5>status: {{ invoiceStatus }}</h5>
    </div>
    <div class="actions">
      <base-button @click="backwards">
        Back
      </base-button>
    </div>
  </base-card>
  <base-card>
    <div v-if="hasInvoiceItems">
      <li
        v-for="invItem in invoiceItems"
        :key="invItem"
        :type="invItem"
        :title="invItem"
      >
        {{ invItem.id }} - {{ invItem.description }} - {{ invItem.quantity
        }}{{ invItem.packWeight }}
      </li>
    </div>
    <h3 v-else>
      No items on invoice!
    </h3>
  </base-card>
</template>

<script setup>
/**
 * imports
 */
import { defineProps, computed } from "vue"
import { useInvoiceStore } from "../../../stores/vendor-invoices"
import { useRouter } from 'vue-router'

/** 
 * store
 */
const invoiceStore = useInvoiceStore()

/** 
 * router
 */
const router = useRouter()

/**
 * props
 */
const props = defineProps ({
  invoiceId: {
    type: String,
    required: true
  }
})

/**
 * computed
 */
const invoiceItem = computed(() => {
  return invoiceStore.invoices.find((invoice) => invoice.id === props.invoiceId)
})

const vendorName = computed(() => {
  return invoiceItem.value.vendorName
})

const documentId = computed(() => {
  return invoiceItem.value.invoiceDocId
})

const invoiceDate = computed(() => {
  return invoiceItem.value.date
})

const invoiceStatus = computed(() => {
  return invoiceItem.value.status
})

const invoiceItems = computed(() => {
  return invoiceItem.value.items
})

const hasInvoiceItems = computed(() => {
  return invoiceItem.value.items.length > 0
})

/**
 * methods
 */
const backwards = () => {
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
