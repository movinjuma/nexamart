<template>
  <div class="booking-confirmation">
    <!-- Progress Steps -->
    <div class="progress-steps">
      <div class="step active">
        <div class="step-number">1</div>
        <div class="step-label">Details</div>
      </div>
      <div class="step-divider"></div>
      <div class="step" :class="{ active: property }">
        <div class="step-number">2</div>
        <div class="step-label">Application</div>
      </div>
      <div class="step-divider"></div>
      <div class="step" :class="{ active: processing }">
        <div class="step-number">3</div>
        <div class="step-label">Payment</div>
      </div>
    </div>

    <!-- Property Card -->
    <div v-if="property" class="property-card">
      <div class="property-image-container">
        <img 
          v-if="property.thumbnail_url"
          :src="property.thumbnail_url" 
          :alt="property.thumbnail_url"
          class="thumbnail_url"
        />
        <div v-else class="property-image-placeholder">
          <span class="material-icons">home</span>
        </div>
        <div class="property-badge">
          {{ property.category }}
        </div>
      </div>

      <div class="property-details">
        <h3>{{ property.property_name }}</h3>
        <div class="property-meta">
          <div class="meta-item">
            <span class="material-icons">location_on</span>
            {{ property.exact_location || property.location }}
          </div>
          <div class="meta-item">
            <span class="material-icons">calendar_today</span>
            {{ formatDate(property.$createdAt) }}
          </div>
        </div>

        <div class="price-section">
          <div class="price-amount">
            {{ property.currency }} {{ property.amount.toLocaleString() }}
            <span v-if="property.period">/ {{ property.period }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading property details...</p>
    </div>

    <!-- Application Form -->
    <div v-if="property" class="application-form">
      <h3 class="form-title">Booking Information</h3>

      <!-- Landlord Contact Section -->
      <div v-if="isPlotCategory" class="landlord-contact">
        <div class="section-header">
          <span class="material-icons">contact_mail</span>
          <h4>Landlord Contact</h4>
        </div>
        <div class="contact-grid">
          <div class="contact-item">
            <span class="material-icons">person</span>
            <div>
              <div class="contact-label">Name</div>
              <div class="contact-value">{{ landlord?.name || 'Not available' }}</div>
            </div>
          </div>
          <div class="contact-item">
            <span class="material-icons">email</span>
            <div>
              <div class="contact-label">Email</div>
              <div class="contact-value">{{ landlord?.email || 'Not available' }}</div>
            </div>
          </div>
          <div class="contact-item">
            <span class="material-icons">phone</span>
            <div>
              <div class="contact-label">Phone</div>
              <div class="contact-value">{{ landlord?.phone_number || 'Not available' }}</div>
            </div>
          </div>
        </div>
        <button @click="contactLandlord" class="contact-button">
          <span class="material-icons">chat</span>
          Contact Landlord
        </button>
      </div>

      <!-- Room Booking Section -->
      <div v-else class="room-booking">
        <div class="form-group">
          <label for="room">Room/Unit Number</label>
          <div class="input-container">
            <input
              v-model="selectedRoom"
              id="room"
              type="text"
              placeholder="Enter room/unit number"
              @input="validateRoom"
              class="styled-input"
            />
          </div>
          <p v-if="roomError" class="error-message">{{ roomError }}</p>
        </div>

        <div class="booking-dates">
          <div class="form-group">
            <label>Start Date</label>
            <div class="date-container">
              <span class="material-icons">event</span>
              <input
                v-model="startDate"
                type="date"
                :min="today"
                @change="validateDates"
                class="styled-date"
              />
            </div>
          </div>
          <div class="form-group" v-if="isHotelOrLodging">
            <label>End Date</label>
            <div class="date-container">
              <span class="material-icons">event</span>
              <input
                v-model="endDate"
                type="date"
                :min="startDate || today"
                @change="validateDates"
                class="styled-date"
              />
            </div>
          </div>
          <p v-if="dateError" class="error-message">{{ dateError }}</p>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="payment-summary">
        <div class="section-header">
          <span class="material-icons">receipt</span>
          <h4>Payment Summary</h4>
        </div>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Application Fee</div>
            <div class="summary-value">{{ property.currency }} {{ applicationFee.toLocaleString() }}</div>
          </div>
          <div class="summary-item total">
            <div class="summary-label">Total Amount</div>
            <div class="summary-value">{{ property.currency }} {{ applicationFee.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          @click="handlePayment" 
          :disabled="processing || !isFormValid"
          class="pay-button"
        >
          <span v-if="processing" class="button-spinner"></span>
          <span v-else class="material-icons">payment</span>
          {{ processing ? 'Processing...' : `Pay ${property.currency} ${applicationFee.toLocaleString()}` }}
        </button>
        <button @click="cancel" class="cancel-button">
          <span class="material-icons">close</span>
          Cancel Application
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Previous styles remain the same, just add these new ones */

.input-container {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}

.styled-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.4rem;
  font-size: 1rem;
  outline: none;
}

/* Keep all existing styles below */
.booking-confirmation {
  padding: 1rem;
  max-width: 900px;
  margin: auto;
  font-family: 'Segoe UI', sans-serif;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 80px;
  text-align: center;
  color: #aaa;
}

.step.active {
  color: #2196f3;
}

.step-number {
  background: #eee;
  color: #2196f3;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.3rem;
  font-weight: bold;
}

.step.active .step-number {
  background: #2196f3;
  color: #fff;
}

.step-label {
  font-size: 0.85rem;
}

.step-divider {
  flex: none;
  width: 10px;
  height: 2px;
  background: #ccc;
}

/* Property Card */
.property-card {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  background: white;
}

.property-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
}

.thumbnail_url {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.property-image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f1f1f1;
  color: #888;
  height: 100%;
}

.property-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: #2196f3;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 5px;
}

/* Property Details */
.property-details {
  padding: 1rem;
}

.property-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.property-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #555;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Price Section */
.price-section {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: #2e7d32;
}

/* Loading */
.loading-state {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}

.loading-spinner {
  border: 4px solid #eee;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  margin: auto;
  animation: spin 1s linear infinite;
}

/* Application Form */
.application-form {
  margin-top: 1.5rem;
}

.form-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Contact Section */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9f9f9;
  padding: 0.75rem;
  border-radius: 6px;
}

.contact-label {
  font-size: 0.75rem;
  color: #777;
}

.contact-value {
  font-size: 0.95rem;
  font-weight: 500;
}

.contact-button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #2196f3;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Room Booking Section */
.form-group {
  margin-bottom: 1rem;
}

.date-container {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}

.styled-date {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.4rem;
  font-size: 1rem;
  outline: none;
}

/* Error Message */
.error-message {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

/* Payment Summary */
.payment-summary {
  margin-top: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  background: #f0f0f0;
  padding: 0.75rem;
  border-radius: 6px;
}

.summary-item.total {
  font-weight: bold;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pay-button,
.cancel-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.pay-button {
  background: #4caf50;
  color: white;
}

.pay-button:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}

.cancel-button {
  background: #e53935;
  color: white;
}

.button-spinner {
  border: 3px solid #fff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (min-width: 600px) {
  .contact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .action-buttons {
    flex-direction: row;
  }
}

@media (min-width: 900px) {
  .contact-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Spinner Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, COLLECTION_IDS, DATABASE_ID } from '../../utils/appwrite';
import { getUser } from '../../utils/auth';
import { Query, ID } from 'appwrite';
import { payWithPaystack } from '../../utils/paystack';

const route = useRoute();
const router = useRouter();
const propertyId = route.params.id;

const property = ref(null);
const landlord = ref(null);
const processing = ref(false);
const selectedRoom = ref('');
const roomError = ref('');
const userDocId = ref('');
const countryConfig = ref(null);
const startDate = ref('');
const endDate = ref('');
const today = new Date().toISOString().split('T')[0];
const dateError = ref('');

// Fee categories
const highFeeCategories = ['One Bedrooms', 'Two Bedrooms', 'Three Bedrooms'];
const plotCategories = ['Plot For Sale', 'Farming Land'];
const hotelAndLodgingCategories = ['Hotel Rooms', 'Lodging Rooms'];

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const isPlotCategory = computed(() => {
  const cat = property.value?.category || '';
  return plotCategories.includes(cat);
});

const isHighCategory = computed(() => {
  const cat = property.value?.category || '';
  return highFeeCategories.includes(cat);
});

const isHotelOrLodging = computed(() => {
  const cat = property.value?.category || '';
  return hotelAndLodgingCategories.includes(cat);
});

const applicationFee = computed(() => {
  if (!countryConfig.value) return 0;
  if (isPlotCategory.value) return countryConfig.value.application_fee_plot || 0;
  if (isHighCategory.value) return countryConfig.value.application_fee_high || 0;
  return countryConfig.value.application_fee_low || 0;
});

const isFormValid = computed(() => {
  if (isPlotCategory.value) return true;
  const validRoom = selectedRoom.value.trim() && !roomError.value;
  const validDates = startDate.value && (!isHotelOrLodging.value || (endDate.value && !dateError.value));
  return validRoom && validDates;
});

const fetchProperty = async () => {
  try {
    const res = await db.getDocument(DATABASE_ID, COLLECTION_IDS.PROPERTIES, propertyId);
    property.value = res;
    if (res.landlord_id) await fetchLandlord(res.landlord_id);

    // Set default start date
    startDate.value = today;

    // For hotel/lodging, set default end date (1 day later)
    if (isHotelOrLodging.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      endDate.value = tomorrow.toISOString().split('T')[0];
    }
  } catch (err) {
    console.error('Property load error:', err);
    router.push({ name: 'NotFound' });
  }
};

const fetchLandlord = async (landlordId) => {
  try {
    const res = await db.getDocument(DATABASE_ID, COLLECTION_IDS.USERS, landlordId);
    landlord.value = res;
  } catch (err) {
    console.error('Landlord fetch error:', err);
  }
};

const fetchUserCountryConfig = async () => {
  try {
    const user = await getUser(); // This returns Appwrite user object (with user.$id)
    
    // 🔍 Find the user document where user_id == user.$id
    const userDocQuery = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      [Query.equal('user_id', user.$id)]
    );

    if (userDocQuery.total === 0) {
      console.warn('User document not found in USERS collection.');
      return;
    }

    const userDoc = userDocQuery.documents[0];
    userDocId.value = userDoc.$id;

    if (userDoc.country_id) {
      const country = await db.getDocument(DATABASE_ID, COLLECTION_IDS.COUNTRIES, userDoc.country_id);
      countryConfig.value = country;
    } else {
      console.warn('country_id not found in user document.');
    }
  } catch (err) {
    console.error('Failed to fetch user or country config:', err);
  }
};


const validateRoom = () => {
  const name = selectedRoom.value.trim();
  if (!name) {
    roomError.value = '';
    return;
  }
  if (name.length < 2) {
    roomError.value = 'Room name must be at least 2 characters';
    return;
  }
  const booked = property.value?.booked_units || [];
  roomError.value = booked.includes(name) ? 'This room is already booked' : '';
};

const validateDates = async () => {
  if (!startDate.value || (isHotelOrLodging.value && !endDate.value)) return;

  if (isHotelOrLodging.value && startDate.value > endDate.value) {
    endDate.value = startDate.value;
    dateError.value = 'End date cannot be before start date';
    return;
  }

  if (isHotelOrLodging.value && selectedRoom.value.trim()) {
    try {
      const bookings = await db.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.BOOKINGS,
        [
          Query.equal('property_id', propertyId),
          Query.equal('room', selectedRoom.value.trim()),
          Query.lessThanEqual('start_date', endDate.value),
          Query.greaterThanEqual('end_date', startDate.value)
        ]
      );

      dateError.value = bookings.total > 0 ? 'Room is booked for selected dates' : '';
    } catch (err) {
      console.error('Error checking bookings:', err);
      dateError.value = 'Error checking availability';
    }
  } else {
    dateError.value = '';
  }
};

const handlePayment = async () => {
  if (processing.value || !isFormValid.value) return;
  processing.value = true;

  try {
    const user = await getUser();
    const paymentAmount = applicationFee.value;

    const paymentResult = await payWithPaystack({
      email: user.email,
      amount: paymentAmount,
      name: user.name || 'Customer',
      currency: property.value.currency || 'KES',
      propertyId,
      room: selectedRoom.value.trim(),
      landlordId: landlord.value?.$id || ''
    });

    if (!paymentResult.success) throw new Error(paymentResult.message || 'Payment failed');

    const bookingData = {
      property_id: propertyId,
      property_ame: property.value.property_name,
      tenant_id: user.$id,
      tenant_name: user.name || 'Tenant',
      start_date: startDate.value,
      end_date: isHotelOrLodging.value ? endDate.value : null,
      room: selectedRoom.value.trim(),
      status: 'active',
      amount: paymentAmount,
      currency: property.value.currency,
      payment_reference: paymentResult.reference,
      landlord_id: landlord.value?.$id || '',
      created_id: new Date().toISOString()
    };

    await db.createDocument(DATABASE_ID, COLLECTION_IDS.BOOKINGS, ID.unique(), bookingData);

   router.push({
  name: 'success',
  query: {
    message: 'Booking Successful! Your room has been reserved.',
    ref: paymentResult.reference,
    propertyId: propertyId
  }
});


  } catch (err) {
    console.error('Application failed:', err);
    router.push({
      name: 'failed',
      params: { id: propertyId },
      query: { message: err.message || 'Payment failed' }
    });
  } finally {
    processing.value = false;
  }
};

const contactLandlord = () => {
  if (!landlord.value?.$id) return;
  router.push({
    name: 'chatroom',
    query: {
      landlordId: landlord.value.$id,
      propertyId: propertyId
    }
  });
};

const cancel = () => {
  router.push({ name: 'details', params: { id: propertyId } });
};

onMounted(() => {
  fetchProperty();
  fetchUserCountryConfig(); // ✅ Now countryConfig will be fetched correctly
});
</script>