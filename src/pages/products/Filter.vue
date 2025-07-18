<template>
  <div class="filter-page">
    <!-- Header -->
    <div class="header">
      <button @click="router.back()" class="icon-button">
        <img :src="back" alt="Back" />
      </button>
      <h2 class="category-title">{{ category }}</h2>
    </div>

    <!-- Search & Filter Tags -->
    <div class="search-filter">
      <div class="search-box">
        <img :src="searchIcon" alt="search" />
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Search properties..."
        />
      </div>
      <div class="filter-tags">
        <button
          v-for="tag in ['Cheap','Classy','New','Near Me']"
          :key="tag"
          :class="{ active: activeFilter === tag }"
          @click="toggleFilter(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Geolocation Errors -->
    <div v-if="locationError" class="error-msg">{{ locationError }}</div>

    <!-- Property Grid -->
    <div v-if="!loading" class="property-grid">
      <div
        v-for="property in filteredProperties"
        :key="property.$id"
        class="card"
        @click="goToDetails(property.$id)"
      >
        <div class="card-image-wrapper">
          <img :src="property.thumbnail_url || banner" alt="Property image" />
        </div>
        <div class="card-info">
          <p class="property-location">📍 {{ property.exact_location }} {{ property.location }}</p>
          <p class="property-price">
            {{ property.currency }} {{ property.amount.toLocaleString() }}
            <span v-if="property.period">/ {{ property.period }}</span>
          </p>
          <p class="posted-date">Posted: {{ formatDate(property.$createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Loading or No Results -->
    <div v-if="loading" class="loading">Loading properties...</div>
    <div v-if="!loading && filteredProperties.length === 0" class="no-results">
      <img :src="searchError" alt="No results" />
      <p>No properties found.</p>
    </div>
  </div>
</template>
<style scoped>
.filter-page {
  padding: 0.3rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', sans-serif;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
}
.icon-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.icon-button img {
  width: 20px;
  height: 20px;
}
.category-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #333;
}

/* Search & Filters */
.search-filter {
  margin-bottom: 0.75rem;
}
.search-box {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  padding: 0.25rem 1rem;
  border-radius: 8px;
  border: 1.5px solid #ff5400;
}
.search-box img {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  opacity: 0.7;
}
.search-box input {
  border: none;
  background: transparent;
  flex: 1;
  outline: none;
  font-size: 0.95rem;
  padding: 0.3rem 0;
}
.filter-tags {
  margin-top: 0.7rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.filter-tags button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #e0e0e0;
  background: #ff5400;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
}
.filter-tags button:hover {
  background: #e04900;
}
.filter-tags button.active {
  background: #2ecc71;
  border-color: #27ae60;
}

/* Error */
.error-msg {
  margin: 0.5rem 0;
  color: #e74c3c;
  font-size: 0.9rem;
  padding: 0.5rem;
  background: #fdecea;
  border-radius: 4px;
}

/* Property Grid */
.property-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
.card {
  background: #fff;
  border-radius: 12px;
  background: #f5f5f5;
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
.view-button {
  margin-top: 0.5rem;
  padding: 0.45rem;
  background-color: #ff5400;
  color: white;
  font-size: 0.9rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}
.view-button:hover {
  background-color: #e04a00;
}

/* No Results & Loading */
.loading,
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}
.no-results img {
  width: 80px;
  opacity: 0.5;
  margin-bottom: 1rem;
}

/* Responsive Layouts */
@media (min-width: 640px) {
  .property-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .category-title {
    font-size: 1.6rem;
  }
}
@media (min-width: 1024px) {
  .property-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
  .category-title {
    font-size: 1.8rem;
  }
  .card-image-wrapper {
    height: 190px;
  }
}
</style>
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Query } from 'appwrite';
import { db, DATABASE_ID, COLLECTION_IDS, endpoint, projectId } from './../../utils/appwrite.js';
import searchIcon from './../../assets/gold icons/search.png';
import back from './../../assets/gold icons/back2.png';
import searchError from './../../assets/gold icons/serror.png';
import banner from './../../assets/banners images/house2.jpg';

const router = useRouter();
const route = useRoute();

const category = ref(route.params.category || 'Properties');
const searchQuery = ref('');
const activeFilter = ref('');
const loading = ref(true);
const filteredProperties = ref([]);
const errorDisplay = ref(false);
const userLocation = ref({ latitude: null, longitude: null });
const locationError = ref('');

const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getUserLocation = () => {
  locationError.value = '';
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        if (activeFilter.value === 'Near Me') fetchProperties();
      },
      error => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            locationError.value = "Location access denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            locationError.value = "Position unavailable.";
            break;
          case error.TIMEOUT:
            locationError.value = "Location request timed out.";
            break;
          default:
            locationError.value = "Unknown geo error.";
        }
        userLocation.value = { latitude: null, longitude: null };
        if (activeFilter.value === 'Near Me') fetchProperties();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    locationError.value = "Geolocation not supported.";
    if (activeFilter.value === 'Near Me') fetchProperties();
  }
};

const fetchProperties = async () => {
  loading.value = true;
  filteredProperties.value = [];
  errorDisplay.value = false;

  try {
    const queries = [
      Query.equal('category', category.value),
      Query.equal('status', 'active'), // Only fetch active properties
      Query.limit(100)
    ];

    if (searchQuery.value.trim()) {
      const kws = searchQuery.value.trim().split(/\s+/).map(k=>`"${k}"`).join(' ');
      queries.push(Query.or([
        Query.search('property_name', kws),
        Query.search('location', kws),
        Query.search('exact_location', kws),
        Query.search('description', kws)
      ]));
    }

    if (activeFilter.value === 'Cheap') {
      queries.push(Query.lessThan('amount', 10000), Query.orderAsc('amount'));
    } else if (activeFilter.value === 'Classy') {
      queries.push(Query.greaterThanEqual('amount', 50000), Query.orderDesc('amount'));
    } else if (activeFilter.value === 'New') {
      queries.push(Query.orderDesc('$createdAt'));
    }

    const res = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.PROPERTIES, queries);
    let props = res.documents.map(doc => ({
      ...doc,
      // Use thumbnail_url first, fall back to banner if not available
      thumbnail_url: doc.thumbnail_url || banner
    }));

    if (activeFilter.value === 'Near Me' && userLocation.value.latitude && userLocation.value.longitude) {
      props = props.filter(p => {
        if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
          return haversineDistance(userLocation.value.latitude, userLocation.value.longitude, p.latitude, p.longitude) <= 50;
        }
        return false;
      });
    }

    filteredProperties.value = props;
  } catch (e) {
    console.error(e);
    errorDisplay.value = true;
  } finally {
    loading.value = false;
  }
};

let debounceTimer = null;
const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchProperties, 300);
};
const goToDetails = (id) => {
  router.push({ name: 'details', params: { id } });
};

const toggleFilter = (tag) => {
  activeFilter.value = activeFilter.value === tag ? '' : tag;
  if (activeFilter.value === 'Near Me') {
    getUserLocation();
  } else {
    locationError.value = '';
    fetchProperties();
  }
};

watch(() => route.params.category, (newCat) => {
  category.value = newCat;
  searchQuery.value = '';
  activeFilter.value = '';
  locationError.value = '';
  fetchProperties();
});

onMounted(() => {
  getUserLocation();
  fetchProperties();
});
</script>