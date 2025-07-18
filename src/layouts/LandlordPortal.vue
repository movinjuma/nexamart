<template>
  <div class="layout-wrapper">
    <Header />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>
<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Optional: reset header margin */
.header {
  margin: 0;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
<script setup>
import Header from './../components/LandlordHeader.vue';
import { RouterView } from 'vue-router';
</script>