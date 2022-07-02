<template>
  <base-card>
    <h1>PRODUCTS</h1>
    <div v-if="hasItems">
      <vendor-product-item
        v-for="item in filteredItems"
        :id="item.id"
        :key="item.id"
        :name="item.name"
        :price="item.curPrice"
        :pack-quantity="item.packQuantity"
        :pack-weight="item.packWeight"
      />
    </div>
    <h3 v-else>
      No items found!
    </h3>
  </base-card>
</template>

<script>
import VendorProductItem from "../../../components/vendors/vendor-products/VendorProductItem.vue";
export default {
  components: { VendorProductItem },
  props: ["vendorId"],
  data() {
    return {
      vendorItems: null
    }
  },
  computed: {
    filteredItems() {
      return this.vendorItems;
    },
    hasItems() {
      return this.vendorItems.length > 0;
    },
  },
  created() {
    this.vendorItems = this.$store.getters["vendorItems/items"].filter(
        (item) => item.vendorId === this.vendorId
      );
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
