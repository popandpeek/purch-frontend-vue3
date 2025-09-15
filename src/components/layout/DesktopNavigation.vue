<template>
  <nav class="desktop-nav">
    <div class="nav-brand">
      <router-link to="/" class="brand-link">
        <span class="brand-text">PURCH</span>
      </router-link>
    </div>
    
    <ul class="nav-links">
      <li>
        <router-link to="/" class="nav-link">
          <span class="nav-text">Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link to="/inventories" class="nav-link">
          <span class="nav-text">Inventory</span>
        </router-link>
      </li>
      <li class="nav-dropdown">
        <div class="nav-link dropdown-trigger">
          <span class="nav-text">Orders</span>
          <span class="dropdown-arrow">▼</span>
        </div>
        <ul class="dropdown-menu">
          <li>
            <router-link to="/orders" class="dropdown-link">
              <span class="dropdown-text">Order Management</span>
            </router-link>
          </li>
          <li>
            <router-link to="/orders/house" class="dropdown-link">
              <span class="dropdown-text">House Orders</span>
            </router-link>
          </li>
        </ul>
      </li>
      <li>
        <router-link to="/invoices" class="nav-link">
          <span class="nav-text">Invoices</span>
        </router-link>
      </li>
      <li>
        <router-link to="/vendors" class="nav-link">
            <span class="nav-text">Vendors</span>
        </router-link>
      </li>
      <li>
        <router-link to="/items" class="nav-link">
          <span class="nav-text">Products</span>
        </router-link>
      </li>
      <li>
              <router-link to="/settings" class="nav-link">
          <span class="nav-text">Settings</span>
        </router-link>
      </li>
    </ul>
    
    <div class="nav-actions">
      <button class="logout-btn" @click="handleLogout">
        <span class="nav-text">Logout</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/auth');
};
</script>

<style scoped>
.desktop-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 4rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #ecf0f1;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #3d008d;
  font-weight: 700;
  font-size: 1.5rem;
}

.brand-icon {
  font-size: 1.8rem;
  margin-right: 0.5rem;
}

.brand-text {
  font-family: 'Proza Libre', sans-serif;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
}

.nav-links li {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #3d008d;
}

.nav-link.router-link-active {
  background: #e8f4fd;
  color: #3d008d;
}

.nav-icon {
  font-size: 1.1rem;
  margin-right: 0.5rem;
}

.nav-text {
  font-size: 0.9rem;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.logout-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background: #c0392b;
}

/* Dropdown styles */
.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  cursor: pointer;
  user-select: none;
}

.dropdown-arrow {
  font-size: 0.75rem;
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
}

.nav-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 1000;
}

.nav-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.dropdown-link:hover {
  background: #f8fafc;
  color: #3d008d;
}

.dropdown-icon {
  font-size: 1rem;
  margin-right: 0.75rem;
  width: 20px;
  text-align: center;
}

.dropdown-text {
  font-weight: 500;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
}
</style>
