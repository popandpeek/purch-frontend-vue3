<template>
  <div class="house-order-list">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>House Orders</h1>
        <p class="page-description">Manage house orders and track vendor breakdowns</p>
      </div>
      <div class="header-actions">
        <button @click="createNewOrder" class="btn btn-primary">
          Order
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ ordersCountByStatus.draft }}</div>
        <div class="stat-label">Draft Orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ ordersCountByStatus.processing }}</div>
        <div class="stat-label">Processing</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ ordersCountByStatus.completed }}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ ordersCountByStatus.cancelled }}</div>
        <div class="stat-label">Cancelled</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${{ totalEstimatedCost?.toFixed(2) ?? '0.00' }}</div>
        <div class="stat-label">Total Estimated Cost</div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search orders..." 
            class="search-input"
          >
          <i class="icon-search"></i>
        </div>
        
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div class="filter-group">
          <select v-model="sortBy" class="filter-select">
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="total">Sort by Total</option>
            <option value="items">Sort by Items</option>
          </select>
        </div>

        <div class="filter-group">
          <select v-model="sortOrder" class="filter-select">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <div class="view-toggle">
          <button 
            @click="viewMode = 'table'"
            :class="['toggle-btn', { active: viewMode === 'table' }]"
            title="Table View"
          >
          </button>
          <button 
            @click="viewMode = 'cards'"
            :class="['toggle-btn', { active: viewMode === 'cards' }]"
            title="Card View"
          >
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading house orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h3>Error Loading Orders</h3>
      <p>{{ error }}</p>
      <button @click="fetchHouseOrders" class="btn btn-secondary">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <h3>No House Orders Found</h3>
      <p v-if="searchQuery || statusFilter">
        No orders match your current filters. Try adjusting your search criteria.
      </p>
      <p v-else>
        Get started by creating your first house order.
      </p>
      <button @click="createNewOrder" class="btn btn-primary">Create House Order</button>
    </div>

    <!-- Orders Table View -->
    <div v-else-if="viewMode === 'table'" class="orders-table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Total Cost</th>
            <th>Vendor Orders</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" class="order-row" @click="viewOrder(order)">
            <td class="order-id">#{{ order.id }}</td>
            <td class="order-date">{{ formatDate(order.date) }}</td>
            <td class="order-status">
              <span class="status-badge" :class="`status-${order.status}`">
                {{ formatStatus(order.status) }}
              </span>
            </td>
            <td class="order-items">{{ order.items?.length ?? 0 }} items</td>
            <td class="order-total">${{ order.total_estimated_cost?.toFixed(2) ?? '0.00' }}</td>
            <td class="vendor-orders">
              <span v-if="order.vendor_orders && order.vendor_orders.length > 0" class="vendor-count">
                {{ order.vendor_orders.length }} vendor orders
              </span>
              <span v-else class="no-vendors">No breakdown</span>
            </td>
            <td class="order-actions" @click.stop>
              <div class="action-buttons">
                <button @click="viewOrder(order)" class="btn btn-sm btn-outline">
                  View
                </button>
                <button @click="editOrder(order)" class="btn btn-sm btn-outline">
                  Edit
                </button>
                <button @click="duplicateOrder(order)" class="btn btn-sm btn-outline">
                  Duplicate
                </button>
                <button 
                  v-if="order.status === 'draft'" 
                  @click="deleteOrder(order)" 
                  class="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Orders Card View -->
    <div v-else class="orders-cards-container">
      <div class="orders-grid">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card" @click="viewOrder(order)">
          <div class="card-header">
            <div class="order-title">
              <h3 class="order-id">Order #{{ order.id }}</h3>
              <span class="status-badge" :class="`status-${order.status}`">
                {{ formatStatus(order.status) }}
              </span>
            </div>
            <div class="order-date">{{ formatDate(order.date) }}</div>
          </div>
          
          <div class="card-content">
            <div class="order-stats">
              <div class="stat-item">
                <span class="stat-label">Items</span>
                <span class="stat-value">{{ order.items?.length ?? 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Cost</span>
                <span class="stat-value">${{ order.total_estimated_cost?.toFixed(2) ?? '0.00' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Vendor Orders</span>
                <span class="stat-value">
                  <span v-if="order.vendor_orders && order.vendor_orders.length > 0" class="vendor-count">
                    {{ order.vendor_orders.length }}
                  </span>
                  <span v-else class="no-vendors">0</span>
                </span>
              </div>
            </div>
          </div>
          
          <div class="card-actions" @click.stop>
            <button @click="viewOrder(order)" class="btn btn-sm btn-outline">
              View
            </button>
            <button @click="editOrder(order)" class="btn btn-sm btn-outline">
              Edit
            </button>
            <button @click="duplicateOrder(order)" class="btn btn-sm btn-outline">
              Duplicate
            </button>
            <button 
              v-if="order.status === 'draft'" 
              @click="deleteOrder(order)" 
              class="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHouseOrdersStore } from '../../stores/house-orders'
import type { HouseOrder } from '../../api/model'

const router = useRouter()
const houseOrderStore = useHouseOrdersStore()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('date')
const sortOrder = ref('desc')
const viewMode = ref<'table' | 'cards'>('table')

// Store state
const { orders, loading, error, ordersCountByStatus, totalEstimatedCost } = storeToRefs(houseOrderStore)

// Computed properties
const filteredOrders = computed(() => {
  let filtered = [...orders.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.id.toString().includes(query) ||
      (order.notes && order.notes.toLowerCase().includes(query)) ||
      (order.items && order.items.some(item => 
        item.house_item.name.toLowerCase().includes(query)
      ))
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any, bValue: any

    switch (sortBy.value) {
      case 'date':
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'total':
        aValue = a.total_estimated_cost
        bValue = b.total_estimated_cost
        break
      case 'items':
        aValue = a.items?.length ?? 0
        bValue = b.items?.length ?? 0
        break
      default:
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return filtered
})

// Methods
const fetchHouseOrders = async () => {
  await houseOrderStore.fetchHouseOrders()
}

const createNewOrder = () => {
  router.push('/orders/new')
}

const viewOrder = (order: HouseOrder) => {
  router.push(`/orders/house/${order.id}`)
}

const editOrder = (order: HouseOrder) => {
  router.push(`/orders/house/${order.id}/edit`)
}

const duplicateOrder = (order: HouseOrder) => {
  // TODO: Implement duplicate functionality
  console.log('Duplicate order:', order)
}

const deleteOrder = async (order: HouseOrder) => {
  if (confirm(`Are you sure you want to delete order #${order.id}?`)) {
    await houseOrderStore.deleteHouseOrder(order.id)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Lifecycle
onMounted(() => {
  fetchHouseOrders()
})
</script>

<style scoped>
.house-order-list {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #718096;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover {
  background: #2d0066;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-outline {
  background: transparent;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover {
  background: #3d008d;
  color: white;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #3d008d;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #718096;
  font-size: 0.875rem;
  font-weight: 500;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.search-box .icon-search {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.orders-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.orders-table th {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.orders-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.order-row {
  transition: all 0.2s ease;
  cursor: pointer;
}

.order-row:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.order-row:last-child td {
  border-bottom: none;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  position: relative;
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background: currentColor;
}

.status-draft {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-processing {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-cancelled {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.order-id {
  font-weight: 600;
  color: #3d008d;
}

.order-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.order-total {
  font-weight: 600;
  color: #059669;
  font-size: 1rem;
}

.order-items {
  color: #6b7280;
  font-size: 0.875rem;
}

.vendor-count {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.no-vendors {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 8px;
}

.toggle-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(61, 0, 141, 0.1);
}

.toggle-btn.active {
  background: #3d008d;
  color: white;
}

.orders-cards-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.order-card {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.order-card:hover {
  background: #f8fafc;
  border-color: #3d008d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.order-title h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.card-content {
  margin-bottom: 1.5rem;
}

.order-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-item .stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-item .stat-value {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .filters-row {
    grid-template-columns: 1fr auto auto;
    gap: 0.75rem;
  }
  
  .filter-group:last-child {
    display: none;
  }
}

@media (max-width: 1024px) {
  .house-order-list {
    padding: 1.5rem;
  }
  
  .filters-row {
    grid-template-columns: 1fr auto;
    gap: 0.75rem;
  }
  
  .filter-group:nth-last-child(2),
  .filter-group:last-child {
    display: none;
  }
}

@media (max-width: 768px) {
  .house-order-list {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .filter-group {
    display: block !important;
  }
  
  .view-toggle {
    justify-self: center;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .orders-table-container {
    overflow-x: auto;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .orders-grid {
    grid-template-columns: 1fr;
  }
  
  .order-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .orders-table {
    font-size: 0.875rem;
  }
  
  .orders-table th,
  .orders-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .order-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .orders-cards-container {
    padding: 1rem;
  }
  
  .order-card {
    padding: 1rem;
  }
}
</style>