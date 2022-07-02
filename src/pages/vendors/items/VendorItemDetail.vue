<template>
  <section>
    <base-card>
      <h2>{{ productName }}</h2>
      <h3>${{ productPrice }}</h3>
      <p>{{ productDescription }}</p>
      <p>{{ itemPackSize }} / {{ itemPackQuantity }}{{ itemPackWeight }}</p>
      <div class="actions">
        <base-button @click="backToItemList">
          Back
        </base-button>
      </div>
    </base-card>
  </section>
</template>

<script>
export default {
  props: ["vendorItemId"],
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
      return this.selectedItem.curPrice;
    },
    productDescription() {
      return this.selectedItem.description;
    },
    itemPackSize() {
      return this.selectedItem.packSize;
    },
    itemPackWeight() {
      return this.selectedItem.packWeight;
    },
    itemPackQuantity() {
      return this.selectedItem.packQuantity;
    },
  },
  created() {
    this.selectedItem = this.$store.getters["vendorItems/items"].find(
      (item) => item.id === this.vendorItemId
    );
  },
  methods: {
    backToItemList() {
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
