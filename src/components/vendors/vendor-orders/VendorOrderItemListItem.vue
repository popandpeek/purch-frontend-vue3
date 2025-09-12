<template>
  <div class="order-item-card">
    <div class="item-header">
      <div class="item-info">
        <h4 class="item-name">{{ itemName || 'Unknown Item' }}</h4>
        <p class="item-sku">SKU: {{ itemNumber || 'N/A' }}</p>
      </div>
      <div class="item-price">
        <span class="unit-price">${{ unitPrice || '0.00' }}</span>
        <span class="price-label">per {{ measure || 'unit' }}</span>
      </div>
    </div>

    <div class="item-details">
      <div class="detail-row">
        <span class="detail-label">Brand:</span>
        <span class="detail-value">{{ itemBrand || 'N/A' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Quantity:</span>
        <span class="detail-value quantity">{{ quantity || '0' }} {{ measure || 'units' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total:</span>
        <span class="detail-value total">${{ calculateTotal() }}</span>
      </div>
    </div>

    <div class="item-meta">
      <div class="meta-item">
        <span class="meta-label">Item ID:</span>
        <span class="meta-value">#{{ id }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Vendor Item ID:</span>
        <span class="meta-value">#{{ vendorItemId }}</span>
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { computed, defineProps } from "vue";
import { useVendorItemStore } from "@/stores/vendor-items";

const vendorItemStore = useVendorItemStore();
const { fetchAllVendorItems } = useVendorItemStore();

fetchAllVendorItems();

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  vendorItemId: {
    type: Number,
    required: true,
  },
  vendorOrderId: {
    type: Number,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  measure: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: String,
    required: true,
  },
});

// Computed properties
const vendorItem = computed(() => {
  return vendorItemStore.vendorItems.find(
    (item) => item.id === props.vendorItemId
  );
});

const itemName = computed(() => {
  return vendorItem.value?.product_name;
});

const itemNumber = computed(() => {
  return vendorItem.value?.sku || vendorItem.value?.vendor_product_id;
});

const itemBrand = computed(() => {
  return vendorItem.value?.brand;
});

// Methods
const calculateTotal = () => {
  console.log('Calculating item total:', { 
    unitPrice: props.unitPrice, 
    quantity: props.quantity,
    vendorItemId: props.vendorItemId 
  });
  
  const unitPrice = parseFloat(props.unitPrice || '0');
  const qty = parseFloat(props.quantity || '0');
  const total = unitPrice * qty;
  
  console.log('Item total calculation:', { 
    parsedUnitPrice: unitPrice, 
    parsedQuantity: qty, 
    total: total,
    isNaN: isNaN(total)
  });
  
  return isNaN(total) ? '0.00' : total.toFixed(2);
};
  </script>
  
<style scoped>
.order-item-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.order-item-card:hover {
  border-color: #3d008d;
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.1);
  transform: translateY(-2px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.item-sku {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.item-price {
  text-align: right;
}

.unit-price {
  display: block;
  color: #3d008d;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.price-label {
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 500;
}

.item-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

.detail-value.quantity {
  color: #3d008d;
  font-weight: 700;
}

.detail-value.total {
  color: #3d008d;
  font-size: 1rem;
  font-weight: 700;
}

.item-meta {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 0.8rem;
  color: #495057;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .item-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .item-price {
    text-align: left;
  }
  
  .item-details {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
  