<template>
  <div class="dashboard">
    <h2>Overview</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ listingsCount }}</h3>
        <p>Active Listings</p>
      </div>
      <div class="stat-card">
        <h3>{{ totalBookings }}</h3>
        <p>Total Bookings</p>
      </div>
      <div class="stat-card">
        <h3>{{ formatCurrency(totalIncome) }}</h3>
        <p>Income</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
}

.dashboard h2 {
  font-size: 1.7rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.stats-grid {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 0.5rem 0.5rem;
  width: 180px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  font-size: 2.1rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.3rem;
}

.stat-card p {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .stat-card {
    width: 100%;
    max-width: 300px;
  }

  .dashboard h2 {
    font-size: 1.5rem;
  }

  .stat-card h3 {
    font-size: 1.8rem;
  }
}
</style>
<script setup>
import { ref, onMounted } from 'vue';
import { Query } from 'appwrite';
import { db, account, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite';

const listingsCount = ref(null); // Initialize as null to detect loading state
const totalBookings = ref(null);
const totalIncome = ref(null);
const isLoading = ref(true);
const error = ref(null);

function formatCurrency(value) {
  if (value === null) return 'Loading...';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(value);
}

async function fetchDashboardStats() {
  try {
    isLoading.value = true;
    error.value = null;
    
    const user = await account.get();

    // Fetch user profile to get correct user document ID
    const userDocs = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.USERS, [
      Query.equal('user_id', user.$id)
    ]);

    if (!userDocs.documents.length) {
      throw new Error('User profile not found');
    }

    const userDoc = userDocs.documents[0];

    // Fetch all data in parallel for better performance
    const [listingsRes, bookingsRes] = await Promise.all([
      db.listDocuments(DATABASE_ID, COLLECTION_IDS.PROPERTIES, [
        Query.equal('landlord_id', userDoc.$id)
      ]),
      db.listDocuments(DATABASE_ID, COLLECTION_IDS.BOOKINGS, [
        Query.equal('landlord_id', userDoc.$id)
      ])
    ]);

    // Update stats
    listingsCount.value = listingsRes.documents.length;
    totalBookings.value = bookingsRes.documents.length;
    
    // Calculate income
    totalIncome.value = bookingsRes.documents.reduce((sum, booking) => {
      return sum + (parseFloat(booking.amount) || 0);
    }, 0);

  } catch (err) {
    console.error('Dashboard error:', err);
    error.value = err.message;
    // Reset values to 0 instead of null when there's an error
    listingsCount.value = 0;
    totalBookings.value = 0;
    totalIncome.value = 0;
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchDashboardStats);
</script>