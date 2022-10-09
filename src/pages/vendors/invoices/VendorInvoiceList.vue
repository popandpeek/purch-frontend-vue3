<template>
  <base-card>
    <h1>INVOICES</h1>
    <div class="actions">
      <base-button mode="outline">
        Refresh
      </base-button>
      <base-button
        link
        :to="invoiceRegistration"
      >
        Add Invoice
      </base-button>
    </div>
    <div v-if="hasInvoices">
      <vendor-invoice-item
        v-for="invoice in filteredInvoices"
        :id="invoice.id"
        :key="invoice.id"
        :doc-id="invoice.invoiceDocId"
        :date="invoice.date"
        :status="invoice.status"
      />
    </div>
    <h3 v-else>
      No invoices found!
    </h3>
  </base-card>
</template>

<script setup>
/** 
 * imports
 */
import VendorInvoiceItem from "../../../components/vendors/vendor-invoices/VendorInvoiceItem.vue";
import { defineProps, computed } from "vue";
import { useInvoiceStore } from '../../../stores/vendor-invoices'
import { storeToRefs } from 'pinia'

/**
 * store
 */
const { invoices } = storeToRefs(useInvoiceStore())
const { fetchVendorInvoices } = useInvoiceStore()

fetchVendorInvoices()

/**
 * props
 */
const props = defineProps ({
  vendorId: {
    type: String,
    required: true
  }
})

/**
 * computed
 */
const filteredInvoices = computed(() => {
  return invoices.filter((item) => item.vendorId === props.vendorId)
})

const hasInvoices = computed(() => {
  return invoices.value.length > 0
})

const invoiceRegistration = computed(() => {
  return '/vendors/invoiceRegistration'
})

</script>

<style scoped>
li {
  /* margin: 1rem 0; */
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
