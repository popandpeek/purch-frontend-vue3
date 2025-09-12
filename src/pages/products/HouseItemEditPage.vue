<template>
  <edit-page
    :page-title="`Edit Product: ${item?.name || 'Loading...'}`"
    page-description="Edit product details and settings"
    :loading="loading"
    :error="error"
    @save="saveChanges"
    @retry="loadItem"
  >
    <div v-if="item" class="item-edit">
      <!-- Basic Information -->
      <div class="section">
        <h3>Basic Information</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Product Name</label>
            <input v-model="editData.name" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select v-model="editData.inventory_category" class="form-select">
              <option value="">Select Category</option>
              <option v-for="category in inventoryCategories" :key="category" :value="category">
                {{ formatInventoryCategory(category) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Storage Location</label>
            <select v-model="editData.storage_location" class="form-select">
              <option value="">Select Storage Location</option>
              <option v-for="location in storageLocations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tracking Unit</label>
            <select v-model="editData.tracking_unit" class="form-select">
              <option value="each">Each</option>
              <option value="pound">Pound</option>
              <option value="gallon">Gallon</option>
              <option value="dozen">Dozen</option>
              <option value="case">Case</option>
              <option value="box">Box</option>
              <option value="bag">Bag</option>
              <option value="bottle">Bottle</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Pricing & Inventory -->
      <div class="section">
        <h3>Pricing & Inventory</h3>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Current Price per Unit</label>
            <input v-model="editData.current_price_per_unit" type="number" step="0.01" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Current Count</label>
            <input v-model="editData.current_count" type="number" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Par Level</label>
            <input v-model="editData.par_level" type="number" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Default Vendor Item ID</label>
            <input v-model="editData.default_vendor_item_id" type="number" class="form-input">
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="section">
        <h3>Status</h3>
        <div class="form-group">
          <label class="form-checkbox">
            <input v-model="editData.active" type="checkbox">
            <span>Active</span>
          </label>
        </div>
      </div>
    </div>
  </edit-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHouseItemsStore } from '../../stores/house-items';
import EditPage from '../EditPage.vue';
import type { HouseItem } from '../../api/model';
import { enumsService, formatInventoryCategory } from '../../constants/enums';

const route = useRoute();
const houseItemsStore = useHouseItemsStore();

const item = ref<HouseItem | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Dynamic enum values
const storageLocations = ref<string[]>([]);
const inventoryCategories = ref<string[]>([]);

const editData = ref({
  name: '',
  inventory_category: '',
  storage_location: '',
  tracking_unit: 'each' as any,
  current_price_per_unit: '',
  current_count: 0,
  par_level: 0,
  default_vendor_item_id: 0,
  active: true
});

const loadEnumValues = async () => {
  try {
    const enumValues = await enumsService.getEnumValues();
    storageLocations.value = enumValues.storage_locations;
    inventoryCategories.value = enumValues.inventory_categories;
  } catch (err) {
    console.error('Failed to load enum values:', err);
  }
};

const loadItem = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const itemId = route.params.houseItemId as string;
    await houseItemsStore.fetchHouseItems();
    const itemData = houseItemsStore.items.find(i => i.id === parseInt(itemId));
    
    if (!itemData) {
      error.value = 'Item not found';
      return;
    }
    
    item.value = itemData;
    
    // Populate edit data
    editData.value = {
      name: itemData.name,
      inventory_category: itemData.inventory_category,
      storage_location: itemData.storage_location,
      tracking_unit: itemData.tracking_unit,
      current_price_per_unit: itemData.current_price_per_unit,
      current_count: itemData.current_count,
      par_level: itemData.par_level,
      default_vendor_item_id: itemData.default_vendor_item_id,
      active: itemData.active
    };
  } catch (err: any) {
    error.value = err.message || 'Failed to load item';
  } finally {
    loading.value = false;
  }
};

const saveChanges = async () => {
  if (!item.value) return;
  
  try {
    // TODO: Implement save functionality
    console.log('Saving item changes:', editData.value);
    alert('Item updated successfully!');
  } catch (err: any) {
    alert('Failed to save changes: ' + err.message);
  }
};

onMounted(async () => {
  await loadEnumValues();
  await loadItem();
});
</script>

<style scoped>
.item-edit {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3d008d;
  box-shadow: 0 0 0 3px rgba(61, 0, 141, 0.1);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.form-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #3d008d;
}

.form-checkbox span {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
