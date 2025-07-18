<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or might have been moved.</p>
      <button @click="router.push(`/`)" class="home-button">
        <i class="fas fa-home"></i> Go Back Home
      </button>
    </div>
  </div>
</template>
<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f9f9f9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
}

.content {
  max-width: 500px;
}

h1 {
  font-size: 6rem;
  color: #d32f2f;
  margin: 0;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.home-button {
  padding: 0.75rem 1.5rem;
  background-color: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.home-button:hover {
  background-color: #1565c0;
}
</style>
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>