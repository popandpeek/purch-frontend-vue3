<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Overview of your purchasing and inventory operations</p>
    </div>

    <!-- Key Metrics Cards -->
    <div class="metrics-grid">
      <div class="metric-card low-stock" :class="{ 'alert': lowStockCount > 0 }">
        <div class="metric-content">
          <h3>{{ lowStockCount }}</h3>
          <p>Low Stock Items</p>
          <span v-if="lowStockCount > 0" class="alert-text">Action Required</span>
        </div>
      </div>

      <div class="metric-card pending-orders">
        <div class="metric-content">
          <h3>{{ pendingOrders.count }}</h3>
          <p>Pending Orders</p>
          <span class="value">${{ pendingOrders.totalValue.toFixed(2) }}</span>
        </div>
      </div>

      <div class="metric-card overdue-invoices" :class="{ 'alert': overdueInvoices.count > 0 }">
        <div class="metric-content">
          <h3>{{ overdueInvoices.count }}</h3>
          <p>Overdue Invoices</p>
          <span v-if="overdueInvoices.count > 0" class="alert-text">${{ overdueInvoices.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="metric-card monthly-spend">
        <div class="metric-content">
          <h3>${{ monthlySpend.toFixed(2) }}</h3>
          <p>Monthly Spend</p>
          <span class="period">This Month</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/inventories" class="action-card">
          <h3>Check Inventory</h3>
          <p>View stock levels and manage inventory</p>
        </router-link>

        <router-link to="/orders/new" class="action-card">
          <h3>Create Order</h3>
          <p>Place new purchase orders with vendors</p>
        </router-link>

        <router-link to="/invoices" class="action-card">
          <h3>Process Invoices</h3>
          <p>Review and approve vendor invoices</p>
        </router-link>

        <router-link to="/vendors" class="action-card">
          <h3>Manage Vendors</h3>
          <p>View vendor information and performance</p>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div v-if="recentActivity.length === 0" class="no-activity">
          <p>No recent activity</p>
        </div>
        <div v-else>
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id" 
            class="activity-item"
            :class="activity.type"
          >
            <div class="activity-content">
              <h4>{{ activity.title }}</h4>
              <p class="activity-time">{{ formatTime(activity.timestamp) }}</p>
              <span v-if="activity.status" class="activity-status" :class="activity.status">
                {{ activity.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDashboardStore } from '../stores/dashboard';

const dashboardStore = useDashboardStore();

const lowStockCount = computed(() => dashboardStore.lowStockItemsCount);
const pendingOrders = computed(() => dashboardStore.pendingOrders);
const overdueInvoices = computed(() => dashboardStore.overdueInvoices);
const monthlySpend = computed(() => dashboardStore.monthlySpend);
const recentActivity = computed(() => dashboardStore.recentActivity);
const loading = computed(() => dashboardStore.loading);

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return date.toLocaleDateString();
};

onMounted(async () => {
  await dashboardStore.refreshDashboard();
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-card.alert {
  border-left: 4px solid #e74c3c;
}


.metric-content h3 {
  font-size: 2rem;
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.metric-content p {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
  font-weight: 500;
}

.value, .period {
  font-size: 0.9rem;
  color: #27ae60;
  font-weight: 600;
}

.alert-text {
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: 600;
}

.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}


.action-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.action-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.recent-activity h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.activity-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.no-activity {
  padding: 2rem;
  text-align: center;
  color: #7f8c8d;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ecf0f1;
}

.activity-item:last-child {
  border-bottom: none;
}


.activity-content h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.activity-time {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.activity-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.activity-status.pending {
  background: #fff3cd;
  color: #856404;
}

.activity-status.paid {
  background: #d4edda;
  color: #155724;
}

.activity-status.completed {
  background: #d1ecf1;
  color: #0c5460;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
