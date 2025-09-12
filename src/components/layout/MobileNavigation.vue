<template>
  <div class="mobile-nav">
    <!-- Hamburger Button -->
    <button 
      class="hamburger"
      :class="{ active: isOpen }"
      @click="toggleMenu"
      aria-label="Toggle navigation menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Overlay -->
    <div 
      v-if="isOpen" 
      class="nav-overlay"
      @click="closeMenu"
    ></div>

    <!-- Navigation Menu -->
    <nav class="nav-menu" :class="{ open: isOpen }">
      <div class="nav-header">
        <h2>PURCH</h2>
        <button class="close-btn" @click="closeMenu" aria-label="Close menu">
          Close
        </button>
      </div>
      
      <ul class="nav-links">
        <li>
          <router-link to="/" @click="closeMenu" class="nav-link">
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/inventories" @click="closeMenu" class="nav-link">
            Inventory
          </router-link>
        </li>
        <li>
          <router-link to="/orders" @click="closeMenu" class="nav-link">
            Order Management
          </router-link>
        </li>
        <li>
          <router-link to="/orders/house" @click="closeMenu" class="nav-link">
            House Orders
          </router-link>
        </li>
        <li>
          <router-link to="/invoices" @click="closeMenu" class="nav-link">
            Invoices
          </router-link>
        </li>
        <li>
          <router-link to="/vendors" @click="closeMenu" class="nav-link">
            Vendors
          </router-link>
        </li>
        <li>
          <router-link to="/items" @click="closeMenu" class="nav-link">
            Products
          </router-link>
        </li>
        <li>
          <router-link to="/settings" @click="closeMenu" class="nav-link">
            Settings
          </router-link>
        </li>
      </ul>

      <div class="nav-footer">
        <button class="logout-btn" @click="handleLogout">
          Logout
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  closeMenu();
  router.push('/auth');
};
</script>

<style scoped>
.mobile-nav {
  position: relative;
  z-index: 1000;
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger span {
  width: 100%;
  height: 3px;
  background: #f391e3;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.nav-menu {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.nav-menu.open {
  right: 0;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
  background: #3d008d;
  color: white;
}

.nav-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.nav-links li {
  border-bottom: 1px solid #f8f9fa;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #2c3e50;
  text-decoration: none;
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
  border-right: 3px solid #3d008d;
}

.nav-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  width: 24px;
  text-align: center;
}

.nav-footer {
  padding: 1.5rem;
  border-top: 1px solid #ecf0f1;
}

.logout-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
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

@media (min-width: 769px) {
  .mobile-nav {
    display: none;
  }
}
</style>
