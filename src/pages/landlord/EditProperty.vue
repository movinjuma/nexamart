<template>
  <div class="edit-property-container">
    <!-- Success Popup Modal -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-content">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>Update Successful!</h3>
        <p>Your property listing has been updated successfully.</p>
        <button @click="navigateToManageListings" class="confirm-btn">
          Back to My Listings
        </button>
      </div>
    </div>

    <!-- Processing Loader -->
    <div v-if="isLoading" class="processing-overlay">
      <div class="loader-content">
        <div class="spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Updating your property...</p>
      </div>
    </div>

    <!-- File Preview Modal -->
    <div v-if="previewFile" class="modal-overlay" @click.self="closePreview">
      <div class="modal-content">
        <h3>File Preview</h3>
        <div class="preview-container">
          <img v-if="previewFile.type.startsWith('image')" :src="previewFile.url" class="preview-media" />
          <video v-else-if="previewFile.type.startsWith('video')" controls class="preview-media">
            <source :src="previewFile.url" :type="previewFile.type" />
          </video>
          <div v-else class="unsupported-preview">
            <i class="fas fa-file"></i>
            <p>Preview not available for this file type</p>
          </div>
        </div>
        <div class="file-info">
          <p><strong>Name:</strong> {{ previewFile.name }}</p>
          <p><strong>Size:</strong> {{ formatFileSize(previewFile.size) }}</p>
          <p><strong>Type:</strong> {{ previewFile.type }}</p>
        </div>
        <button @click="closePreview" class="close-preview-btn">Close Preview</button>
      </div>
    </div>

    <div class="header-section">
      <h1 class="page-title">Update Your Listing</h1>
      <p class="page-subtitle">Edit details and keep your listing fresh and accurate.</p>
    </div>

    <form @submit.prevent="handleFormSubmission" class="property-form">
      <!-- Property Details -->
      <section class="form-section">
        <h2 class="section-title">Property Info</h2>
        <div class="form-group">
          <label>Property Name</label>
          <input type="text" v-model="propName" required />
        </div>

        <div class="form-group">
          <label>Category</label>
          <select v-model="category" @change="handleCategoryChange" required>
            <option disabled value="">Select Category</option>
            <option v-for="cat in categories" :key="cat">{{ cat }}</option>
          </select>
        </div>

        <div v-if="category === 'Student Rooms'" class="form-group">
          <label>Institution Name</label>
          <input type="text" v-model="institutionName" placeholder="e.g. Kenyatta University" />
        </div>

        <div class="form-group">
          <label>Number of Units</label>
          <input type="number" v-model.number="numUnits" min="1" @change="updateRoomVariants" />
        </div>
      </section>

      <!-- Location -->
      <section class="form-section">
        <h2 class="section-title">Location</h2>
        <div class="form-group">
          <label>City/Town</label>
          <input type="text" v-model="location" required />
        </div>
        <div class="form-group">
          <label>Exact Address</label>
          <input type="text" v-model="exactLocation" required />
        </div>
      </section>

      <!-- Pricing -->
      <section class="form-section">
        <h2 class="section-title">Pricing</h2>
        <div class="form-group price-group">
          <label>Base Amount</label>
          <div class="price-input-container">
            <span class="currency-symbol">{{ currencySymbol }}</span>
            <input type="number" v-model.number="amount" min="0" required />
            <select v-model="duration" required>
              <option v-for="option in durationOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <!-- Media Upload -->
      <section class="form-section">
        <h2 class="section-title">Media</h2>
        <p class="section-description">Update property images and video tour.</p>

        <!-- Thumbnail preview -->
        <div class="current-media" v-if="currentThumbnail">
          <label>Current Property Image</label>
          <div class="preview-wrapper">
            <img :src="currentThumbnail.url" class="media-preview" @click="showPreview(currentThumbnail)" />
            <div class="file-actions">
              <button @click.stop="showPreview(currentThumbnail)" class="preview-btn">
                <i class="fas fa-eye"></i> Preview
              </button>
              <button @click.stop="removeFile('image')" class="remove-btn">
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
            <div class="file-size-warning" v-if="currentThumbnail.size > 5 * 1024 * 1024">
              <i class="fas fa-exclamation-triangle"></i> Large file ({{ formatFileSize(currentThumbnail.size) }})
            </div>
          </div>
        </div>

        <div class="form-group file-upload">
          <label for="imageFile">New Property Image</label>
          <div class="upload-area" 
               @click="triggerFileInput('imageFile')" 
               @dragover.prevent="handleDragOver" 
               @drop.prevent="handleDrop($event, 'image')">
            <i class="fas fa-cloud-upload-alt"></i>
            <p v-if="!currentThumbnail">Click to upload or drag & drop</p>
            <p v-else class="file-name">{{ currentThumbnail.name }}</p>
            <p class="file-requirements">(JPEG, PNG, WEBP - Recommended under 5MB)</p>
          </div>
          <input id="imageFile" type="file" accept="image/jpeg,image/png,image/webp" @change="handleImageUpload" hidden />
        </div>

        <!-- Video preview -->
        <div class="current-media" v-if="currentVideo">
          <label>Current Video</label>
          <div class="preview-wrapper">
            <video controls class="media-preview" @click.stop="showPreview(currentVideo)">
              <source :src="currentVideo.url" type="video/mp4" />
            </video>
            <div class="file-actions">
              <button @click.stop="showPreview(currentVideo)" class="preview-btn">
                <i class="fas fa-eye"></i> Preview
              </button>
              <button @click.stop="removeFile('video')" class="remove-btn">
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
            <div class="file-size-warning" v-if="currentVideo.size > 20 * 1024 * 1024">
              <i class="fas fa-exclamation-triangle"></i> Large file ({{ formatFileSize(currentVideo.size) }})
            </div>
          </div>
        </div>

        <div class="form-group file-upload">
          <label for="videoFile">New Video Tour (Optional)</label>
          <div class="upload-area" 
               @click="triggerFileInput('videoFile')" 
               @dragover.prevent="handleDragOver" 
               @drop.prevent="handleDrop($event, 'video')">
            <i class="fas fa-video"></i>
            <p v-if="!currentVideo">Click to upload a video</p>
            <p v-else class="file-name">{{ currentVideo.name }}</p>
            <p class="file-requirements">(MP4 - Recommended under 20MB)</p>
          </div>
          <input id="videoFile" type="file" accept="video/mp4" @change="handleVideoUpload" hidden />
        </div>

        <!-- Room image previews -->
        <div class="current-media" v-if="currentRoomImages?.length">
          <label>Current Room Images</label>
          <div class="room-images-grid">
            <div v-for="(img, idx) in currentRoomImages" :key="idx" class="room-image-container">
              <img :src="img.url" class="room-image-preview" alt="Room Image" @click.stop="showPreview(img)" />
              <div class="room-image-actions">
                <button @click.stop="showPreview(img)" class="preview-btn">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click.stop="removeRoomImage(idx)" class="remove-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div class="file-size-warning" v-if="img.size > 5 * 1024 * 1024">
                <i class="fas fa-exclamation-triangle"></i> Large file
              </div>
            </div>
          </div>
        </div>

        <div class="form-group file-upload">
          <label for="roomImages">New Room Images (Optional)</label>
          <div class="upload-area" 
               @click="triggerFileInput('roomImages')" 
               @dragover.prevent="handleDragOver" 
               @drop.prevent="handleDrop($event, 'roomImages')">
            <i class="fas fa-images"></i>
            <p v-if="!currentRoomImages?.length">Click to upload multiple images</p>
            <p v-else class="file-name">{{ currentRoomImages.length }} image(s) selected</p>
            <p class="file-requirements">(JPEG, PNG - Recommended under 5MB each)</p>
          </div>
          <input id="roomImages" type="file" accept="image/jpeg,image/png" multiple @change="handleRoomImagesUpload" hidden />
        </div>
      </section>

      <!-- Description -->
      <section class="form-section">
        <h2 class="section-title">Description</h2>
        <div class="form-group">
          <label>Property Details</label>
          <textarea
            v-model="description"
            @input="resizeTextarea"
            maxlength="500"
            placeholder="Describe your property's features, amenities, etc."
            required
          ></textarea>
          <div class="char-counter">{{ description?.length || 0 }}/500</div>
        </div>
      </section>

      <!-- Contact Info -->
      <section class="form-section">
        <h2 class="section-title">Contact Information</h2>
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" disabled />
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" v-model="phoneNumber" disabled />
        </div>
      </section>

      <div class="submit-section">
        <button type="submit" class="submit-btn" :disabled="isLoading || !isFormValid">
          <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i> Updating...</span>
          <span v-else><i class="fas fa-save"></i> Update Property</span>
        </button>

        <div v-if="submissionError" class="error-message">
          <i class="fas fa-exclamation-circle"></i> {{ submissionError }}
        </div>

        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
          <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
          <span>Uploading: {{ uploadProgress }}%</span>
        </div>
      </div>
    </form>
  </div>
</template>
<style scoped>
.edit-property-container {
  padding: 1rem;
  max-width: 800px;
  margin: auto;
  background-color: #f2f4f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  min-height: 100vh;
  color: #1a1a1a;
}

.header-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.property-form {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  display: block;
  color: #374151;
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.8rem;
  border-radius: 0.6rem;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  background-color: #f9fafb;
  transition: all 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #3b82f6;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.5;
}

.char-counter {
  font-size: 0.8rem;
  text-align: right;
  color: #6b7280;
  margin-top: 0.3rem;
}

.file-upload .upload-area {
  padding: 1.2rem;
  text-align: center;
  border: 2px dashed #d1d5db;
  border-radius: 0.8rem;
  cursor: pointer;
  background-color: #f8fafc;
  color: #374151;
  transition: all 0.2s;
}

.file-upload .upload-area:hover {
  background-color: #f0f9ff;
  border-color: #3b82f6;
}

.file-upload .upload-area i {
  font-size: 1.8rem;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.file-name {
  font-weight: 600;
  color: #1d4ed8;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.file-requirements {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.3rem;
}

.price-group {
  margin-bottom: 1.2rem;
}

.price-input-container {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  background-color: #f9fafb;
  padding: 0.7rem;
  border-radius: 0.6rem;
  border: 1px solid #d1d5db;
}

.price-input-container .currency-symbol {
  padding: 0.8rem;
  background-color: #f3f4f6;
  border-radius: 0.6rem;
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid #d1d5db;
  min-width: 50px;
  text-align: center;
}

.price-input-container input {
  flex: 2;
  min-width: 100px;
  padding: 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 0.6rem;
  background-color: white;
  font-size: 0.95rem;
}

.price-input-container select {
  flex: 1;
  min-width: 100px;
  padding: 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 0.6rem;
  background-color: white;
  font-size: 0.95rem;
}

.current-media {
  margin-bottom: 1.2rem;
}

.media-preview {
  max-width: 100%;
  max-height: 280px;
  border-radius: 0.7rem;
  border: 1px solid #d1d5db;
  object-fit: contain;
  background-color: #f3f4f6;
  display: block;
  margin: 0 auto;
  cursor: pointer;
  transition: transform 0.2s;
}

.media-preview:hover {
  transform: scale(1.02);
}

.room-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 0.8rem;
}

.room-image-container {
  position: relative;
  border-radius: 0.7rem;
  overflow: hidden;
}

.room-image-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 0.7rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: transform 0.2s;
}

.room-image-preview:hover {
  transform: scale(1.05);
}

.file-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preview-btn, .remove-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.preview-btn {
  background-color: #3b82f6;
  color: white;
}

.preview-btn:hover {
  background-color: #2563eb;
}

.remove-btn {
  background-color: #ef4444;
  color: white;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.room-image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.3rem;
  background: rgba(0, 0, 0, 0.5);
  border-bottom-left-radius: 0.7rem;
  border-bottom-right-radius: 0.7rem;
}

.room-image-actions button {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
}

.file-size-warning {
  font-size: 0.75rem;
  color: #d97706;
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.section-description {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1.2rem;
  text-align: center;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 0.8rem;
  max-width: 90%;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.success-icon {
  font-size: 3rem;
  color: #22c55e;
  margin-bottom: 1rem;
}

.modal-content h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.modal-content p {
  margin-bottom: 1.5rem;
  color: #4b5563;
}

.confirm-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
}

.confirm-btn:hover {
  background-color: #2563eb;
}

/* Processing loader styles */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loader-content {
  text-align: center;
}

.spinner {
  font-size: 3rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.loader-content p {
  font-size: 1.1rem;
  color: #374151;
}

.preview-container {
  margin: 1rem 0;
  max-height: 60vh;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-media {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 0.7rem;
  object-fit: contain;
}

.unsupported-preview {
  padding: 1.8rem;
  text-align: center;
  color: #6b7280;
}

.unsupported-preview i {
  font-size: 2.8rem;
  margin-bottom: 1rem;
  color: #9ca3af;
}

.file-info {
  text-align: left;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.7rem;
}

.file-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.close-preview-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin-top: 1rem;
}

.close-preview-btn:hover {
  background-color: #2563eb;
}

.submit-section {
  margin-top: 2.5rem;
  text-align: center;
}

.submit-btn {
  background-color: #3b82f6;
  color: #fff;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.submit-btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  margin-top: 1rem;
  color: #ef4444;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.upload-progress {
  margin-top: 1rem;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  height: 1.5rem;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.upload-progress span {
  position: relative;
  z-index: 1;
  font-size: 0.8rem;
  color: white;
  line-height: 1.5rem;
  padding: 0 0.5rem;
}

@media (max-width: 768px) {
  .property-form {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .price-input-container {
    flex-direction: column;
    gap: 0.8rem;
  }

  .price-input-container select {
    width: 100%;
  }

  .room-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .submit-btn {
    padding: 0.9rem;
    font-size: 0.95rem;
  }
}
</style>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ID } from 'appwrite';
import { db, account,projectId,endpoint,client, storage, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite';
import Compressor from 'compressorjs';

const router = useRouter();
const route = useRoute();
const propertyId = route.params.id;

// Refs (form, media, state)
const propName = ref('');
const category = ref('');
const institutionName = ref('');
const numUnits = ref(1);
const location = ref('');
const exactLocation = ref('');
const amount = ref(0);
const duration = ref('Month');
const description = ref('');
const email = ref('');
const phoneNumber = ref('');
const imageFile = ref(null);
const currentThumbnail = ref(null);
const videoFile = ref(null);
const currentVideo = ref(null);
const roomImages = ref([]);
const currentRoomImages = ref([]);
const isLoading = ref(false);
const submissionError = ref(null);
const userId = ref('');
const uploadProgress = ref(0);
const previewFile = ref(null);
const currencySymbol = ref('KES');
const showSuccessModal = ref(false);
const isInitializing = ref(true);
const hasCriticalError = ref(false);
const isAuthenticated = ref(false);
const isAuthorized = ref(false);

const durationOptions = ref([
  { value: 'Month', label: 'Month' },
  { value: 'Day', label: 'Day' },
  { value: 'Night', label: 'Night' },
  { value: 'Semester', label: 'Semester' },
  { value: 'Term', label: 'Term' },
  { value: 'Year', label: 'Year' },
  { value: 'N/A', label: 'N/A' }
]);

const categories = ref([
  'Single Rooms', 'Bedsitter Units', 'Student Rooms',
  'One Bedrooms', 'Two Bedrooms', 'Three Bedrooms',
  'Lodging Rooms', 'Hotel Rooms', 'Business Spaces',
  'Office Spaces', 'Plot For Sale', 'Farming Land'
]);

const isFormValid = computed(() => {
  return (
    propName.value.trim() &&
    category.value &&
    location.value.trim() &&
    exactLocation.value.trim() &&
    amount.value > 0 &&
    description.value.trim() &&
    currentThumbnail.value
  );
});

const closePreview = () => {
  previewFile.value = null;
};

const showPreview = (file) => {
  previewFile.value = file;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const triggerFileInput = (id) => {
  document.getElementById(id)?.click();
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.currentTarget.style.borderColor = '#3b82f6';
  e.currentTarget.style.backgroundColor = '#f0f9ff';
};

const handleDrop = (e, type) => {
  e.preventDefault();
  e.currentTarget.style.borderColor = '#d1d5db';
  e.currentTarget.style.backgroundColor = '#f8fafc';
  
  const files = e.dataTransfer.files;
  if (!files.length) return;
  
  if (type === 'image') {
    handleImageUpload({ target: { files: [files[0]] } });
  } else if (type === 'video') {
    handleVideoUpload({ target: { files: [files[0]] } });
  } else if (type === 'roomImages') {
    handleRoomImagesUpload({ target: { files } });
  }
};

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      convertSize: 500000,
      success: resolve,
      error: reject
    });
  });
};

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.match('image/jpeg|image/png|image/webp')) {
    submissionError.value = 'Please upload a valid image (JPEG, PNG, or WEBP)';
    return;
  }
  
  try {
    const compressedFile = await compressImage(file);
    const processedFile = new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now()
    });
    
    imageFile.value = processedFile;
    currentThumbnail.value = {
      name: processedFile.name,
      size: processedFile.size,
      type: processedFile.type,
      url: URL.createObjectURL(processedFile)
    };
    submissionError.value = null;
  } catch (err) {
    console.error('Image compression error:', err);
    submissionError.value = 'Failed to process image';
  }
};

const handleVideoUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.match('video/mp4')) {
    submissionError.value = 'Please upload a valid MP4 video';
    return;
  }
  
  videoFile.value = file;
  currentVideo.value = {
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file)
  };
  submissionError.value = null;
};

const handleRoomImagesUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  
  const validFiles = files.filter(file => file.type.match('image/jpeg|image/png'));
  if (validFiles.length !== files.length) {
    submissionError.value = 'Some files were invalid (only JPEG/PNG accepted)';
  }
  
  if (!validFiles.length) return;
  
  try {
    const processedFiles = await Promise.all(
      validFiles.map(async file => {
        const compressedFile = await compressImage(file);
        return {
          file: new File([compressedFile], file.name, {
            type: compressedFile.type,
            lastModified: Date.now()
          }),
          preview: {
            name: file.name,
            size: compressedFile.size,
            type: compressedFile.type,
            url: URL.createObjectURL(compressedFile)
          }
        };
      })
    );
    
    roomImages.value = processedFiles.map(f => f.file);
    currentRoomImages.value = processedFiles.map(f => f.preview);
    submissionError.value = null;
  } catch (err) {
    console.error('Room images processing error:', err);
    submissionError.value = 'Failed to process some images';
  }
};

const removeFile = (type) => {
  if (type === 'image') {
    if (currentThumbnail.value?.url) URL.revokeObjectURL(currentThumbnail.value.url);
    currentThumbnail.value = null;
    imageFile.value = null;
  } else if (type === 'video') {
    if (currentVideo.value?.url) URL.revokeObjectURL(currentVideo.value.url);
    currentVideo.value = null;
    videoFile.value = null;
  }
};

const removeRoomImage = (index) => {
  if (currentRoomImages.value[index]?.url) {
    URL.revokeObjectURL(currentRoomImages.value[index].url);
  }
  currentRoomImages.value.splice(index, 1);
  roomImages.value.splice(index, 1);
};

const resizeTextarea = (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = `${e.target.scrollHeight}px`;
};

const uploadFile = async (file) => {
  const fileId = ID.unique();
  await storage.createFile(COLLECTION_IDS.BUCKET, fileId, file);
  return fileId;
};

const uploadFileWithProgress = async (file) => {
  const fileId = ID.unique();
  await storage.createFile(
    COLLECTION_IDS.BUCKET, 
    fileId, 
    file, 
    (progress) => {
      uploadProgress.value = Math.floor((progress.loaded / progress.total) * 100);
    }
  );
  return fileId;
};

const constructFileUrl = (fileId) => {
  return `${endpoint}/storage/buckets/${COLLECTION_IDS.BUCKET}/files/${fileId}/view?project=${projectId}`;
};

const extractFileIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const fileIdIndex = pathParts.indexOf('files') + 1;
    return pathParts[fileIdIndex];
  } catch (e) {
    console.error('Error extracting file ID from URL:', e);
    return null;
  }
};

const deleteOldFiles = async (doc) => {
  try {
    // Delete old thumbnail if a new one is being uploaded
    if (imageFile.value && doc.thumbnail_url) {
      const oldFileId = extractFileIdFromUrl(doc.thumbnail_url);
      if (oldFileId) {
        await storage.deleteFile(COLLECTION_IDS.BUCKET, oldFileId);
      }
    }
    
    // Delete old video if a new one is being uploaded
    if (videoFile.value && doc.video_url) {
      const oldFileId = extractFileIdFromUrl(doc.video_url);
      if (oldFileId) {
        await storage.deleteFile(COLLECTION_IDS.BUCKET, oldFileId);
      }
    }
    
    // Delete old room images if new ones are being uploaded
    if (roomImages.value.length && doc.room_images?.length) {
      await Promise.all(
        doc.room_images.map(async (url) => {
          const oldFileId = extractFileIdFromUrl(url);
          if (oldFileId) {
            await storage.deleteFile(COLLECTION_IDS.BUCKET, oldFileId);
          }
        })
      );
    }
  } catch (error) {
    console.warn('Error deleting old files:', error);
  }
};

const uploadAllFiles = async () => {
  const fileUrls = {};
  uploadProgress.value = 0;
  
  try {
    // Upload thumbnail first
    if (imageFile.value) {
      const imageId = await uploadFileWithProgress(imageFile.value);
      fileUrls.thumbnail_url = constructFileUrl(imageId);
    }

    // Upload video next
    if (videoFile.value) {
      try {
        const videoId = await uploadFile(videoFile.value);
        fileUrls.video_url = constructFileUrl(videoId);
      } catch (error) {
        console.warn('Video upload failed, continuing without it:', error.message);
      }
    }

    // Upload room images sequentially
    if (roomImages.value.length) {
      fileUrls.room_image_urls = [];
      for (const file of roomImages.value) {
        try {
          const fileId = await uploadFile(file);
          fileUrls.room_image_urls.push(constructFileUrl(fileId));
        } catch (error) {
          console.warn('Room image upload failed:', error.message);
        }
      }
    }

    return fileUrls;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  } finally {
    uploadProgress.value = 0;
  }
};

const navigateToSuccessPage = () => {
  router.push({
    name: 'managelistings',
    query: { success: 'true', action: 'edit' }
  });
};

const handleFormSubmission = async () => {
  if (!isFormValid.value) {
    submissionError.value = 'Please fill all required fields correctly.';
    return;
  }

  isLoading.value = true;
  submissionError.value = null;

  try {
    const currentDoc = await db.getDocument(DATABASE_ID, COLLECTION_IDS.PROPERTIES, propertyId);
    
    // Delete old files before uploading new ones
    await deleteOldFiles(currentDoc);
    
    // Upload new files and get their URLs
    const fileUrls = await uploadAllFiles();

    // Update the document with new data and file URLs
    await db.updateDocument(
      DATABASE_ID, 
      COLLECTION_IDS.PROPERTIES, 
      propertyId, 
      {
        name: propName.value,
        category: category.value,
        institution_name: institutionName.value || '',
        location: location.value,
        exact_location: exactLocation.value,
        amount: amount.value,
        duration: duration.value,
        description: description.value,
        num_units: numUnits.value,
        ...(imageFile.value && { thumbnail_url: fileUrls.thumbnail_url }),
        ...(videoFile.value && { video_url: fileUrls.video_url }),
        ...(roomImages.value.length && { room_images: fileUrls.room_image_urls })
      }
    );

    // Redirect to success page instead of showing modal
    navigateToSuccessPage();
  } catch (err) {
    console.error('Form submission error:', err);
    submissionError.value = err.message || 'Failed to update property listing';
  } finally {
    isLoading.value = false;
  }
};

const handleCategoryChange = () => {
  if (category.value !== 'Student Rooms') institutionName.value = '';
};

const loadPropertyData = async () => {
  try {
    const user = await account.get();
    userId.value = user.$id;
    isAuthenticated.value = true;

    const doc = await db.getDocument(DATABASE_ID, COLLECTION_IDS.PROPERTIES, propertyId);
    
    if (user.$id !== doc.landlord_id) {
      submissionError.value = 'You are not authorized to edit this property';
      hasCriticalError.value = true;
      return;
    }

    isAuthorized.value = true;
    
    // Populate form fields
    propName.value = doc.property_name;
    category.value = doc.category;
    institutionName.value = doc.institution_name || '';
    location.value = doc.location;
    exactLocation.value = doc.exact_location;
    amount.value = doc.amount;
    duration.value = doc.period || 'Month';
    description.value = doc.description;
    email.value = doc.email;
    phoneNumber.value = doc.phone_number;
    numUnits.value = doc.num_units || 1;

    // Handle media files
    if (doc.thumbnail_url) {
      currentThumbnail.value = {
        url: doc.thumbnail_url,
        name: 'Current thumbnail',
        size: 0,
        type: 'image/jpeg'
      };
    }
    
    if (doc.video_url) {
      currentVideo.value = {
        url: doc.video_url,
        name: 'Current video',
        size: 0,
        type: 'video/mp4'
      };
    }
    
    if (doc.room_images?.length) {
      currentRoomImages.value = doc.room_images.map((url, idx) => ({
        url,
        name: `Room image ${idx + 1}`,
        size: 0,
        type: 'image/jpeg'
      }));
    }
  } catch (error) {
    console.error('Error loading property data:', error);
    submissionError.value = error.message || 'Failed to load property data. Please refresh the page.';
    hasCriticalError.value = true;
    
    // Redirect to manage listings if unauthorized or property not found
    if (error.code === 404 || error.code === 401) {
      setTimeout(() => {
        router.push({ name: 'managelistings' });
      }, 3000);
    }
  } finally {
    isInitializing.value = false;
  }
};

onMounted(() => {
  loadPropertyData();
});

onBeforeUnmount(() => {
  // Clean up blob URLs
  if (currentThumbnail.value?.url && currentThumbnail.value.url.startsWith('blob:')) {
    URL.revokeObjectURL(currentThumbnail.value.url);
  }

  if (currentVideo.value?.url && currentVideo.value.url.startsWith('blob:')) {
    URL.revokeObjectURL(currentVideo.value.url);
  }

  currentRoomImages.value.forEach(img => {
    if (img?.url && img.url.startsWith('blob:')) {
      URL.revokeObjectURL(img.url);
    }
  });
});
</script>