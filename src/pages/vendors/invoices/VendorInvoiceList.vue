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
    
    <div v-if="vendor_invoices">
      <VendorInvoiceItem
        v-for="invoice in invoices"
        :id="invoice.id"
        :key="invoice.id"
        :doc-id="invoice.invoice_doc_id"
        :date="invoice.date"
        :status="invoice.paid"
      />
    </div>
    <h3 v-else>
      No invoices found!
    </h3>
  </base-card>
</template>

<script setup lang="ts">
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
const invoiceStore = useInvoiceStore()
const { vendor_invoices } = storeToRefs(useInvoiceStore())
const { fetchAllVendorInvoices } = useInvoiceStore()

fetchAllVendorInvoices()

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
const invoices = computed(() => {
  return invoiceStore.vendor_invoices.filter(function(obj) {return obj.vendor_id === Number(props.vendorId)})
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
