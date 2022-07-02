<template>
  <base-input-list-item>
    <h3>{{ productName }}</h3>
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

<script>
export default {
  props: ["id", "name", "measure", "lastPrice", "vendorList"],
  computed: {
    productName() {
      return this.name;
    },
    productPrice() {
      return this.lastPrice;
    },
    productMeasure() {
      return this.measure;
    },
    vendors() {
      return this.vendorList;
    },
    viewDetailsLink() {
      return this.$route.path + "/" + this.id;
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
