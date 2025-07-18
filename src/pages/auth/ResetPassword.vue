<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1 class="auth-title">Reset Password</h1>

      <input
        v-model="newPassword"
        type="password"
        placeholder="New Password"
        class="auth-input"
        @keyup.enter="resetPassword"
      />

      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        class="auth-input"
        @keyup.enter="resetPassword"
      />

      <button class="auth-button" @click="resetPassword" :disabled="loading">
        {{ loading ? 'Resetting...' : 'Reset Password' }}
      </button>

      <p v-if="message" class="message success">{{ message }}</p>
      <p v-if="error" class="message error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { account } from './../../utils/appwrite';

const route = useRoute();
const router = useRouter();

const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);

const userId = route.query.userId;
const secret = route.query.secret;

const resetPassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Please fill in both password fields.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  if (!userId || !secret) {
    error.value = 'Invalid or expired reset link.';
    return;
  }

  loading.value = true;
  error.value = '';
  message.value = '';

  try {
    await account.updateRecovery(userId, secret, newPassword.value, confirmPassword.value);
    message.value = 'Password reset successful. Redirecting to login...';
    setTimeout(() => router.push('/login'), 3000);
  } catch (err) {
    error.value = 'Failed to reset password. Please try again.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #2ecc71, #1abc9c);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.auth-box {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.auth-title {
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  color: #2c3e50;
}

.auth-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.auth-button:disabled {
  background-color: #85c1e9;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  font-size: 0.95rem;
}

.success {
  color: #27ae60;
}

.error {
  color: #e74c3c;
}

/* Mobile */
@media (max-width: 480px) {
  .auth-box {
    padding: 1.5rem;
  }
}
</style>