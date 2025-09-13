<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? 'Edit Order' : 'Create New Order' }}</h2>
        <button class="close-btn" @click="handleCancel">
          <span class="btn-icon">×</span>
        </button>
      </div>
      
      <div class="modal-body">
        <OrderForm
          :order="order"
          :is-editing="isEditing"
          @success="handleSuccess"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type HouseOrder } from '@/stores/house-orders';
import OrderForm from './OrderForm.vue';

// Props
const props = defineProps<{
  order?: HouseOrder | null;
  isEditing?: boolean;
}>();

// Emits
const emit = defineEmits<{
  success: [order: HouseOrder];
  cancel: [];
}>();

// Methods
const handleSuccess = (order: HouseOrder) => {
  emit('success', order);
};

const handleCancel = () => {
  emit('cancel');
};

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleCancel();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
  }
}
</style>
