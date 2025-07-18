<template>
  <div class="header-container">
    <!-- Mobile Header -->
    <div class="mobile-header">
      <div class="header-row">
        <div class="controls">
          <button class="hamburger" @click="drawerOpen = true">
            <img :src="menu" alt="Menu">
          </button>
          
          <div class="brand" @click="router.push({ name: 'home' })">
            <img :src="Logo" alt="Housika Logo" class="logo" />
          </div>
        </div>

        <div class="action-icons">
          <img :src="favorite" @click="navigateTo('favorite')" alt="Favorites">
          <img :src="chat" @click="navigateTo('chatlist')" alt="Chat">
          <img :src="profile" @click="navigateTo('profile')" alt="Profile">
        </div>
      </div>
    </div>
      
    <!-- Mobile Menu Drawer -->
    <transition name="slide">
      <div class="menu-drawer" v-if="drawerOpen" @click.self="drawerOpen = false">
        <div class="drawer-content">
          <div class="drawer-header">
            <h3 @click="navigateTo('home')">Menu</h3>
            <button @click="drawerOpen = false" class="close-btn">×</button>
          </div>
          
          <div @click="navigateTo('home')" class="link-item">
            <span>Home</span>
          </div>
          
          <div class="drawer-section">
            <h4 class="section-title">Categories</h4>
            <div class="category-list">
              <div 
                v-for="category in categories" 
                :key="category" 
                @click="navigateToCategory(category)" 
                class="category-item"
                :class="{ 'active': isCategoryActive(category) }"
              >
                <span>{{ category }}</span>
              </div>
            </div>
          </div>
          
          <div class="drawer-section">
            <h4 class="section-title">Quick Links</h4>
            <div class="quick-links">
              <div @click="navigateTo('dashboard')" class="link-item">
                <span>Landlord Portal</span>
              </div>
              <div @click="navigateTo('add')" class="link-item">
                <span>Add Property</span>
              </div>
              <div @click="navigateTo('housika')" class="link-item">
                <span>Contact Us</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Logo from './../assets/final logo.png';
import menu from './../assets/gold icons/menu icon.png';
import chat from './../assets/gold icons/chat.png';
import profile from './../assets/gold icons/profile.png';
import favorite from './../assets/gold icons/favorite.png';

const router = useRouter();
const route = useRoute();
const drawerOpen = ref(false);

// Simplified categories array
const categories = ref([
  'Single Rooms',
  'Bedsitter Units',
  'Student Rooms',
  'One Bedroom',
  'Two Bedrooms',
  'Three Bedrooms',
  'Lodging Rooms',
  'Hotel Rooms',
  'Business Spaces',
  'Office Spaces',
  'Plot For Sale',
  'Farming Land'
]);

// Check if current route matches category
const isCategoryActive = (category) => {
  return route.params.category === category;
};

// Navigation methods using router names
const navigateTo = (routeName) => {
  router.push({ name: routeName });
  drawerOpen.value = false;
};

const navigateToCategory = (category) => {
  router.push({ 
    name: 'filter', 
    params: { category: category},
    query: { ...route.query }
  });
  drawerOpen.value = false;
};
</script>

<style scoped>
.header-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.mobile-header {
  position: relative;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  height: 60px;
}

.controls {
  display: flex;
  margin-left: 0px;
}

.brand {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-grow: 1;
  justify-content: center;
}

.logo {
  height: 40px;
  width: auto;
}

.hamburger {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-right: 1rem;
}

.hamburger img {
  width: 24px;
  height: 24px;
}

.action-icons {
  display: flex;
  gap: 1rem;
  margin-left: 1rem;
}

.action-icons img {
  width: 22px;
  height: 22px;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-icons img:hover {
  transform: scale(1.1);
}

/* Menu Drawer */
.menu-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
  justify-content: flex-start;
}

.drawer-content {
  width: 80%;
  max-width: 300px;
  height: 100%;
  background-color: #ffffff;
  overflow-y: auto;
  padding: 1rem;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}

.drawer-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
}

.drawer-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-list, .quick-links {
  display: flex;
  flex-direction: column;
}

.category-item, .link-item {
  padding: 0.8rem 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 0.95rem;
}

.category-item:hover, .link-item:hover {
  background-color: #f5f5f5;
}

/* Active category style */
.category-item.active {
  background-color: #fff5f0;
  color: #ff5400;
  font-weight: 600;
}

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Desktop Styles */
@media (min-width: 1024px) {
  .mobile-header {
    padding: 0 2rem;
  }
  
  .header-row {
    height: 70px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .action-icons img {
    width: 24px;
    height: 24px;
  }
  
  .drawer-content {
    width: 25%;
  }
}
</style>