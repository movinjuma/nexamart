<template>
  <div class="homepage">
    <!-- Loading Spinner or Message -->
    <div v-if="isLoading" class="loading-container">
      <p class="loading-text">Loading properties, please wait...</p>
    </div>

    <div v-else>
      <!-- Banner Section -->
      <Banners :banner-images="bannerImages" />

      <!-- Search Bar -->
      <div class="search-wrapper">
        <form class="search-form" @submit.prevent="goToSearch">
          <input
            v-model="searchText"
            type="search"
            placeholder="Search properties..."
            aria-label="Search"
            @keyup.enter="goToSearch"
          />
          <button type="submit" class="search-button">
            <img :src="searchIcon" alt="Search Icon" />
          </button>
        </form>
      </div>

      <!-- Categories -->
      <section class="category-section">
        <h2 class="section-title">Discover Properties</h2>

        <div
          v-for="category in categories"
          :key="category.name"
          class="category-group"
        >
          <header class="category-header">
            <h3>{{ category.displayName }}</h3>
            <button
              @click="navigateToFilter(category.name)"
              class="see-all"
            >
              See All
            </button>
          </header>

          <div class="property-grid">
            <template v-if="category.properties.length > 0">
              <div
                v-for="property in category.properties"
                :key="property.$id"
                class="card"
                @click="navigateToDetails(property.$id)"
              >
                <div class="card-image-wrapper">
                  <img :src="property.thumbnail_url || banner" alt="Property image" />
                </div>
                <div class="card-info">
                  <p class="property-location">
                    📍 {{ property.exact_location }} {{ property.location }}
                  </p>
                  <p class="property-price">
                    {{ property.currency }} {{ property.amount.toLocaleString() }}
                    <span v-if="property.period">/ {{ property.period }}</span>
                  </p>
                  <p class="posted-date">
                    Posted: {{ formatDate(property.$createdAt) }}
                  </p>
                </div>
              </div>
            </template>
            <template v-else>
              <p class="no-properties">No properties available in this category</p>
            </template>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  </div>
</template>
<style scoped>
:root {
  --primary-color: #ff5e00;
  --bg-light: #f0ffff;
  --text-dark: #222;
  --text-muted: #666;
  --border-color: #eee;
  --radius: 12px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 6px 20px rgba(0, 0, 0, 0.12);
  --font-main: 'Segoe UI', sans-serif;
}

/* Add these new styles for distance badge */
.card-image-wrapper {
  position: relative;
}
/* Keep all existing styles below */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
}

.loading-text {
  font-size: 1.2rem;
  color: #666;
}

.no-properties {
  padding: 1rem;
  color: #999;
  font-style: italic;
}

.homepage {
  font-family: var(--font-main);
  background-color: #ffffff;
  padding-bottom: 0.2rem;
}

/* Search Bar */
.search-wrapper {
  width: 96%;
  margin: 0.5rem auto;
}

.search-form {
  display: flex;
  border: 2px solid #ff5400;
  border-radius: 10px;
  overflow: hidden;
  background: white;
}

.search-form input {
  flex: 1;
  padding: 0.8rem;
  font-size: 1rem;
  border: none;
  outline: none;
}

.search-button {
  background: #ff5400;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button img {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

/* Section Titles */
.section-title {
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  font-weight: bold;
  text-align: center;
  margin: 1rem 0 0.5rem;
}

/* Category Header */
.category-header {
  display: flex;
  justify-content: space-between;
  margin: 0.3rem 0 0.3rem;
  padding: 0 0.5rem;
}

.category-header h3 {
  font-size: clamp(1rem, 2.2vw, 1.3rem);
  font-weight: 600;
}

.see-all {
  background: none;
  border: none;
  color: #ff5400;
  cursor: pointer;
  font-weight: 600;
  font-size: clamp(0.85rem, 2vw, 1rem);
}

/* Grid Layout (Responsive) */
.property-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 0.5rem;
}

.card {
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
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
  aspect-ratio: 4/3;
}

.card-info {
  padding: 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.property-location {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.property-price {
  font-size: 1rem;
  font-weight: bold;
  color: var(--primary-color);
}

.posted-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Responsive Layouts */
@media (min-width: 768px) {
  .property-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .property-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
  
  .card-image-wrapper {
    height: 190px;
  }
  
  .distance-badge {
    font-size: 0.85rem;
    padding: 5px 10px;
  }
}

.loading,
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.no-results img {
  width: 80px;
  opacity: 0.5;
  margin-bottom: 0rem;
}
</style>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Query } from 'appwrite';
import { db, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite.js';
import search from './../../assets/gold icons/search.png';
import Banners from './../../components/Banners.vue';
import Footer from './../../components/Footer.vue';

const router = useRouter();
const searchText = ref('');
const searchIcon = search;
const bannerImages = ref([]);
const isLoading = ref(true);
const userLocation = ref(null);

// Predefined categories
const categories = ref([
  { name: 'Single Rooms', displayName: 'Single Rooms', properties: [] },
  { name: 'Bedsitter Units', displayName: 'Bedsitter Units', properties: [] },
  { name: 'Students Rooms', displayName: 'Students Rooms', properties: [] },
  { name: 'One Bedrooms', displayName: 'One Bedroom', properties: [] },
  { name: 'Two Bedrooms', displayName: 'Two Bedrooms', properties: [] },
  { name: 'Three Bedrooms', displayName: 'Three Bedrooms', properties: [] },
  { name: 'Lodging Rooms', displayName: 'Lodging Rooms', properties: [] },
  { name: 'Hotel Rooms', displayName: 'Hotel Rooms', properties: [] },
  { name: 'Business Spaces', displayName: 'Business Spaces', properties: [] },
  { name: 'Office Spaces', displayName: 'Office Spaces', properties: [] },
  { name: 'Plot For Sale', displayName: 'Plots Sale', properties: [] },
  { name: 'Farming Land', displayName: 'Farming Land', properties: [] }
]);

// Navigation methods
const navigateToFilter = (categoryName) => {
  router.push({ name: 'filter', params: { category: categoryName } });
};

const navigateToDetails = (id) => {
  router.push({ name: 'details', params: { id } });
};

const goToSearch = () => {
  const trimmedSearch = searchText.value.trim();
  if (trimmedSearch) {
    router.push({ name: 'search', params: { searchText: trimmedSearch } });
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Geolocation functions
const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }),
      error => reject(error),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Data fetching with geolocation filtering
const fetchPropertiesByCategory = async (categoryName) => {
  try {
    const response = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.PROPERTIES,
      [
        Query.equal('category', categoryName),
        Query.equal('status', 'active'),
        Query.limit(12),
        Query.orderDesc('$createdAt')
      ]
    );

    let properties = response.documents;
    
    // If we have user location, calculate distances
    if (userLocation.value) {
      properties = properties.map(property => {
        if (property.latitude && property.longitude) {
          return {
            ...property,
            distance: calculateDistance(
              userLocation.value.lat,
              userLocation.value.lng,
              property.latitude,
              property.longitude
            )
          };
        }
        return property;
      }).sort((a, b) => {
        // Sort properties with distance first
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return 0;
      });
    }

    return properties.slice(0, 8); // Return top 8 properties
  } catch (err) {
    console.error(`Error fetching properties for ${categoryName}:`, err);
    return [];
  }
};

const fetchBanners = async () => {
  try {
    const response = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.BANNERS,
      [Query.limit(5), Query.orderDesc('$createdAt')]
    );
    bannerImages.value = response.documents.map(doc => doc.banner_url);
  } catch (err) {
    console.error('Failed to fetch banners:', err);
  }
};

// Initialize with geolocation
onMounted(async () => {
  isLoading.value = true;
  
  try {
    // Try to get location first
    userLocation.value = await getLocation();
  } catch (error) {
    console.log('Geolocation not available or denied:', error);
  }

  // Fetch data in parallel
  await Promise.all([
    fetchBanners(),
    ...categories.value.map(async (category) => {
      category.properties = await fetchPropertiesByCategory(category.name);
    })
  ]);

  isLoading.value = false;
});

// Display distance if available
const formatDistance = (distance) => {
  if (!distance) return '';
  return distance < 1 
    ? `${(distance * 1000).toFixed(0)} m away` 
    : `${distance.toFixed(1)} km away`;
};
</script>