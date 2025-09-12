<template>
  <div class="inventory-detail-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="backToInventories">
          <span class="btn-icon">←</span>
          Back to Inventories
        </button>
        <div class="header-info">
          <h1 class="page-title">Inventory #{{ inventoryId }}</h1>
          <p class="page-subtitle">{{ formatDate(inventory?.date) }}</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="status-section">
          <label class="status-label">Status:</label>
          <select 
            v-model="editableStatus" 
            :disabled="!isEditable"
            class="status-select"
            @change="updateStatus"
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="counting">Counting</option>
            <option value="completed">Completed</option>
            <option value="finalized">Finalized</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button 
          v-if="!isSubmitted"
          class="btn btn-primary submit-btn"
          @click="submitInventory"
          :disabled="loading"
        >
          {{ loading ? 'Submitting...' : 'Submit Inventory' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading inventory details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>Error</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadInventory">Retry</button>
    </div>

    <!-- Main Content -->
    <div v-else-if="inventory" class="inventory-content">
      <!-- Inventory Information -->
      <div class="info-section">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Inventory Date:</span>
            <span class="info-value">{{ formatDate(inventory.date) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Value:</span>
            <span class="info-value total-value">${{ inventory.total_value || '0.00' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Items Count:</span>
            <span class="info-value">{{ inventoryItemList?.length || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Created:</span>
            <span class="info-value">{{ formatDate(inventory.created_at) }}</span>
          </div>
        </div>
        
        <!-- Notes Section -->
        <div v-if="inventory.notes" class="notes-section">
          <h3>Notes</h3>
          <div class="notes-content">
            {{ inventory.notes }}
          </div>
        </div>
      </div>

      <!-- Inventory Items -->
      <div class="items-section">
        <div class="section-header">
          <h2>Inventory Items</h2>
          <div class="items-count">{{ inventoryItemList?.length || 0 }} items</div>
        </div>
        
        <div v-if="hasItems" class="items-list">
          <InventoryItemListItem
            v-for="invItem in inventoryItemList"
            :key="invItem.id"
            :id="invItem.id"
            :inventory-id="invItem.house_inventory_id"
            :house-item-id="invItem.house_item_id"
            :measure="invItem.house_item_unit || invItem.measure"
            :price="invItem.unit_cost || invItem.price"
            :quantity="invItem.quantity"
            :unit="invItem.unit"
            :order-submitted="isSubmitted"
            :is-editable="isEditable"
            @update-quantity="updateItemQuantity"
          />
        </div>
        
        <div v-else class="empty-state">
          <h3>No Items Found</h3>
          <p>This inventory doesn't have any items yet.</p>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="not-found-state">
      <h3>Inventory Not Found</h3>
      <p>The requested inventory could not be found.</p>
      <button class="btn btn-primary" @click="backToInventories">Back to Inventories</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps } from "vue";
import { useRouter } from "vue-router";
import { useInventoriesStore } from "@/stores/inventories";
import InventoryItemListItem from "@/components/inventories/InventoryItemListItem.vue";

// Props
const props = defineProps({
  inventoryId: {
    type: String,
    required: true,
  },
});

// Stores and router
const inventoriesStore = useInventoriesStore();
const router = useRouter();

// Reactive state
const loading = ref(false);
const error = ref<string | null>(null);
const editableStatus = ref<string>('');

// Computed properties
const inventory = computed(() => {
  return inventoriesStore.inventories.find(
    (item) => item.id === Number(props.inventoryId)
  );
});

const inventoryItemList = computed(() => {
  const items = (inventory.value as any)?.house_inventory_items || inventory.value?.items || [];
  console.log('Inventory items data:', items);
  if (items.length > 0) {
    console.log('First item structure:', items[0]);
    console.log('First item price:', items[0].price || items[0].unit_cost);
  }
  return items;
});

const hasItems = computed(() => {
  return inventoryItemList.value && inventoryItemList.value.length > 0;
});

const isSubmitted = computed(() => {
  return inventory.value?.status === 'completed' || 
         inventory.value?.status === 'finalized';
});

const isEditable = computed(() => {
  return !isSubmitted.value && 
         inventory.value?.status !== 'cancelled';
});

// Methods
const loadInventory = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await inventoriesStore.fetchInventories();
    if (inventory.value) {
      editableStatus.value = inventory.value.status;
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load inventory';
  } finally {
    loading.value = false;
  }
};

const updateStatus = async () => {
  if (!inventory.value) return;
  
  try {
    // Update the inventory status
    const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api/v1'}/inventories/${inventory.value.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        ...inventory.value,
        status: editableStatus.value
      })
    });
    
    if (response.ok) {
      // Update local state
      const index = inventoriesStore.inventories.findIndex(inv => inv.id === inventory.value!.id);
      if (index !== -1) {
        inventoriesStore.inventories[index].status = editableStatus.value;
      }
    } else {
      throw new Error('Failed to update status');
    }
  } catch (err: any) {
    console.error('Error updating status:', err);
    error.value = 'Failed to update status';
  }
};

const submitInventory = async () => {
  if (!inventory.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Submit the inventory (change status to completed)
    const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api/v1'}/inventories/${inventory.value.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        ...inventory.value,
        status: 'completed'
      })
    });
    
    if (response.ok) {
      // Update local state
      const index = inventoriesStore.inventories.findIndex(inv => inv.id === inventory.value!.id);
      if (index !== -1) {
        inventoriesStore.inventories[index].status = 'completed';
      }
      editableStatus.value = 'completed';
    } else {
      throw new Error('Failed to submit inventory');
    }
  } catch (err: any) {
    console.error('Error submitting inventory:', err);
    error.value = 'Failed to submit inventory';
  } finally {
    loading.value = false;
  }
};

const updateItemQuantity = async (itemId: number, newQuantity: string) => {
  if (!inventory.value) return;
  
  try {
    // Update the item quantity
    const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api/v1'}/inventories/inventory_item/${itemId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        quantity: newQuantity
      })
    });
    
    if (response.ok) {
      // Update local state
      const item = inventoryItemList.value.find((invItem: any) => invItem.id === itemId);
      if (item) {
        item.quantity = newQuantity;
      }
    } else {
      throw new Error('Failed to update quantity');
    }
  } catch (err: any) {
    console.error('Error updating quantity:', err);
    error.value = 'Failed to update quantity';
  }
};

const getAuthToken = async (): Promise<string> => {
  // This would typically come from your auth store
  const token = localStorage.getItem('firebase_token');
  if (!token) {
    throw new Error('No auth token available');
  }
  return token;
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const backToInventories = () => {
  router.push('/inventories');
};

// Lifecycle
onMounted(() => {
  loadInventory();
});
</script>

<style scoped>
.inventory-detail-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.btn-icon {
  font-size: 1rem;
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
}

.status-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  color: #495057;
  min-width: 140px;
}

.status-select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3d008d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #2d0066;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc3545;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
}

/* Main Content */
.inventory-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Info Section */
.info-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.info-value.total-value {
  color: #3d008d;
  font-size: 1.3rem;
  font-weight: 700;
}

.notes-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
}

.notes-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.notes-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  color: #495057;
  line-height: 1.6;
}

/* Items Section */
.items-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.items-count {
  background: #e8f4fd;
  color: #3d008d;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #6c757d;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #adb5bd;
  margin: 0;
}

/* Not Found State */
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.not-found-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.not-found-state h3 {
  color: #dc3545;
  margin: 0 0 0.5rem 0;
}

.not-found-state p {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover {
  background: #2d0066;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .inventory-detail-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
