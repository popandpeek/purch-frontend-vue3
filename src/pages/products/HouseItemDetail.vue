<template>
  <section>
    <base-card>
      <h2>{{ productName }}</h2>
      <h3>${{ productPrice }}</h3>
      <div class="actions">
        <base-button @click="backToOrders">
          BACK
        </base-button>
      </div>
    </base-card>
  </section>
  <section>
    <base-card>
      <p>
        {{ productDescription }}
      </p>
      <div>
        <base-badge
          v-for="vendor in vendors"
          :key="vendor"
          :type="vendor"
          :title="vendor"
        >
          {{ vendor }}
        </base-badge>
      </div>
    </base-card>
  </section>
</template>

<script>
export default {
  props: ["houseItemId"],
  data() {
    return {
      selectedItem: null,
    };
  },
  computed: {
    productName() {
      return this.selectedItem.name;
    },
    productPrice() {
      return this.selectedItem.lastPrice;
    },
    productDescription() {
      return this.selectedItem.description;
    },
    vendors() {
      return this.selectedItem.vendorList;
    },
  },
  created() {
    this.selectedItem = this.$store.getters["houseItems/items"].find(
      (item) => item.id === this.houseItemId
    );
  },
  methods: {
    backToOrders() {
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
