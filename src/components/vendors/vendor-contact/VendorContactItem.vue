<template>
  <li>
    <h2>{{ vendorName }}</h2>
    <h5>{{ vendorEmail }}</h5>
    <h5>{{ vendorPhone }}</h5>
    <div class="actions">
      <base-button
        link
        :to="vendorInvoices"
      >
        View Invoices
      </base-button>
      <base-button
        link
        :to="vendorItems"
      >
        View Items
      </base-button>
      <base-button
        link
        :to="vendorOrders"
      >
        View Orders
      </base-button>
    </div>
  </li>
</template>

<script>
export default {
  props: ["id", "name", "email", "phone"],
  computed: {
    vendorName() {
      return this.name;
    },
    vendorEmail() {
      return this.email;
    },
    vendorPhone() {
      return this.phone;
    },
    vendorInvoices() {
      return this.$route.path + "/" + this.id + "/invoices/";
    },
    vendorItems() {
      return this.$route.path + "/" + this.id + "/items/";
    },
    vendorOrders() {
      return this.$route.path + "/" + this.id + "/orders/";
    },
  },
};
</script>

<style scoped>
li {
  list-style-type: none;
  margin: 1rem 0;
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
