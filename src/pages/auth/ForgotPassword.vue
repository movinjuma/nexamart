<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1 class="auth-title">Forgot Password</h1>
      <p class="auth-subtitle">Enter your email to receive a password reset link</p>

      <form @submit.prevent="requestReset">
        <div class="input-group">
          <input
            v-model.trim="email"
            type="email"
            placeholder="Enter your email address"
            class="auth-input"
            :class="{ 'input-error': emailError }"
            :disabled="loading"
            required
          />
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <button 
          type="submit" 
          class="auth-button" 
          :disabled="loading || !emailValid"
          :class="{ 'loading': loading }"
        >
          <span v-if="!loading">Send Reset Link</span>
          <span v-else>
            <i class="spinner"></i> Sending...
          </span>
        </button>
      </form>

      <div v-if="message" class="success-message">
        <i class="icon-success"></i>
        <span>{{ message }}</span>
      </div>

      <div v-if="error" class="error-message">
        <i class="icon-error"></i>
        <span>{{ error }}</span>
      </div>

      <div class="login-redirect">
        Remembered your password? 
        <span @click="navigateToLogin" class="login-link">Login here</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { account } from './../../utils/appwrite';

const router = useRouter();
const email = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');
const emailError = ref('');

const emailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
});

const validateEmail = () => {
  if (!email.value) {
    emailError.value = 'Email is required';
    return false;
  }
  if (!emailValid.value) {
    emailError.value = 'Please enter a valid email';
    return false;
  }
  emailError.value = '';
  return true;
};

const requestReset = async () => {
  error.value = '';
  message.value = '';
  
  if (!validateEmail()) return;

  loading.value = true;

  try {
    await account.createRecovery(
      email.value, 
      `${window.location.origin}/resetpassword` // Dynamic reset URL
    );
    message.value = 'Password reset link sent! Check your email inbox.';
  } catch (err) {
    console.error('Recovery error:', err);
    
    if (err.type === 'user_not_found') {
      error.value = 'No account found with this email';
    } else if (err.message.includes('rate limit')) {
      error.value = 'Too many attempts. Please try again later.';
    } else {
      error.value = 'Failed to send reset link. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

const navigateToLogin = () => {
  router.push({ name: 'login' });
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
  padding: 2.5rem;
  border-radius: 12px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.auth-title {
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  color: #2c3e50;
  font-weight: 600;
}

.auth-subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.auth-input {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: border-color 0.3s ease;
}

.auth-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.input-error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: block;
}

.auth-button {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.auth-button:disabled:not(.loading) {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-message {
  color: #27ae60;
  background: #e8f8f0;
  border-radius: 8px;
  padding: 0.875rem;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-message {
  color: #e74c3c;
  background: #fdecea;
  border-radius: 8px;
  padding: 0.875rem;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.icon-success {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #27ae60;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
}

.icon-error {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #e74c3c;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
}

.login-redirect {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: #666;
}

.login-link {
  color: #3498db;
  font-weight: 600;
  margin-left: 0.25rem;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
}

.login-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .auth-box {
    padding: 1.75rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
  
  .auth-input, .auth-button {
    padding: 0.75rem;
  }
}
</style>