<template>
  <section>
    <base-card>
      <h2>{{ inventoryDate }}</h2>
      <h3>Status:</h3>
      <h5 v-if="inventorySubmitted">
        CLOSED
      </h5>
      <h6 v-else>
        OPEN
      </h6>
      <div class="actions">
        <base-button @click="backToInventories">
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
        <li
          v-for="invItem in inventory"
          :key="invItem"
          :type="invItem"
          :title="invItem"
        >
          {{ invItem.houseItem }} --- {{ invItem.quantity
          }}{{ invItem.measure }}
        </li>
      </div>
    </base-card>
  </section>
</template>

<script setup>
/**
 * imports
 */
import { computed, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoriesStore } from '../../stores/inventories';

/**
 * router
 */
const router = useRouter()

/**
 * store
 */
const inventoryItems = useInventoriesStore()

/**
 * props
 */
const props = defineProps ({
  inventoryId: {
    type: String,
    required: true, 
  }
})

/**
 * computed
 */
const inventoryItem = computed(() => {
   return inventoryItems.inventories.find((item) => item.id === props.inventoryId)
})

const inventoryDate = computed(() => {
  return inventoryItem.value.date
})

const inventorySubmitted = computed(() => {
  return inventoryItem.value.submitted
})

const inventory = computed(() => {
  return inventoryItem.value.items
})

/**
 * methods
 */
const backToInventories = () => {
      return router.go(-1);
}

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
