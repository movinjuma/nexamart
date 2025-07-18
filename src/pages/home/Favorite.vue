<template>
  <div class="favorites-page">
    <h2>Your Favorites</h2>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="favorites.length === 0" class="empty">No favorites saved yet.</div>

    <div v-else class="property-grid">
      <div
        v-for="property in favorites"
        :key="property.$id"
        class="property-card"
        @click="goToDetails(property.$id)"
      >
        <img :src="property.thumbnail_url || banner" alt="property" />
        <div class="property-info">
          <h3>{{ property.property_name }}</h3>
          <p>{{ property.location }}</p>
          <p><strong>{{ property.currency }} {{ property.amount }}</strong> / {{ property.period }}</p>
          <p class="category">{{ property.category }}</p>
          <p class="status" :class="property.status">{{ property.status }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.favorites-page {
  padding: 1rem;
  max-width: 1200px;
  margin: auto;
}
.property-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, 1fr);
}
.property-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}
.property-card:hover {
  transform: scale(1.02);
}
.property-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.property-info {
  padding: 0.7rem;
}
.category {
  font-size: 13px;
  color: #888;
}
.status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 5px;
}
.status.active {
  background-color: #e6f7ee;
  color: #00a65a;
}
.status.inactive {
  background-color: #fde8e8;
  color: #f44336;
}
.empty {
  text-align: center;
  padding: 2rem;
  font-style: italic;
}
.loading {
  text-align: center;
  padding: 2rem;
}
@media (min-width: 600px) {
  .property-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 900px) {
  .property-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, account, COLLECTION_IDS, DATABASE_ID } from './../../utils/appwrite';
import { Query } from 'appwrite';
import banner from './../../assets/banners images/house2.jpg';

const router = useRouter();
const loading = ref(true);
const favorites = ref([]);

// Utility to split array into chunks (e.g., for batching queries)
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// Fetch favorites from user's profile
const fetchFavorites = async () => {
  loading.value = true;
  try {
    const user = await account.get();

    // Get user document
    const res = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.USERS, [
      Query.equal('user_id', user.$id)
    ]);

    if (!res.documents.length) throw new Error('User profile not found');

    const userDoc = res.documents[0];
    const favoriteIds = userDoc.favorites || [];

    if (!favoriteIds.length) {
      favorites.value = [];
      return;
    }

    // Fetch property documents in chunks
    const propertyChunks = chunkArray(favoriteIds, 10);
    const allResults = await Promise.all(
      propertyChunks.map(ids =>
        db.listDocuments(DATABASE_ID, COLLECTION_IDS.PROPERTIES, [
          Query.equal('$id', ids)
        ])
      )
    );

    // Flatten and format property data
    favorites.value = allResults.flatMap(r =>
      r.documents.map(property => ({
        $id: property.$id,
        property_name: property.property_name,
        category: property.category,
        location: property.location,
        exact_location: property.exact_location,
        country: property.country,
        thumbnail_url: property.thumbnail_url,
        currency: property.currency || 'KES',
        amount: property.amount,
        period: property.period,
        status: property.status || 'active',
        created_at: property.created_at
      }))
    );

  } catch (err) {
    console.error('Failed to fetch favorites:', err.message);
    favorites.value = [];
  } finally {
    loading.value = false;
  }
};

// Navigate to property details page and pass propertyName as query
const goToDetails = (property) => {
  router.push({
    path: `/details/${property.$id}`,
    query: {
      propertyName: property.property_name
    }
  });
};

onMounted(fetchFavorites);
</script>