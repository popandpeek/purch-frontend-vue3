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

<script>
import VendorInvoiceItem from "../../../components/vendors/vendor-invoices/VendorInvoiceItem.vue";
export default {
  components: { VendorInvoiceItem },
  props: ["vendorId"],
  computed: {
    filteredInvoices() {
      return this.$store.getters["invoices/invoices"].filter(
        (item) => item.vendorId === this.vendorId
      );
    },
    hasInvoices() {
      return this.filteredInvoices.length > 0;
    },
    invoiceRegistration() {
      return "/vendors/invoiceRegistration";
    },
  },
};
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
