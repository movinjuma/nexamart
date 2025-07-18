<template>
  <div class="success-page">
    <img :src="successImage" alt="Success" class="success-image" />
    <h2>🎉 Booking Successful!</h2>
    <p class="message">{{ message }}</p>

    <router-link to="/" class="home-button">
      🏠 Go Home
    </router-link>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import successImage from './../../assets/gold icons/success.png'; // Adjust path as needed

const route = useRoute();
const message = route.query.message || 'Thank you! Your booking is confirmed.';
</script>

<style scoped>
.success-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  min-height: 80vh;
  background-color: #f9fdfb;
}

.success-image {
  max-width: 200px;
  margin-bottom: 1.5rem;
}

h2 {
  color: #27ae60;
  margin-bottom: 1rem;
}

.message {
  font-size: 1.1rem;
  color: #333;
  max-width: 400px;
}

.home-button {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.home-button:hover {
  background-color: #219150;
}
</style>