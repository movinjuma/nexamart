<template>
  <div class="login">
    <div class="form">
      <h1>Login</h1>

      <form @submit.prevent="login">
        <div class="input-group">
          <input
            type="email"
            v-model="email"
            placeholder="Email"
            :class="{ 'input-error': emailError }"
          />
          <span v-if="emailError" class="error-label">{{ emailError }}</span>
        </div>

        <div class="input-group">
          <input
            type="password"
            v-model="password"
            placeholder="Password"
            :class="{ 'input-error': passwordError }"
          />
          <span v-if="passwordError" class="error-label">{{ passwordError }}</span>
        </div>

        <div v-if="errorMessage" class="error-message">
          <span class="icon-error" /> {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading" class="loading">
            <LoadingSpinner /> Logging in...
          </span>
          <span v-else>Login</span>
        </button>
      </form>

      <button class="f-password" @click="navigateToForgotPassword">
        Forgot password?
      </button>

      <div class="signup-redirect">
        Don't have an account?
        <button class="btn" @click="navigateToSignup">Sign Up</button>
      </div>
    </div>

    <div v-if="isLoading" class="fullscreen-loader">
      <div class="loader-content">
        <LoadingSpinner />
        <p class="overlay-message">{{ overlayMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { account } from '../../utils/appwrite';
import LoadingSpinner from '../../components/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();

// State
const email = ref('');
const password = ref('');
const emailError = ref('');
const passwordError = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const overlayMessage = ref('');
const redirectPath = ref('/');

// On mount: get redirect query param
onMounted(() => {
  if (route.query.redirect) {
    redirectPath.value = route.query.redirect;
  }
});

// Clear form errors
const clearErrors = () => {
  emailError.value = '';
  passwordError.value = '';
  errorMessage.value = '';
};

// Validate form
const validateForm = () => {
  clearErrors();
  let valid = true;

  if (!email.value.trim()) {
    emailError.value = 'Email is required';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address';
    valid = false;
  }

  if (!password.value) {
    passwordError.value = 'Password is required';
    valid = false;
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters';
    valid = false;
  }

  return valid;
};

// Login handler
const login = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  overlayMessage.value = 'Logging you in...';
  clearErrors();

  try {
    await account.createEmailSession(email.value, password.value);
    
    // Verify the session was created successfully
    const session = await account.getSession('current');
    if (!session) throw new Error('Session creation failed');

    overlayMessage.value = 'Login successful! Redirecting...';
    
    // Use router.replace() to prevent back navigation to login
    setTimeout(() => {
      router.replace(redirectPath.value);
    }, 1200);
  } catch (err) {
    console.error('Login error:', err);
    errorMessage.value = getErrorMessage(err);
  } finally {
    isLoading.value = false;
  }
};

// Error message handling
const getErrorMessage = (error) => {
  if (error.type === 'user_invalid_credentials') {
    return 'Invalid email or password';
  }
  if (error.type === 'user_blocked') {
    return 'Account is temporarily blocked';
  }
  if (error.message.includes('network')) {
    return 'Network error. Please check your connection';
  }
  return error.message || 'Login failed. Please try again.';
};

// Navigation methods - using named routes for better maintainability
const navigateToSignup = () => {
  router.push({ name: 'signup', query: { redirect: redirectPath.value } });
};

const navigateToForgotPassword = () => {
  router.push({ name: 'forgotpassword', query: { email: email.value } });
};
</script>

<style scoped>
/* Your existing styles remain unchanged */
.fullscreen-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.85);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overlay-message {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 500;
  text-align: center;
}

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #2ecc71, #1abc9c);
}

.form {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

h1 {
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #2c3e50;
  font-weight: 600;
}

form {
  margin-bottom: 1rem;
}

.input-group {
  margin-bottom: 1.25rem;
  text-align: left;
}

input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.input-error {
  border-color: #e74c3c;
}

.error-label {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.4rem;
  display: block;
}

.error-message {
  color: #e74c3c;
  background: #fdecea;
  border-radius: 8px;
  padding: 0.875rem;
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.icon-error {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-color: #e74c3c;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
}

.login-button {
  width: 100%;
  padding: 0.875rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.login-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.f-password {
  background: none;
  border: none;
  color: #2980b9;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-decoration: underline;
  padding: 0.5rem;
}

.f-password:hover {
  color: #1a5276;
}

.signup-redirect {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.signup-redirect .btn {
  background: none;
  border: none;
  color: #2c3e50;
  font-weight: bold;
  margin-left: 0.4rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.25rem;
}

.signup-redirect .btn:hover {
  color: #1a252f;
}

@media (max-width: 480px) {
  .form {
    padding: 1.75rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  input,
  .login-button {
    font-size: 0.95rem;
    padding: 0.75rem;
  }

  .f-password,
  .signup-redirect {
    font-size: 0.85rem;
  }
}
</style>