<template>
  <div class="manage-page">
    <h2>Manage Listings</h2>

    <div v-if="loading">Loading...</div>

    <div v-else-if="listings.length === 0" class="no-properties">
      <p>No properties available.</p>
      <button @click="addProperty">Add Property</button>
    </div>

    <div v-else class="list-grid">
      <div v-for="prop in listings" :key="prop.$id" class="list-card">
        <img :src="prop.thumbnail_url || fallbackImage" alt="Property Image" />
        <div class="info">
          <h3>{{ prop.property_name }}</h3>
          <p>{{ prop.location }}</p>
          <div class="actions">
            <button @click="goToEdit(prop.$id)">Edit</button>
            <button @click="confirmDelete(prop.$id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manage-page {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  padding: 0.5rem;
  justify-content: center;
  align-items: center;
}

h2 {
  font-size: 1.8rem;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.list-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.list-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.list-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
}

.list-card img {
  width: 100%;
  height: 170px;
  object-fit: cover;
}

.info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.3rem;
}

.info p {
  font-size: 0.95rem;
  color: #4a5568;
  margin: 0;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 0.5rem;
}

.actions button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.actions button:first-child {
  background: #3b82f6;
  color: white;
}

.actions button:first-child:hover {
  background: #2563eb;
}

.actions button:last-child {
  background: #ef4444;
  color: white;
}

.actions button:last-child:hover {
  background: #dc2626;
}

.no-properties {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-properties button {
  margin-top: 1rem;
  padding: 0.7rem 1.4rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.no-properties button:hover {
  background: #2563eb;
}

@media (max-width: 600px) {
  h2 {
    font-size: 1.5rem;
  }

  .list-card img {
    height: 150px;
  }

  .info h3 {
    font-size: 1.1rem;
  }

  .info p {
    font-size: 0.9rem;
  }
}
</style>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, account, storage, DATABASE_ID, COLLECTION_IDS, projectId, endpoint } from './../../utils/appwrite';
import { Query } from 'appwrite';

const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const fallbackImage = new URL('./../../assets/banners images/house2.jpg', import.meta.url).href;

async function fetchListings() {
  loading.value = true;
  try {
    const user = await account.get();
    const userDocs = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.USERS, [
      Query.equal('user_id', user.$id)
    ]);

    if (!userDocs.documents.length) throw new Error('User profile not found');
    const userDoc = userDocs.documents[0];

    const res = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.PROPERTIES, [
      Query.equal('landlord_id', userDoc.$id)
    ]);

    listings.value = res.documents;
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    listings.value = [];
    if (error.message.includes('Unauthorized')) {
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
}

function goToEdit(id) {
  router.push(`/landlord/editproperty/${id}`);
}

function addProperty() {
  router.push({ name: 'add' });
}

function extractFileIdFromUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `${endpoint}${url}`);
    const pathParts = urlObj.pathname.split('/');
    const fileIdIndex = pathParts.indexOf('files') + 1;
    return pathParts[fileIdIndex] || null;
  } catch (e) {
    console.warn('Error extracting file ID from URL:', e);
    return null;
  }
}

async function deleteFile(fileId) {
  if (!fileId) return;
  try {
    await storage.deleteFile(COLLECTION_IDS.BUCKET, fileId);
  } catch (error) {
    if (!error.message.includes('not found')) {
      console.warn(`Failed to delete file ${fileId}:`, error.message);
      throw error;
    }
  }
}

async function deleteAllPropertyFiles(property) {
  try {
    const fileUrls = [
      property.thumbnail_url,
      property.video_url,
      ...(property.room_images || []),
      ...(property.room_image_urls || [])
    ].filter(Boolean);

    await Promise.all(
      fileUrls.map(url => {
        const fileId = extractFileIdFromUrl(url);
        return fileId ? deleteFile(fileId) : Promise.resolve();
      })
    );
  } catch (error) {
    console.error('Error deleting property files:', error);
    throw error;
  }
}

async function confirmDelete(id) {
  if (!confirm('Are you sure you want to delete this listing and all its associated media?')) return;

  try {
    const doc = await db.getDocument(DATABASE_ID, COLLECTION_IDS.PROPERTIES, id);
    
    await deleteAllPropertyFiles(doc);
    await db.deleteDocument(DATABASE_ID, COLLECTION_IDS.PROPERTIES, id);
    
    listings.value = listings.value.filter(p => p.$id !== id);
    
    // Redirect to dynamic success page
    router.push({
      name: 'success',
      query: { 
        type: 'property_deletion',
        title: 'Property Deleted Successfully',
        message: 'Your property listing has been permanently removed.',
        actionText: 'View My Listings',
        actionRoute: '/landlord/managelistings'
      }
    });
  } catch (error) {
    console.error('Failed to delete listing:', error.message);
    
    // Redirect to dynamic failed page
    router.push({
      name: 'failed',
      query: {
        type: 'property_deletion',
        title: 'Deletion Failed',
        message: `We couldn't delete your property listing. ${error.message}`,
        actionText: 'Try Again',
        actionRoute: `/landlord/editproperty/${id}`
      }
    });
  }
}

onMounted(() => {
  fetchListings();
});
</script>