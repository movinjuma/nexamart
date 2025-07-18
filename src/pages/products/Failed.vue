<template>
  <div class="failed-page">
    <h2>❌ Booking Failed</h2>

    <p class="error-message">{{ error }}</p>

    <div v-if="code" class="error-code">
      <strong>Error Code:</strong> {{ code }}
    </div>

    <button @click="goHome" class="home-button">🏠 Go Home</button>
  </div>
</template>
<style scoped>
.failed-page {
  text-align: center;
  padding: 2rem;
  color: #c0392b;
  max-width: 600px;
  margin: 0 auto;
}

.error-message {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #e74c3c;
}

.error-code {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #888;
  background-color: #fdf2f2;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e0b4b4;
}

.home-button {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Extract dynamic error message and optional code from query params
const error = route.query.error || 'Something went wrong. Please try again.';
const code = route.query.code || '';

const goHome = () => router.push('/');
</script>