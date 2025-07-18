<template>
  <div class="app">
    <Header />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import Header from './../components/Header.vue';
</script>