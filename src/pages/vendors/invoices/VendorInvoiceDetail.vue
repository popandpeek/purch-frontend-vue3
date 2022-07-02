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
  <section>
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
  </section>
</template>

<script>
export default {
  props: ["invoiceId"],
  data() {
    return {
      invoiceItem: null,
    };
  },
  computed: {
    vendorName() {
      return this.invoiceItem.vendorName;
    },
    documentId() {
      return this.invoiceItem.invoiceDocId;
    },
    invoiceDate() {
      return this.invoiceItem.date;
    },
    invoiceStatus() {
      return this.invoiceItem.status;
    },
    invoiceItems() {
      return this.invoiceItem.items;
    },
    hasInvoiceItems() {
      return this.invoiceItem.items.length > 0;
    },
  },
  created() {
    this.invoiceItem = this.$store.getters["invoices/invoices"].find(
      (invoice) => invoice.id === this.invoiceId
    );
  },
  methods: {
    backwards() {
      return this.$router.go(-1);
    },
  },
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
