<template>
  <base-card>
    <div>
      <h2>{{ vendorName }}</h2>
      <h3>{{ invoiceDate }}</h3>
      <h5>#{{ documentId }}</h5>
      <h5>{{ invoiceStatus }}</h5>
    </div>
    <div class="actions">
      <base-button @click="backwards"> Back </base-button>
    </div>
  </base-card>
  <base-card>
    <div v-if="hasInvoiceItems">
      <li>
        <VendorInvoiceListItem
          v-for="invItem in invoiceItems"
          :id="invItem.id"
          :key="invItem.id"
          :vendor-item-id="invItem.vendor_item_id"
          :quantity="invItem.quantity"
          :measure="invItem.measure_unit"
          :price="invItem.price"
        />
      </li>
    </div>
    <h3 v-else>No items on invoice!</h3>
  </base-card>
</template>

<script setup lang="ts">
/**
 * imports
 */
import { defineProps, computed } from "vue";
import { useInvoiceStore } from "../../../stores/vendor-invoices";
import { useRouter } from "vue-router";
import VendorInvoiceListItem from "@/components/vendors/vendor-invoices/VendorInvoiceListItem.vue";
import { useVendorStore } from "@/stores/vendors";

/**
 * store
 */
const invoiceStore = useInvoiceStore();
const vendorStore = useVendorStore();
const {fetchVendors} = useVendorStore();

fetchVendors();

/**
 * router
 */
const router = useRouter();

/**
 * props
 */
const props = defineProps({
  invoiceId: {
    type: String,
    required: true,
  }
});

/**
 * computed
 */
const invoiceItem = computed(() => {
  return invoiceStore.vendor_invoices.find(
    (invoice) => invoice.id === Number(props.invoiceId)
  );
});

const documentId = computed(() => {
  return invoiceItem.value?.invoice_doc_id;
});

const invoiceDate = computed(() => {
  return invoiceItem.value?.date;
});

const invoiceStatus = computed(() => {
  const status = invoiceItem.value?.paid;
  if (status) {
    return "PAID"
  } else {
    return "OUTSTANDING"
  }
});

const invoiceItems = computed(() => {
  return invoiceItem.value?.vendor_invoice_items;
});

const hasInvoiceItems = computed(() => {
  return invoiceItem.value?.vendor_invoice_items != null;
});

const vendorName = computed(() => {
  return vendorStore.vendors.find( (vendor)=> vendor.id === invoiceItem.value?.vendor_id)?.name
})

/**
 * methods
 */
const backwards = () => {
  return router.go(-1);
};
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
