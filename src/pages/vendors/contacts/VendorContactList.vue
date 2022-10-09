<template>
  <sections>
    <base-card>
      <h1>VENDORS</h1>
      <div class="actions">
        <base-button mode="outline">
          Refresh
        </base-button>
        <base-button
          link
          to="/vendors/registration"
        >
          Register Vendor
        </base-button>
      </div>
      <div v-if="vendors">
        <VendorContactItem
          v-for="vendor in vendors"
          :id="vendor.id"
          :key="vendor.id"
          :name="vendor.name"
          :email="vendor.email"
          :phone="vendor.phone"
        />
      </div>
      <h3 v-else>
        No Vendors
      </h3>
    </base-card>
  </sections>
</template>

<script setup>
/**
 * imports
 */
import VendorContactItem from "../../../components/vendors/vendor-contact/VendorContactItem.vue";
import { storeToRefs } from "pinia";
import { useVendorStore } from "../../../stores/vendors";

/**
 * store
 */
const { vendors } = storeToRefs(useVendorStore())
const { fetchVendors } = useVendorStore()

fetchVendors()

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