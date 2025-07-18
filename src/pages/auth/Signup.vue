<template>
  <div class="signup-container">
    <div class="signup-form">
      <h1 class="signup-title">Create Your Account</h1>

      <form @submit.prevent="register">
        <div class="input-group">
          <input
            type="text"
            placeholder="Full Name"
            v-model.trim="formData.name"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="input-group">
          <input
            type="email"
            placeholder="Email Address"
            v-model.trim="formData.email"
            required
            :disabled="isLoading"
            @blur="validateEmail"
          />
          <span v-if="emailError" class="error-label">{{ emailError }}</span>
        </div>

        <div class="input-group">
          <input
            type="text"
            placeholder="Country"
            v-model="formData.country"
            disabled
          />
        </div>

        <div class="phone-input">
          <input
            type="text"
            placeholder="Code"
            v-model="countryCode"
            class="code-input"
            disabled
          />
          <input
            type="tel"
            placeholder="Phone Number (e.g., 712345678)"
            v-model.trim="formData.phoneNumber"
            class="phone-number"
            required
            :disabled="isLoading"
            @blur="validatePhone"
          />
          <span v-if="phoneError" class="error-label">{{ phoneError }}</span>
        </div>

        <div class="input-group password-group">
          <input
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password (min 8 characters)"
            v-model.trim="formData.password"
            required
            :disabled="isLoading"
            minlength="8"
          />
          <button
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility"
            :disabled="isLoading"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <button
          type="submit"
          class="signup-button"
          :disabled="isLoading || !formValid"
          :class="{ loading: isLoading }"
        >
          <template v-if="!isLoading">REGISTER</template>
          <template v-else>
            <LoadingSpinner size="small" />
            Processing...
          </template>
        </button>

        <div v-if="errorMessage" class="error-message">
          <i class="icon-error"></i>
          {{ errorMessage }}
        </div>

        <div class="login-redirect">
          Already have an account?
          <router-link 
            :to="{ name: 'login', query: $route.query }" 
            class="login-link"
          >
            Login here
          </router-link>
        </div>
      </form>
    </div>

    <!-- Full‑screen loader -->
    <div v-if="isLoading" class="fullscreen-loader">
      <LoadingSpinner size="large" />
      <p class="loader-message">Creating your account...</p>
    </div>
  </div>
</template>
<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #2ecc71, #1abc9c);
  padding: 1rem;
  position: relative;
}

.signup-form {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 1;
}

.signup-title {
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  color: #2c3e50;
}

.input-group {
  margin-bottom: 1rem;
  position: relative;
}

input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.phone-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.code-input {
  width: 25%;
  text-align: center;
  border-radius: 8px;
}

.phone-number {
  width: 75%;
  border-radius: 8px;
}

.password-group {
  position: relative;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #00bbff;
  font-weight: bold;
  cursor: pointer;
}

.signup-button {
  background: #00bbff;
  color: white;
  font-weight: bold;
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  margin-top: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.signup-button.loading {
  pointer-events: none;
}

.signup-button:disabled {
  background: #a2dff8;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  background: #fdecea;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-label {
  color: #e74c3c;
  font-size: 0.85rem;
  display: block;
  text-align: left;
  margin-top: 0.25rem;
}

.login-redirect {
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: #444;
}

.login-link {
  color: #00bbff;
  font-weight: bold;
  margin-left: 0.25rem;
  text-decoration: underline;
}

/* Full‑screen loader overlay */
.fullscreen-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  gap: 1rem;
}

.loader-message {
  color: #2c3e50;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 480px) {
  .signup-form {
    padding: 1.5rem;
  }

  input, .signup-button {
    font-size: 0.95rem;
  }

  .signup-title {
    font-size: 1.5rem;
  }
}
</style>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Query } from 'appwrite';
import { account, ID, db, DATABASE_ID, COLLECTION_IDS } from '../../utils/appwrite';
import LoadingSpinner from '../../components/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();

// Defaults
const DEFAULT_COUNTRY = 'Kenya';
const DEFAULT_COUNTRY_CODE = '+254';
const DEFAULT_REGION = 'Nairobi';
const DEFAULT_CITY = 'Nairobi';

// State
const isLoading = ref(false);
const errorMessage = ref('');
const emailError = ref('');
const phoneError = ref('');
const countryCode = ref(DEFAULT_COUNTRY_CODE);
const countryId = ref('');
const userId = ref('');
const showPassword = ref(false);

// Form Data
const formData = ref({
  name: '',
  email: '',
  phoneNumber: '',
  password: '',
  country: DEFAULT_COUNTRY,
  region: DEFAULT_REGION,
  city: DEFAULT_CITY,
  ip: 'Unknown'
});

// Computed validation
const formValid = computed(() => {
  return (
    formData.value.name.trim().length >= 2 &&
    !emailError.value &&
    !phoneError.value &&
    formData.value.password.trim().length >= 8
  );
});

// Field validations
const validateEmail = () => {
  if (!formData.value.email) {
    emailError.value = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    emailError.value = 'Please enter a valid email';
  } else {
    emailError.value = '';
  }
};

const validatePhone = () => {
  const phone = formData.value.phoneNumber.replace(/\D/g, '');
  if (!phone) {
    phoneError.value = 'Phone number is required';
  } else if (!/^0[17]\d{8}$/.test(phone)) {
    phoneError.value = 'Enter a valid Kenyan phone number';
  } else {
    phoneError.value = '';
  }
};

const cleanPhone = () => {
  const raw = formData.value.phoneNumber.trim().replace(/\D/g, '');
  const code = countryCode.value.replace('+', '');
  return raw.startsWith('0') 
    ? `+${code}${raw.slice(1)}` 
    : `+${raw}`;
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Location data
const fetchLocationData = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    formData.value = {
      ...formData.value,
      country: data.country_name || DEFAULT_COUNTRY,
      region: data.region || DEFAULT_REGION,
      city: data.city || DEFAULT_CITY,
      ip: data.ip || 'Unknown'
    };
  } catch {
    // Use defaults if fetch fails
  }
};

// Get country data
const getCountryId = async () => {
  try {
    const res = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.COUNTRIES,
      [Query.equal('country_name', DEFAULT_COUNTRY)]
    );
    if (res.documents.length > 0) {
      const country = res.documents[0];
      countryId.value = country.$id;
      countryCode.value = country.calling_code 
        ? `+${country.calling_code}` 
        : DEFAULT_COUNTRY_CODE;
    }
  } catch (err) {
    console.warn('Country data:', err.message);
  }
};

// Registration process
const register = async () => {
  errorMessage.value = '';
  validateEmail();
  validatePhone();
  
  if (!formValid.value) {
    errorMessage.value = 'Please correct the form errors';
    return;
  }

  isLoading.value = true;

  try {
    // 1. Create Appwrite account
    const uniqueId = ID.unique();
    await account.create(
      uniqueId, 
      formData.value.email, 
      formData.value.password, 
      formData.value.name
    );
    
    // 2. Create session
    await account.createEmailSession(
      formData.value.email, 
      formData.value.password
    );
    
    // 3. Get user ID
    const user = await account.get();
    userId.value = user.$id;
    
    // 4. Create user profile document
    await db.createDocument(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      userId.value,
      {
        name: formData.value.name.trim(),
        email: formData.value.email.toLowerCase().trim(),
        phone_number: cleanPhone(),
        country_id: countryId.value,
        country: formData.value.country,
        region: formData.value.region,
        city: formData.value.city,
        user_id: userId.value,
        ip_address: formData.value.ip,
      }
    );
    
    // Redirect to home or original destination
    const redirectPath = route.query.redirect || '/';
    router.replace(redirectPath);
    
  } catch (err) {
    errorMessage.value = getErrorMessage(err);
    console.error('Registration error:', err);
  } finally {
    isLoading.value = false;
  }
};

// Error handling
const getErrorMessage = (error) => {
  if (error.type === 'user_already_exists') {
    return 'This email is already registered';
  }
  if (error.message.includes('network')) {
    return 'Network error. Please check your connection';
  }
  return error.message || 'Registration failed. Please try again.';
};

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchLocationData(),
    getCountryId()
  ]);
});
</script>