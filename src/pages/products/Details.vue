<template>
  <div v-if="state.isLoading" class="loading">
    <div class="loading-spinner"></div>
    <p>Loading property details...</p>
  </div>
  <div v-else-if="!state.property" class="error">
    <svg viewBox="0 0 24 24" width="48" height="48">
      <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    </svg>
    <h3>Property not found</h3>
    <button @click="navigate.back" class="back-button">Go Back</button>
  </div>
  <div v-else class="property-details">
    <!-- Header with back, name and favorite -->
    <div class="header">
      <button @click="handleBack" class="icon-button" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h2>{{ state.property.property_name || 'Property' }}</h2>
      <button @click="handleFavorite.toggle" class="icon-button" aria-label="Favorite">
        <svg v-if="state.isFavorite" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09 C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
          <path d="M12.1 21.55l-1.1-1.01C5.14 15.24 2 12.36 2 8.5 2 5.5 4.5 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.5 3 22 5.5 22 8.5c0 3.86-3.14 6.74-8.9 12.04z"/>
        </svg>
      </button>
    </div>

    <!-- Image Gallery or Video -->
    <div class="media-container">
      <video
        v-if="state.property.video_url"
        class="property-video"
        controls
        controlsList="nodownload"
        :src="state.property.video_url"
      ></video>
      <div v-else class="image-gallery">
        <img 
          :src="state.currentImage || state.property.thumbnail_url || banner" 
          alt="Property image" 
          class="main-image"
          loading="lazy"
        />
        <div class="thumbnails" v-if="state.property.room_images?.length">
          <img 
            v-for="(img, index) in state.property.room_images" 
            :key="index"
            :src="img"
            @click="state.currentImage = img"
            :class="{ active: state.currentImage === img }"
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="info-section">
      <div class="info">
        <div class="info-item">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div>
            <h3>{{ state.property.exact_location }} {{ state.property.location }}</h3>
            <p>{{ state.property.country }}</p>
          </div>
        </div>

        <div class="info-item">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
          </svg>
          <div>
            <p class="price">
              {{ state.property.currency }} {{ state.property.amount?.toLocaleString() }} 
              <span v-if="state.property.period">/ {{ state.property.period }}</span>
            </p>
            <p class="posted-date">Posted: {{ formatDate(state.property.$createdAt) }}</p>
          </div>
        </div>

        <div class="info-item" v-if="state.property.institution_name">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
          <p>{{ state.property.institution_name }}</p>
        </div>

        <div class="info-item">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
          </svg>
          <p>{{ state.property.description || 'No description provided' }}</p>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="contact-info" v-if="showLandlordInfo">
        <h4>Contact Information</h4>
        <div class="contact-item">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <p>{{ state.property.email || 'No email provided' }}</p>
        </div>
        <div class="contact-item">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          <p>{{ state.property.phone_number || 'No phone number provided' }}</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="msg" @click="navigate.toChat">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
        Chat
      </button>
      <button class="cta" @click="navigate.confirm">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        {{ actionLabel }}
      </button>
    </div>

    <!-- Related Properties -->
    <div class="related" v-if="state.related.length > 0">
      <h4>Related Properties</h4>
      <div class="property-grid">
        <div
          v-for="relatedProperty in state.related"
          :key="relatedProperty.$id"
          class="card"
          @click="navigate.toProperty(relatedProperty.$id)"
        >
          <div class="card-image-wrapper">
            <img :src="relatedProperty.thumbnail_url || banner" alt="Property image" loading="lazy" />
          </div>
          <div class="card-info">
            <p class="property-location">📍 {{ relatedProperty.exact_location }} {{ relatedProperty.location }}</p>
            <p class="property-price">
              {{ relatedProperty.currency }} {{ relatedProperty.amount.toLocaleString() }}
              <span v-if="relatedProperty.period">/ {{ relatedProperty.period }}</span>
            </p>
            <p class="posted-date">Posted: {{ formatDate(relatedProperty.$createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* AliExpress Inspired Design System */
:root {
  --primary: #FF6A00; /* AliExpress orange */
  --primary-hover: #E55C00;
  --secondary: #FF9000;
  --accent: #FF6A00;
  --text: #333333;
  --text-light: #666666;
  --bg: #FFFFFF;
  --card-bg: #FFFFFF;
  --border-radius: 4px; /* AliExpress uses smaller radius */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Base Layout */
.property-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  color: var(--text);
}

/* Header - Compact for child page */
.header {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  background: var(--bg);
  border-bottom: 1px solid #f0f0f0;
}

.header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

/* Media Container - YouTube-like video sizing */
.media-container {
  margin: 0;
  width: 100%;
  background: #000;
}

.property-video {
  width: 100%;
  height: 210px; /* Slightly taller than mobile YouTube */
  background: #000;
}

.property-video video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Image Gallery - Compact and functional */
.image-gallery {
  width: 100%;
}

.main-image {
  width: 100%;
  height: 210px;
  object-fit: cover;
  background: #f5f5f5;
}

.thumbnails {
  display: flex;
  gap: 8px;
  padding: 8px;
  overflow-x: auto;
}

.thumbnails img {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #eee;
}

/* Info Section - Compact layout */
.info-section {
  padding: 12px;
}

.info-item, .contact-item {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.info-item svg, .contact-item svg {
  flex-shrink: 0;
  color: var(--accent);
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary);
}

/* AliExpress-style action buttons */
.actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  position: sticky;
  bottom: 0;
  background: var(--bg);
  border-top: 1px solid #f0f0f0;
}

.actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.msg {
  background: #f5f5f5;
  color: var(--text);
}

.msg:hover {
  background: #eee;
}

.cta {
  background: var(--primary);
  color: white;
}

.cta:hover {
  background: var(--primary-hover);
}

/* Related Properties - Compact grid */
.related {
  padding: 12px;
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.card-image-wrapper {
  width: 100%;
  height: 120px;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  padding: 8px;
}

.property-price {
  font-size: 14px;
  color: var(--primary);
  font-weight: bold;
  margin: 4px 0;
}

/* Responsive Adjustments */
@media (min-width: 640px) {
  .property-video,
  .main-image {
    height: 360px;
  }
  
  .property-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .media-container {
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  
  .info-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
    padding: 16px;
  }
  
  .property-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .actions {
    position: static;
    border-top: none;
    padding: 16px;
  }
}

/* Loading and Error States */
.loading, .error {
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  border: 3px solid rgba(0,0,0,0.1);
  border-top-color: var(--primary);
  width: 30px;
  height: 30px;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
  border-radius: 50%;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error svg {
  width: 40px;
  height: 40px;
  color: #ff4d4f;
  margin-bottom: 12px;
}

.back-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  margin-top: 12px;
}
</style>
<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, account, DATABASE_ID, COLLECTION_IDS } from '../../utils/appwrite';
import { Query, ID } from 'appwrite';
import banner from '../../assets/banners images/house2.jpg';

// Router and route setup
const route = useRoute();
const router = useRouter();
const propertyId = route.params.id;

// Reactive state
const state = reactive({
  property: null,
  currentImage: null,
  related: [],
  isFavorite: false,
  userId: '',
  userDocId: '',
  isLoading: true,
  error: null
});

// Computed properties
const showLandlordInfo = computed(() => {
  const category = state.property?.category;
  return category === 'Farming Land' || category === 'Plot For Sale';
});

const actionLabel = computed(() => {
  const cat = state.property?.category || '';
  if (cat.includes('Household')) return 'Buy Now';
  if (cat.includes('Hotel') || cat.includes('Lodging')) return 'Book Now';
  return 'Rent Now';
});

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// User related functions
const fetchCurrentUser = async () => {
  try {
    const user = await account.get();
    state.userId = user.$id;

    const res = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.USERS, [
      Query.equal('user_id', user.$id)
    ]);

    if (res.documents.length) {
      state.userDocId = res.documents[0].$id;
      return res.documents[0];
    }
    throw new Error('User profile not found');
  } catch (error) {
    console.error('Failed to fetch user:', error);
    state.error = 'Failed to fetch user information';
    return null;
  }
};

const handleFavorite = {
  check: async () => {
    try {
      const userDoc = await fetchCurrentUser();
      if (!userDoc) return;
      state.isFavorite = (userDoc.favorites || []).includes(propertyId);
    } catch (error) {
      console.error('Favorite check failed:', error);
      state.error = 'Failed to check favorite status';
    }
  },
  toggle: async () => {
    try {
      const userDoc = await fetchCurrentUser();
      if (!userDoc) {
        router.push({ name: 'login', query: { redirect: route.fullPath } });
        return;
      }

      const currentFavorites = userDoc.favorites || [];
      const updatedFavorites = state.isFavorite
        ? currentFavorites.filter(id => id !== propertyId)
        : [...currentFavorites, propertyId];

      await db.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        state.userDocId,
        { favorites: updatedFavorites }
      );

      state.isFavorite = !state.isFavorite;
    } catch (error) {
      console.error('Favorite toggle failed:', error);
      alert(`Failed to update favorites: ${error.message}`);
    }
  }
};

// Chat functions
const chatService = {
  init: async () => {
    try {
      const user = await account.get().catch((error) => {
        console.error('Authentication error:', error);
        router.push({ name: 'login', query: { redirect: route.fullPath } });
        return null;
      });
      
      if (!user) {
        alert('Please login to start a chat');
        return;
      }

      if (!state.property?.landlord_id) {
        alert('This property has no landlord information available for chat');
        return;
      }

      const existingChat = await chatService.findExistingChat(user.$id);
      if (existingChat) return;

      await chatService.createNewChat(user.$id);
    } catch (error) {
      console.error('Chat initialization failed:', error);
      alert(`Failed to initialize chat: ${error.message}`);
    }
  },

  findExistingChat: async (userId) => {
    try {
      const res = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.CHATS, [
        Query.equal('user_id', userId),
        Query.equal('property_id', propertyId),
        Query.limit(1)
      ]);

      if (res.total > 0) {
        router.push({ name: 'chatroom', params: { id: res.documents[0].$id } });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error finding existing chat:', error);
      throw error;
    }
  },

  createNewChat: async (userId) => {
    try {
      const chatroom = await db.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.CHATS,
        ID.unique(),
        {
          user_id: userId,
          landlord_id: state.property.landlord_id,
          property_id: propertyId,
          property_name: state.property.property_name,
          messages: [],
          status: 'active',
          created_at: new Date().toISOString()
        }
      );

      router.push({ name: 'chatroom', params: { id: chatroom.$id } });
    } catch (error) {
      console.error('Error creating new chat:', error);
      throw error;
    }
  }
};

// Property data functions
const propertyService = {
  fetch: async () => {
    try {
      state.isLoading = true;
      state.error = null;
      const res = await db.getDocument(DATABASE_ID, COLLECTION_IDS.PROPERTIES, propertyId);
      state.property = res;
      state.currentImage = res.thumbnail_url || banner;

      await propertyService.checkUserFavorite();
      await propertyService.fetchRelated(res.category, res.$id);
    } catch (error) {
      console.error('Property fetch failed:', error);
      state.error = 'Failed to load property details';
      router.push({ name: 'NotFound' });
    } finally {
      state.isLoading = false;
    }
  },

  checkUserFavorite: async () => {
    try {
      await account.get();
      await handleFavorite.check();
    } catch (error) {
      console.log('User not logged in, skipping favorite check');
    }
  },

  fetchRelated: async (category, excludeId) => {
    try {
      const res = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.PROPERTIES, [
        Query.equal('category', category),
        Query.equal('status', 'active'),
        Query.notEqual('$id', excludeId),
        Query.limit(12)
      ]);

      state.related = res.documents.map(doc => ({
        ...doc,
        thumbnail_url: doc.thumbnail_url || banner
      }));
    } catch (error) {
      console.error('Related properties fetch failed:', error);
      state.error = 'Failed to load related properties';
    }
  }
};

// Navigation functions
const navigate = {
  back: () => router.go(-1),
  confirm: () => router.push({ name: 'confirm', params: { id: propertyId } }),
  toProperty: (id) => router.push({ name: 'details', params: { id } }),
  toChat: () => chatService.init()
};

// Lifecycle
onMounted(() => {
  if (propertyId) {
    propertyService.fetch();
  } else {
    console.error('No property ID found in route');
    state.error = 'Invalid property ID';
    router.push({ name: 'NotFound' });
  }
});
</script>