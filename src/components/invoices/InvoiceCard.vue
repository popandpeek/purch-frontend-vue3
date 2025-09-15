<template>
  <div class="invoice-card">
    <div class="invoice-header">
      <div class="invoice-info">
        <h3 class="invoice-number">#{{ invoice.invoice_number }}</h3>
        <div class="invoice-meta">
          <span class="invoice-date">{{ formatDate(invoice.invoice_date) }}</span>
          <span class="invoice-vendor">{{ vendorName }}</span>
        </div>
      </div>
      <div class="invoice-status">
        <span class="status-badge" :class="statusClass">{{ invoice.status }}</span>
      </div>
    </div>

    <div class="invoice-content">
      <div class="invoice-amounts">
        <div class="amount-row">
          <span class="amount-label">Subtotal:</span>
          <span class="amount-value">${{ invoice.subtotal }}</span>
        </div>
        <div class="amount-row">
          <span class="amount-label">Tax:</span>
          <span class="amount-value">${{ invoice.tax_amount }}</span>
        </div>
        <div class="amount-row total">
          <span class="amount-label">Total:</span>
          <span class="amount-value">${{ invoice.total_amount }}</span>
        </div>
      </div>

      <div class="invoice-dates">
        <div class="date-row">
          <span class="date-label">Due Date:</span>
          <span class="date-value" :class="dueDateClass">{{ formatDate(invoice.due_date) }}</span>
        </div>
        <div class="date-row">
          <span class="date-label">Created:</span>
          <span class="date-value">{{ formatDateTime(invoice.created_at) }}</span>
        </div>
      </div>

      <div v-if="invoice.notes" class="invoice-notes">
        <span class="notes-label">Notes:</span>
        <p class="notes-content">{{ invoice.notes }}</p>
      </div>

      <div class="invoice-items">
        <span class="items-label">Items:</span>
        <span class="items-count">{{ invoice.items?.length || 0 }} items</span>
      </div>
    </div>

    <div class="invoice-footer">
      <div class="invoice-actions">
        <BaseButton 
          variant="secondary" 
          size="md" 
          @click="handleEdit"
        >
          Edit
        </BaseButton>
        <BaseButton 
          v-if="invoice.status !== 'paid'" 
          variant="primary" 
          size="md" 
          @click="handlePay"
        >
          Pay
        </BaseButton>
        <BaseButton 
          variant="danger" 
          size="md" 
          @click="handleDelete"
        >
          Delete
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVendorStore } from '../../stores/vendors';
import BaseButton from '../ui/BaseButton.vue';
import type { VendorInvoice } from '../../api/model';

interface Props {
  invoice: VendorInvoice;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  view: [invoice: VendorInvoice];
  edit: [invoice: VendorInvoice];
  pay: [invoice: VendorInvoice];
  delete: [invoice: VendorInvoice];
}>();

const vendorStore = useVendorStore();

// Computed properties
const statusClass = computed(() => {
  const status = props.invoice.status?.toLowerCase() || '';
  
  switch (status) {
    case 'paid':
      return 'status-paid';
    case 'pending':
      return 'status-pending';
    case 'overdue':
      return 'status-overdue';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-unknown';
  }
});

const vendorName = computed(() => {
  const vendor = vendorStore.vendors.find(v => v.id === props.invoice.vendor_id);
  return vendor?.name || `Vendor #${props.invoice.vendor_id}`;
});

const dueDateClass = computed(() => {
  const dueDate = new Date(props.invoice.due_date);
  const today = new Date();
  const isOverdue = dueDate < today && props.invoice.status !== 'paid';
  return isOverdue ? 'overdue' : '';
});

// Methods
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
  emit('view', props.invoice);
};

const handleEdit = () => {
  emit('edit', props.invoice);
};

const handlePay = () => {
  emit('pay', props.invoice);
};

const handleDelete = () => {
  emit('delete', props.invoice);
};
</script>

<style scoped>
.invoice-card {
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.invoice-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.invoice-info {
  flex: 1;
}

.invoice-number {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.invoice-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.invoice-date {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.invoice-vendor {
  color: #3d008d;
  font-size: 0.9rem;
  font-weight: 500;
}

.invoice-status {
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

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-overdue {
  background: #f8d7da;
  color: #721c24;
}

.status-cancelled {
  background: #e2e3e5;
  color: #383d41;
}

.status-unknown {
  background: #e2e3e5;
  color: #383d41;
}

.invoice-content {
  margin-bottom: 1.5rem;
}

.invoice-amounts {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.amount-row:last-child {
  margin-bottom: 0;
}

.amount-row.total {
  border-top: 1px solid #dee2e6;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  font-weight: 700;
}

.amount-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.amount-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.amount-row.total .amount-value {
  color: #27ae60;
  font-size: 1.1rem;
}

.invoice-dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.date-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.date-value.overdue {
  color: #e74c3c;
  font-weight: 700;
}

.invoice-notes {
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
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

.invoice-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #e8f4fd;
  border-radius: 8px;
}

.items-label {
  font-size: 0.9rem;
  color: #3d008d;
  font-weight: 500;
}

.items-count {
  font-size: 0.9rem;
  color: #3d008d;
  font-weight: 600;
}

.invoice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #ecf0f1;
}

.invoice-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}


.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .invoice-card {
    padding: 1rem;
  }
  
  .invoice-dates {
    grid-template-columns: 1fr;
  }
  
  .invoice-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .invoice-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
