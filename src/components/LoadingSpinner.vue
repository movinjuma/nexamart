<template>
  <div class="loading-spinner" :class="size">
    <div class="spinner"></div>
    <span v-if="message" class="message">{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid var(--primary, #0d9488);
  animation: spin 1s linear infinite;
}

/* Size variations */
.small .spinner {
  width: 20px;
  height: 20px;
}

.medium .spinner {
  width: 30px;
  height: 30px;
}

.large .spinner {
  width: 50px;
  height: 50px;
  border-width: 4px;
}

/* Message styling */
.message {
  font-size: 0.9rem;
  color: var(--text-light, #7f8c8d);
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>