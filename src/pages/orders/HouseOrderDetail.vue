<template>
  <section>
    <base-card>
      <h2>{{ orderDate }}</h2>
      <h3>Status:</h3>
      <h5 v-if="orderSubmitted">
        CLOSED
      </h5>
      <h6 v-else>
        OPEN
      </h6>
      <div class="actions">
        <base-button @click="backToOrders">
          BACK
        </base-button>
      </div>
    </base-card>
  </section>
  <base-card>
    <div v-if="hasItem">
      <li>
        <house-order-list-item
          v-for="item in itemList"
          :id="item.id"
          :key="item.id"
          :item-list="item"
          :type="item.id"
          :title="item.id"
          :quantity="item.quantity"
          :measure="item.measure"
          :price="item.price"
          :order-id="getOrderId"
        />
      </li>
    </div>
    <div v-else>
      Item not found!
    </div>
  </base-card>
</template>

<script>
import HouseOrderListItem from "../../components/house-orders/HouseOrderListItem.vue";
export default {
  components: { HouseOrderListItem },
  props: ["houseOrderId"],
  data() {
    return {
      selectedItem: null,
      orderItemList: null,
    };
  },
  computed: {
    orderDate() {
      return this.selectedItem.date;
    },
    orderSubmitted() {
      return this.selectedItem.submitted;
    },
    itemList() {
      return this.orderItemList;
    },
    getOrderId() {
      return this.houseOrderId;
    }
  },
  created() {
    this.selectedItem = this.$store.getters["houseOrders/orders"].find(
      (order) => order.id === this.houseOrderId
    );
    if (this.selectedItem) {
      this.orderItemList = this.selectedItem["items"];
    }
  },
  methods: {
    hasItem() {
      if (this.selectedItem) {
        return true;
      }
      return false;
    },
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

h5 {
  color: red;
}

h6 {
  color: green;
}
</style>
