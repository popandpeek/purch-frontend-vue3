<template>
  <base-card>
    <h2>{{ vendorName }}</h2>
    <div class="actions">
      <base-button @click="backToVendors">
        Back
      </base-button>
    </div>
  </base-card>
  <router-view />
</template>

<script>
export default {
  props: ["vendorId"],
  data() {
    return {
      vendorItem: null,
    };
  },
  computed: {
    vendorName() {
      return this.vendorItem.name;
    },
  },
  created() {
    this.vendorItem = this.$store.getters["vendorContacts/vendors"].find(
      (vendor) => vendor.id === this.vendorId
    );
  },
  methods: {
    backToVendors() {
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
