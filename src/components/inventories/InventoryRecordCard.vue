<template>
  <div class="inventory-record-card">
    <div class="record-header">
      <div class="record-info">
        <h3 class="record-title">Inventory #{{ inventory.id }}</h3>
        <div class="record-meta">
          <span class="record-date">{{ formatDate(inventory.date) }}</span>
          <span class="record-status" :class="statusClass">{{ inventory.status }}</span>
        </div>
      </div>
      <div class="record-value">
        <span class="value-label">Total Value</span>
        <span class="value-amount">${{ inventory.total_value }}</span>
      </div>
    </div>

    <div class="record-content">
      <div class="record-stats">
        <div class="stat-item">
          <span class="stat-label">Items Counted:</span>
          <span class="stat-value">{{ inventory.items?.length || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Created:</span>
          <span class="stat-value">{{ formatDateTime(inventory.created_at) }}</span>
        </div>
        <div v-if="inventory.updated_at" class="stat-item">
          <span class="stat-label">Updated:</span>
          <span class="stat-value">{{ formatDateTime(inventory.updated_at) }}</span>
        </div>
      </div>

      <div v-if="inventory.notes" class="record-notes">
        <span class="notes-label">Notes:</span>
        <p class="notes-content">{{ inventory.notes }}</p>
      </div>
    </div>

    <div class="record-footer">
      <div class="record-actions">
        <button class="action-btn view" @click="handleView">
          View Details
        </button>
        <button class="action-btn compare" @click="handleCompare">
          Compare
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Inventory } from '../../api/model';

interface Props {
  inventory: Inventory;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  view: [inventory: Inventory];
  compare: [inventory: Inventory];
}>();

// Computed properties
const statusClass = computed(() => {
  const status = props.inventory.status?.toLowerCase() || '';
  
  switch (status) {
    case 'completed':
    case 'finalized':
      return 'status-completed';
    case 'in_progress':
    case 'counting':
      return 'status-processing';
    case 'draft':
    case 'pending':
      return 'status-pending';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-unknown';
  }
});

// Methods
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid Date';
  }
};

const handleView = () => {
  emit('view', props.inventory);
};

const handleCompare = () => {
  emit('compare', props.inventory);
};
</script>

<style scoped>
.inventory-record-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.inventory-record-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.record-info {
  flex: 1;
}

.record-title {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.record-date {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.record-status {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-unknown {
  background: #e2e3e5;
  color: #383d41;
}

.record-value {
  text-align: right;
}

.value-label {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.value-amount {
  font-size: 1.5rem;
  color: #27ae60;
  font-weight: 700;
}

.record-content {
  margin-bottom: 1.5rem;
}

.record-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.record-notes {
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
}

.notes-label {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notes-content {
  margin: 0;
  color: #2c3e50;
  line-height: 1.5;
  font-size: 0.9rem;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.record-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #bdc3c7;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #3d008d;
  color: #3d008d;
}

.action-btn.view:hover {
  background: #e8f4fd;
}

.action-btn.compare:hover {
  background: #fff3cd;
  border-color: #f39c12;
  color: #f39c12;
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .inventory-record-card {
    padding: 1rem;
  }
  
  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .record-value {
    text-align: left;
  }
  
  .record-stats {
    grid-template-columns: 1fr;
  }
  
  .record-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
