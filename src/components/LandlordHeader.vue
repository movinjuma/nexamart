<template>
  <header class="tab-header">
    <div class="tab-header-container">
      <div class="brand" @click="navigate('home')">
        <img :src="Logo" alt="Housika Logo" class="logo" />
      </div>

      <button class="hamburger" @click="drawerOpen = true">
        ☰
      </button>
    </div>

    <!-- Drawer Menu -->
    <div class="drawer-overlay" v-if="drawerOpen" @click.self="drawerOpen = false">
      <nav class="drawer">
        <button class="close-btn" @click="drawerOpen = false">✕</button>
        <div
          class="drawer-link"
          :class="{ active: isActive('dashboard') }"
          @click="navigate('dashboard')"
        >
          Dashboard
        </div>
        <div
          class="drawer-link"
          :class="{ active: isActive('managelistings') }"
          @click="navigate('managelistings')"
        >
          Manage
        </div>
        <div
          class="drawer-link"
          :class="{ active: isActive('add') }"
          @click="navigate('add')"
        >
          Add Listing
        </div>
        <div
          class="drawer-link"
          :class="{ active: isActive('bookings') }"
          @click="navigate('bookings')"
        >
          Bookings
        </div>
        <div
          class="drawer-link"
          :class="{ active: isActive('receipt') }"
          @click="navigate('receipt')"
        >
          Receipt
        </div>
      </nav>
    </div>
  </header>
</template>
<style scoped>
.tab-header {
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tab-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo {
  height: 40px;
  width: auto;
}

.hamburger {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;
  line-height: 1;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  z-index: 9999;
}

.drawer {
  background: #fff;
  width: 250px;
  max-width: 80%;
  padding: 1rem;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.25s ease-out;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.3rem;
  align-self: flex-end;
  cursor: pointer;
}

.drawer-link {
  font-size: 1rem;
  padding: 0.6rem;
  cursor: pointer;
  border-radius: 6px;
  color: #2d3748;
  transition: background 0.2s ease;
}

.drawer-link:hover {
  background-color: #f0f4f8;
}

.drawer-link.active {
  background-color: #2b6cb0;
  color: white;
}
</style>
<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Logo from './../assets/final logo.png';

const router = useRouter();
const route = useRoute();

const drawerOpen = ref(false);

// Active class check based on route name
const isActive = (name) => route.name === name;

// Navigation by named route
const navigate = (name) => {
  router.push({ name });
  drawerOpen.value = false;
};
</script>