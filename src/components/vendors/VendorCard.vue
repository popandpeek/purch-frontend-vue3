<template>
  <div class="vendor-card">
    <div class="vendor-header">
      <div class="vendor-info">
        <h3 class="vendor-name">{{ vendor.name }}</h3>
        <div class="vendor-contact">
          <span class="contact-name">{{ contactName }}</span>
          <span class="contact-email">{{ vendor.contact_email }}</span>
        </div>
      </div>
      <div class="vendor-status">
        <span class="status-badge" :class="statusClass">Active</span>
      </div>
    </div>

    <div class="vendor-content">
      <div class="vendor-details">
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-value">{{ vendor.phone || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Items:</span>
          <span class="detail-value">{{ vendor.items?.length || 0 }} products</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Performance:</span>
          <span class="detail-value">{{ performanceRating }}/5 ⭐</span>
        </div>
      </div>

      <div class="vendor-metrics">
        <div class="metric-item">
          <span class="metric-label">Total Orders</span>
          <span class="metric-value">{{ totalOrders }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Total Spent</span>
          <span class="metric-value">${{ totalSpent.toLocaleString() }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Last Order</span>
          <span class="metric-value">{{ lastOrderDate }}</span>
        </div>
      </div>
    </div>

    <div class="vendor-footer">
      <div class="vendor-actions">
        <button class="action-btn edit" @click="handleView">
          Edit
        </button>
        <button class="action-btn items" @click="handleViewItems">
          Items
        </button>
        <button class="action-btn order" @click="handleOrderHistory">
          Order History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Vendor } from '../../api/model';

interface Props {
  vendor: Vendor;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  view: [vendor: Vendor];
  edit: [vendor: Vendor];
  delete: [vendor: Vendor];
  'order-history': [vendor: Vendor];
  'view-items': [vendor: Vendor];
}>();

const router = useRouter();

// Computed properties
const contactName = computed(() => {
  const firstName = props.vendor.contact_first_name || '';
  const lastName = props.vendor.contact_last_name || '';
  return `${firstName} ${lastName}`.trim() || 'No Contact Name';
});

const statusClass = computed(() => {
  // For now, assume all vendors are active
  // In a real implementation, this would check an active field
  return 'status-active';
});

const performanceRating = computed(() => {
  // Placeholder rating - in real app would calculate from actual performance data
  return 4.2;
});

const totalOrders = computed(() => {
  // Placeholder - in real app would count actual orders
  return Math.floor(Math.random() * 50) + 10;
});

const totalSpent = computed(() => {
  // Placeholder - in real app would sum actual spending
  return Math.floor(Math.random() * 50000) + 10000;
});

const lastOrderDate = computed(() => {
  // Placeholder - in real app would get actual last order date
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
});

// Methods
const handleView = () => {
  emit('view', props.vendor);
};

const handleEdit = () => {
  emit('edit', props.vendor);
};

const handleOrderHistory = () => {
  emit('order-history', props.vendor);
};

const handleViewItems = () => {
  emit('view-items', props.vendor);
};
</script>

<style scoped>
.vendor-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.vendor-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.vendor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.vendor-info {
  flex: 1;
}

.vendor-name {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.vendor-contact {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-name {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.contact-email {
  color: #3d008d;
  font-size: 0.9rem;
  font-weight: 500;
}

.vendor-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.vendor-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.vendor-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.vendor-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 700;
}

.vendor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.vendor-actions {
  display: flex;
  gap: 0.5rem;
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

.action-btn.edit:hover {
  background: #fff3cd;
  border-color: #f39c12;
  color: #f39c12;
}

.action-btn.order:hover {
  background: #d4edda;
  border-color: #27ae60;
  color: #27ae60;
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .vendor-card {
    padding: 1rem;
  }
  
  .vendor-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .vendor-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .vendor-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
