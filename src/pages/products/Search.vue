<template>
  <div class="search-page">
    <!-- 🔍 Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        @input="handleSearchInput" 
        type="text" 
        placeholder="Search properties by location..." 
      />
      <button @click="fetchResults">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>

    <!-- 🔘 Filter Buttons -->
    <div class="filter-row">
      <button 
        v-for="filter in filters" 
        :key="filter.id"
        @click="applyFilter(filter.id)"
        :class="{ active: activeFilter === filter.id }"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchResults">Try Again</button>
    </div>

    <!-- 🏠 Property Grid -->
    <div class="results">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading properties...</p>
      </div>

      <div v-else-if="results.length === 0" class="no-results">
        <img :src="serror" alt="No results" />
        <h3>No properties found</h3>
        <p>Try adjusting your search or filters</p>
      </div>

      <div v-else class="grid">
        <div
          v-for="property in filteredProperties"
          :key="property.$id"
          class="card"
          @click="viewProperty(property.$id)"
        >
          <div class="card-image-wrapper">
            <img 
              :src="property.thumbnail_url || placeholderImage" 
              alt="Property image"
              @error="handleImageError"
            />
          </div>
          <div class="card-info">
            <p class="property-location">📍 {{ property.exact_location || property.location }}</p>
            <p class="property-price">
              {{ property.currency }} {{ formatPrice(property.amount) }}
              <span v-if="property.period">/ {{ property.period }}</span>
            </p>
            <p class="posted-date">Posted: {{ formatDate(property.$createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.search-page {
  max-width: 1400px;
  margin: auto;
  padding: 0.5rem;
  font-family: 'Segoe UI', sans-serif;
}

/* Search */
.search-bar {
  display: flex;
  margin-bottom: 0.75rem;
  border: 2px solid #ff5400;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.search-bar input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: none;
  font-size: 1rem;
  outline: none;
}
.search-bar button {
  background: #ff5400;
  color: white;
  border: none;
  padding: 0 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-bar button svg {
  stroke: white;
}
.search-page {
  max-width: 1400px;
  margin: auto;
  padding: 0.5rem;
  font-family: 'Segoe UI', sans-serif;
}

.search-bar {
  display: flex;
  margin-bottom: 0.75rem;
  border: 2px solid #ff5400;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
/* Filter */
.filter-row {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.35rem;
}
.filter-row::-webkit-scrollbar {
  display: none;
}
.filter-row button {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: #ff5400;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.filter-row button.active {
  background: #fff;
  color: #ff5400;
  border-color: #ff5400;
  font-weight: 600;
}
.filter-row button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
}
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Card */
.card {
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.card-image-wrapper {
  width: 100%;
  height: auto;
  overflow: hidden;
}
.card-image-wrapper img {
  width: 100%;
  height: auto;
  object-fit: cover;
}
.card-info {
  padding: 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.property-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}
.property-location {
  font-size: 0.85rem;
  color: #666;
}
.property-price {
  font-size: 1rem;
  font-weight: bold;
  color: #ff5400;
}
.posted-date {
  font-size: 0.75rem;
  color: #888;
}

/* Error & Loaders */
.loading, .no-results {
  text-align: center;
  padding: 2rem;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff5400;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: auto;
}
@keyframes spin {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}
.no-results img {
  width: 100px;
  margin-bottom: 1rem;
  opacity: 0.6;
}
.no-results h3 {
  color: #333;
}
.no-results p {
  color: #777;
}

/* Error message box */
.error-message {
  background: #ffeeee;
  color: #d32f2f;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.error-message button {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.error-message button:hover {
  background: #b71c1c;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Query } from 'appwrite';
import { debounce } from 'lodash';
import { db, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite';
import placeholderImage from './../../assets/banners images/house2.jpg';
import serror from './../../assets/gold icons/serror.png';

const router = useRouter();
const searchQuery = ref('');
const activeFilter = ref('');
const loading = ref(false);
const results = ref([]);
const error = ref('');
const userLocation = ref('Nairobi');

// Filters with dynamic location integration
const filters = ref([
  { id: 'recent', label: 'Recent', query: Query.orderDesc('$createdAt') },
  { id: 'cheap', label: 'Affordable', query: Query.lessThanEqual('amount', 10000) },
  { id: 'classy', label: 'Premium', query: Query.greaterThanEqual('amount', 50000) },
  { id: 'available', label: 'Available', query: Query.greaterThan('units_available', 0) },
  { id: 'nearby', label: `Near ${userLocation.value}`, query: Query.search('location', userLocation.value) }
]);

// Computed filter logic based on selected filter
const filteredProperties = computed(() => {
  return results.value.filter(property => {
    if (!activeFilter.value) return true;

    switch (activeFilter.value) {
      case 'cheap':
        return property.amount <= 10000;
      case 'classy':
        return property.amount >= 50000;
      case 'available':
        return property.units_available > 0;
      case 'nearby':
        return property.location?.toLowerCase().includes(userLocation.value.toLowerCase());
      default:
        return true;
    }
  });
});

const formatPrice = (amount) => {
  return amount?.toLocaleString?.('en-US') || '0';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const handleImageError = (event) => {
  event.target.src = placeholderImage;
};

const sanitizeInput = (input) => {
  return input?.replace?.(/[^\w\s\-.,]/gi, '').trim().toLowerCase() || '';
};

const detectLocation = async () => {
  try {
    if (navigator.geolocation) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      userLocation.value = 'Near You'; // Ideally, reverse geocode here
      updateNearbyFilter();
    } else {
      await detectLocationByIP();
    }
  } catch {
    await detectLocationByIP();
  }
};

const detectLocationByIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    userLocation.value = data.city || 'Nairobi';
  } catch {
    userLocation.value = 'Nairobi';
  } finally {
    updateNearbyFilter();
  }
};

const updateNearbyFilter = () => {
  const nearbyFilter = filters.value.find(f => f.id === 'nearby');
  if (nearbyFilter) {
    nearbyFilter.label = `Near ${userLocation.value}`;
    nearbyFilter.query = Query.search('location', userLocation.value);
  }
};

const fetchResults = async () => {
  try {
    loading.value = true;
    error.value = '';
    results.value = [];

    const queries = [Query.equal('status', 'active'), Query.limit(50)];

    const sanitized = sanitizeInput(searchQuery.value);
    if (sanitized) {
      queries.push(Query.or([
        Query.search('property_name', sanitized),
        Query.search('location', sanitized),
        Query.search('exact_location', sanitized),
        Query.search('description', sanitized)
      ]));
    }

    if (activeFilter.value) {
      const filter = filters.value.find(f => f.id === activeFilter.value);
      if (filter) queries.push(filter.query);
    }

    const response = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.PROPERTIES,
      queries
    );

    results.value = response.documents.map(property => ({
      ...property,
      thumbnail_url: property.thumbnail_url || placeholderImage,
      amount: property.amount || 0
    }));
  } catch (err) {
    console.error('Search error:', err);
    error.value = 'Failed to load properties. Please try again.';
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = debounce(fetchResults, 500);
const handleSearchInput = () => debouncedSearch();

const applyFilter = (filterId) => {
  activeFilter.value = activeFilter.value === filterId ? '' : filterId;
  fetchResults();
};

const viewProperty = (propertyId) => {
  router.push({ name: 'details', params: { id: propertyId } });
};

onMounted(() => {
  detectLocation();
  fetchResults();
});

onUnmounted(() => {
  debouncedSearch.cancel();
});
</script>