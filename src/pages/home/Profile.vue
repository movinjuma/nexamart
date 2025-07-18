<template>
  <div class="profile-page">
    <!-- Fullscreen Loader -->
    <div v-if="uploading" class="fullscreen-loader">
      <LoadingSpinner size="large" />
    </div>

    <div class="profile-header">
      <h1 class="page-title">Your Profile</h1>
      <p class="page-subtitle">Manage your listings, bookings & settings</p>
    </div>

    <div class="profile-main">
      <div class="profile-card">
        <div class="avatar-section">
          <img class="avatar" :src="userProfile.avatar || defaultAvatar" alt="Avatar" />
          <h2>{{ userProfile.name || 'Full Name' }}</h2>
          <p>{{ userProfile.email }}</p>
          <p>{{ userProfile.phone_number }}</p>
          <p>{{ userProfile.country }}</p>
          <button class="btn go-dashboard" @click="router.push('/dashboard')">
            <i class="fas fa-briefcase"></i> Landlord Dashboard
          </button>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat">
          <h3>{{ userProperties.length }}</h3>
          <p>Properties</p>
        </div>
        <div class="stat">
          <h3>12</h3>
          <p>Bookings</p>
        </div>
        <div class="stat">
          <h3>4.9</h3>
          <p>Rating</p>
        </div>
      </div>

      <div class="profile-actions">
        <button class="btn" @click="openEditProfileModal">Edit Profile</button>
        <button class="btn danger" @click="logout">Logout</button>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditProfileModal" class="modal-overlay" @click.self="closeEditProfileModal">
      <div class="modal">
        <h3>Edit Profile</h3>
        <input type="text" v-model="editProfile.name" placeholder="Full Name" />
        <input type="text" v-model="editProfile.phone_number" placeholder="Phone Number" />
        <input type="file" accept="image/*" @change="onAvatarChange" />
        <button class="btn" @click="saveProfile" :disabled="uploading">
          {{ uploading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.profile-page {
  padding: 2rem;
  background-color: #f9f9f9;
  font-family: 'Segoe UI', sans-serif;
  position: relative;
}

.fullscreen-loader {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.profile-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
}

.profile-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-section .avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
}

.stats-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat h3 {
  font-size: 1.8rem;
  color: #3498db;
}

.stat p {
  margin-top: 0.3rem;
  color: #666;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1.3rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #2980b9;
}

.btn.danger {
  background: #e74c3c;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
}

.modal input {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Compressor from 'compressorjs';
import LoadingSpinner from './../../components/LoadingSpinner.vue';
import { db, account, storage, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite';
import { ID, Query } from 'appwrite';

const router = useRouter();

const userProfile = ref({});
const userProperties = ref([]);
const userDocId = ref('');
const defaultAvatar = 'https://via.placeholder.com/150';
const avatarFile = ref(null);

const showEditProfileModal = ref(false);
const editProfile = reactive({ name: '', phone_number: '' });
const uploading = ref(false);

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.7,
      maxWidth: 500,
      maxHeight: 500,
      success(result) {
        resolve(new File([result], file.name, { type: result.type }));
      },
      error(err) {
        reject(err);
      }
    });
  });

const onAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    return;
  }
  avatarFile.value = file;
};

const fetchProfile = async () => {
  try {
    const user = await account.get();
    const res = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      [Query.equal('user_id', user.$id)]
    );
    if (!res.documents.length) return;

    const doc = res.documents[0];
    userDocId.value = doc.$id;
    userProfile.value = doc;
    editProfile.name = doc.name || '';
    editProfile.phone_number = doc.phone_number || '';
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
};

const fetchUserProperties = async () => {
  try {
    const user = await account.get();
    const res = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.PROPERTIES,
      [Query.equal('landlord_id', user.$id)]
    );
    userProperties.value = res.documents;
  } catch (err) {
    console.error('Error fetching properties:', err);
  }
};

const saveProfile = async () => {
  uploading.value = true;
  let newAvatarUrl = userProfile.value.avatar;

  try {
    if (avatarFile.value) {
      const compressed = await compressImage(avatarFile.value);
      const uploaded = await storage.createFile(COLLECTION_IDS.BUCKET, ID.unique(), compressed);
      newAvatarUrl = `${storage.endpoint}/v1/storage/buckets/${COLLECTION_IDS.BUCKET}/files/${uploaded.$id}/view?project=${storage.project}`;

      // Delete old avatar
      const oldFileId = userProfile.value.avatar?.split('/files/')[1]?.split('/')[0];
      if (oldFileId) {
        try {
          await storage.deleteFile(COLLECTION_IDS.BUCKET, oldFileId);
        } catch (e) {
          console.warn('Old avatar deletion failed:', e);
        }
      }
    }

    const updated = await db.updateDocument(DATABASE_ID, COLLECTION_IDS.USERS, userDocId.value, {
      name: editProfile.full_name,
      phone_number: editProfile.phone_number,
      avatar: newAvatarUrl
    });

    userProfile.value = updated;
    avatarFile.value = null;
    closeEditProfileModal();
  } catch (err) {
    console.error('Profile update failed:', err);
  } finally {
    uploading.value = false;
  }
};

const openEditProfileModal = () => (showEditProfileModal.value = true);
const closeEditProfileModal = () => (showEditProfileModal.value = false);

const logout = async () => {
  await account.deleteSession('current');
  router.push('/auth/login');
};

onMounted(() => {
  fetchProfile();
  fetchUserProperties();
});
</script>