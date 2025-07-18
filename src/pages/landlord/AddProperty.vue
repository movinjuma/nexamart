<template>
  <!-- Full-screen Loader -->
  <div v-if="fullScreenLoading" class="full-screen-loader">
    <div class="loader-content">
      <div class="spinner"></div>
      <p>Processing your request...</p>
    </div>
  </div>

  <!-- Location Confirmation Modal - Improved version -->
  <div v-if="showLocationModal" class="modal-overlay location-confirmation-modal">
    <div class="modal-content">
      <div class="modal-header">
        <i class="fas fa-map-marker-alt"></i>
        <h3>Location Confirmation</h3>
      </div>
      <div class="modal-body">
        <p>For accurate property listing, we need to confirm your location.</p>
        <p class="location-question">Are you currently at your property location?</p>
        <div class="location-benefits">
          <div class="benefit-item">
            <i class="fas fa-check-circle"></i>
            <span>More accurate property placement on maps</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-check-circle"></i>
            <span>Better visibility for potential tenants</span>
          </div>
        </div>
      </div>
      <div class="modal-buttons">
        <button @click="confirmLocation(true)" class="confirm-btn">
          <i class="fas fa-check-circle"></i> Yes, I'm at the property
        </button>
        <button @click="confirmLocation(false)" class="cancel-btn">
          <i class="fas fa-times-circle"></i> No, I'm not there
        </button>
      </div>
      <p class="location-note">
        <i class="fas fa-info-circle"></i> You can update the location later if needed.
      </p>
    </div>
  </div>

  <div v-if="!showLocationModal" class="edit-property-container">
    <!-- File Preview Modal -->
    <div v-if="previewFile" class="modal-overlay" @click.self="closePreview">
      <div class="modal-content">
        <h3>File Preview</h3>
        <div class="preview-container">
          <img v-if="previewFile.type.startsWith('image')" :src="previewFile.url" class="preview-media" alt="Preview" />
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
        <button @click="closePreview" class="close-preview-btn">
          <i class="fas fa-times"></i> Close Preview
        </button>
      </div>
    </div>

    <div class="header-content">
      <h1>Add Your Property</h1>
      <p class="subtitle">Fill in the details to list your property</p>
    </div>

    <form @submit.prevent="submitPropertyForm" class="property-form">
      <!-- Free Upload Banner -->
      <div v-if="isFreeUpload" class="free-upload-banner">
        <i class="fas fa-gift"></i>
        <span>🎉 You qualify for free property upload (first 500 landlords in your country)!</span>
      </div>

      <!-- Property Details -->
      <div class="form-section">
        <h2><i class="fas fa-home"></i> Property Details</h2>

        <div class="form-group">
          <label for="propName">Property Name</label>
          <input id="propName" type="text" v-model="propName" placeholder="e.g., Green Gardens Apartments" required />
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="category" required>
            <option disabled value="">Select Category</option>
            <option v-for="cat in propertyCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="form-group" v-if="category === 'Students Rooms'">
          <label for="institutionName">Associated Institution</label>
          <input id="institutionName" type="text" v-model="institutionName" placeholder="e.g., University of Nairobi" />
        </div>

        <div class="form-group">
          <label for="numUnits">Number of Units Available</label>
          <input id="numUnits" type="number" v-model.number="numUnits" min="1" placeholder="e.g., 5" required />
        </div>
      </div>

      <!-- Location -->
      <div class="form-section">
        <h2><i class="fas fa-map-marked-alt"></i> Location Information</h2>
        <div class="form-group">
          <label for="location">City/Town</label>
          <input id="location" type="text" v-model="location" placeholder="e.g., Nairobi" required />
        </div>
        <div class="form-group">
          <label for="exactLocation">Exact Address</label>
          <input id="exactLocation" type="text" v-model="exactLocation" placeholder="e.g., Kileleshwa, near ABC Plaza" required />
        </div>
      </div>

      <!-- Pricing -->
      <div class="form-section">
        <h2><i class="fas fa-tag"></i> Pricing</h2>
        <div class="form-group price-group">
          <label>Base Amount</label>
          <div class="price-input-container">
            <span class="currency-symbol">{{ currencySymbol }}</span>
            <input type="number" v-model.number="amount" min="0" placeholder="e.g., 25000" required />
            <select v-model="duration" required>
              <option v-for="option in durationOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Media Upload -->
      <div class="form-section">
        <h2><i class="fas fa-images"></i> Media</h2>
        <p class="section-description">Upload property images and video tour (First image will be used as thumbnail)</p>

        <!-- Thumbnail preview -->
        <div class="current-media" v-if="currentThumbnail">
          <label>Current Property Image</label>
          <div class="preview-wrapper">
            <img :src="currentThumbnail.url" class="media-preview" @click="showPreview(currentThumbnail)" alt="Property thumbnail" />
            <div class="file-actions">
              <button @click.stop="showPreview(currentThumbnail)" class="preview-btn">
                <i class="fas fa-eye"></i> Preview
              </button>
              <button @click.stop="removeFile('image')" class="remove-btn">
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
            <div class="file-size-warning" v-if="currentThumbnail.size > 5 * 1024 * 1024">
              <i class="fas fa-exclamation-triangle"></i> Large file ({{ formatFileSize(currentThumbnail.size) }}) may take longer to upload
            </div>
          </div>
        </div>

        <div class="form-group file-upload">
          <label for="imageFile">New Property Image <span class="required-asterisk">*</span></label>
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
              <source :src="currentVideo.url" :type="currentVideo.type" />
            </video>
            <div class="file-actions">
              <button @click.stop="showPreview(currentVideo)" class="preview-btn">
                <i class="fas fa-eye"></i> Preview
              </button>
              <button @click.stop="removeFile('video')" class="remove-btn">
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
            <div class="file-size-warning" v-if="currentVideo.size > 150 * 1024 * 1024">
              <i class="fas fa-exclamation-circle"></i> Video exceeds 150MB limit and will be compressed
            </div>
            <div class="file-size-warning" v-else-if="currentVideo.size > 20 * 1024 * 1024">
              <i class="fas fa-exclamation-triangle"></i> Large file ({{ formatFileSize(currentVideo.size) }}) may take longer to upload
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
            <p class="file-requirements">(MP4 - Max 150MB, will be compressed to under 50MB)</p>
          </div>
          <input id="videoFile" type="file" accept="video/mp4" @change="handleVideoUpload" hidden />
        </div>

        <!-- Room image previews -->
        <div class="current-media" v-if="currentRoomImages?.length">
          <label>Current Room Images ({{ currentRoomImages.length }})</label>
          <div class="room-images-grid">
            <div v-for="(img, idx) in currentRoomImages" :key="idx" class="room-image-container">
              <img :src="img.url" class="room-image-preview" :alt="'Room image ' + (idx + 1)" @click.stop="showPreview(img)" />
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
      </div>

      <!-- Description -->
      <div class="form-section">
        <h2><i class="fas fa-align-left"></i> Description</h2>
        <div class="form-group">
          <label for="description">Property Details <span class="required-asterisk">*</span></label>
          <textarea
            id="description"
            v-model="description"
            @input="resizeTextarea"
            maxlength="500"
            placeholder="Describe your property's features, amenities, etc."
            required
          ></textarea>
          <div class="char-counter">{{ description?.length || 0 }}/500</div>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="form-section">
        <h2><i class="fas fa-address-book"></i> Contact Information</h2>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="email" disabled />
        </div>
        <div class="form-group">
          <label for="phoneNumber">Phone <span class="required-asterisk">*</span></label>
          <input id="phoneNumber" type="tel" v-model="phoneNumber" placeholder="e.g. 0712..." required />
        </div>
      </div>

      <!-- Listing Fee Information -->
      <div class="form-section listing-fee-section">
        <h2><i class="fas fa-receipt"></i> Listing Fee</h2>
        <div class="fee-details">
          <div class="fee-item">
            <span class="fee-label">Standard Listing:</span>
            <span class="fee-amount">{{ currencySymbol }}{{ listingFee }}</span>
          </div>
          <div class="fee-item" v-if="isFreeUpload">
            <span class="fee-label">Discount:</span>
            <span class="fee-amount discount">-{{ currencySymbol }}{{ listingFee }}</span>
          </div>
          <div class="fee-item total-fee">
            <span class="fee-label">Total Fee:</span>
            <span class="fee-amount">{{ isFreeUpload ? currencySymbol + '0' : currencySymbol + listingFee }}</span>
          </div>
        </div>
        <p class="fee-note">The listing fee covers your property being featured for 30 days.</p>
      </div>

      <!-- Submit -->
      <div class="submit-section">
        <button type="submit" class="submit-btn" :disabled="isLoading || !isFormValid">
          <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i> Processing...</span>
          <span v-else><i class="fas fa-save"></i> Save Property</span>
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
/* Add these new styles for the improved location modal */
.location-confirmation-modal {
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.7);
}

.location-confirmation-modal .modal-content {
  max-width: 450px;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-header i {
  font-size: 2.5rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  color: #111827;
  margin: 0.5rem 0 0;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.location-question {
  font-weight: 600;
  font-size: 1.1rem;
  margin: 1.5rem 0;
  color: #111827;
  text-align: center;
}

.location-benefits {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0;
}

.benefit-item i {
  color: #10b981;
  font-size: 1.1rem;
}

.benefit-item span {
  font-size: 0.95rem;
  color: #4b5563;
}

.location-note {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.location-note i {
  color: #3b82f6;
}

/* New styles for the rest of the template */
.header-content .subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-top: 0.5rem;
  text-align: center;
}

.free-upload-banner {
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.free-upload-banner i {
  font-size: 1.2rem;
}

.form-section h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-section h2 i {
  color: #3b82f6;
}

.location-confirmation-badge {
  background-color: #ecfdf5;
  color: #065f46;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.location-confirmation-badge i {
  font-size: 1rem;
}

.required-asterisk {
  color: #ef4444;
  margin-left: 0.25rem;
}

/* Rest of your existing styles remain the same */
.full-screen-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loader-content {
  text-align: center;
}

.spinner {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.edit-property-container {
  padding: 0.2rem;
  max-width: 100%;
  background-color: #f2f4f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  min-height: 100vh;
  color: #1a1a1a;
}

.header-content {
  text-align: center;
  margin-bottom: 0.3rem;
}

.header-content h1 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0rem;
}

.property-form {
  background-color: #fff;
  padding: 0.3rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #111827;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
  display: block;
  color: #374151;
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.7rem;
  border-radius: 0.6rem;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
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
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
}

.char-counter {
  font-size: 0.75rem;
  text-align: right;
  color: #6b7280;
  margin-top: 0.2rem;
}

.file-upload .upload-area {
  padding: 1rem;
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
  font-size: 1.5rem;
  color: #3b82f6;
  margin-bottom: 0.4rem;
}

.file-name {
  font-weight: 600;
  color: #1d4ed8;
  font-size: 0.85rem;
  margin: 0.4rem 0;
}

.file-requirements {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.2rem;
}

.price-group {
  margin-bottom: 1rem;
}

.price-group label {
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
  display: block;
  color: #374151;
  font-weight: 500;
}

.price-input-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  background-color: #f9fafb;
  padding: 0.6rem;
  border-radius: 0.6rem;
  border: 1px solid #d1d5db;
}

.price-input-container .currency-symbol {
  padding: 0.7rem;
  background-color: #f3f4f6;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid #d1d5db;
  min-width: 50px;
  text-align: center;
}

.price-input-container input {
  flex: 2;
  min-width: 100px;
  padding: 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 0.6rem;
  background-color: white;
  font-size: 0.9rem;
}

.price-input-container select {
  flex: 1;
  min-width: 100px;
  padding: 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 0.6rem;
  background-color: white;
  font-size: 0.9rem;
}

/* Listing Fee Section Styles */
.listing-fee-section {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 0.8rem;
  border: 1px solid #e2e8f0;
}

.fee-details {
  margin: 1rem 0;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #edf2f7;
}

.fee-label {
  font-weight: 500;
  color: #4a5568;
}

.fee-amount {
  font-weight: 600;
}

.discount {
  color: #38a169;
}

.total-fee {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 2px solid #cbd5e0;
  font-size: 1.1rem;
}

.total-fee .fee-label {
  font-weight: 600;
}

.total-fee .fee-amount {
  color: #2b6cb0;
  font-weight: 700;
}

.fee-note {
  font-size: 0.85rem;
  color: #718096;
  margin-top: 1rem;
  text-align: center;
  font-style: italic;
}

@media (max-width: 768px) {
  .property-form {
    padding: 0.8rem;
  }

  .form-section h2 {
    font-size: 1.15rem;
  }

  .price-input-container {
    flex-direction: column;
    gap: 0.6rem;
  }

  .price-input-container select {
    width: 100%;
  }
}

.submit-section {
  margin-top: 2rem;
  text-align: center;
}

.submit-btn {
  background-color: #3b82f6;
  color: #fff;
  padding: 0.8rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  margin-top: 0.8rem;
  color: #ef4444;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.current-media {
  margin-bottom: 1rem;
}

.current-media label {
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
  display: block;
  color: #374151;
  font-weight: 500;
}

.media-preview {
  max-width: 100%;
  max-height: 250px;
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
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.8rem;
  margin-top: 0.6rem;
}

.room-image-container {
  position: relative;
  border-radius: 0.7rem;
  overflow: hidden;
}

.room-image-preview {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 0.7rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: transform 0.2s;
}

.room-image-preview:hover {
  transform: scale(1.05);
}

.preview-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.file-actions {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.preview-btn, .remove-btn {
  padding: 0.35rem 0.7rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
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
  gap: 0.4rem;
  padding: 0.25rem;
  background: rgba(0, 0, 0, 0.5);
  border-bottom-left-radius: 0.7rem;
  border-bottom-right-radius: 0.7rem;
}

.room-image-actions button {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.3rem;
  font-size: 0.65rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  transition: all 0.2s;
}

.file-size-warning {
  font-size: 0.7rem;
  color: #d97706;
  margin-top: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.section-description {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 1rem;
  text-align: center;
}

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
  padding: 1.5rem;
  border-radius: 0.8rem;
  max-width: 90%;
  width: 480px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  color: #111827;
}

.modal-content p {
  margin-bottom: 1.2rem;
  color: #4b5563;
  font-size: 0.95rem;
}

.modal-buttons {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
}

.confirm-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  flex: 1;
}

.confirm-btn:hover {
  background-color: #2563eb;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  flex: 1;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}

.preview-container {
  margin: 0.8rem 0;
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
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
}

.unsupported-preview i {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  color: #9ca3af;
}

.file-info {
  text-align: left;
  margin: 0.8rem 0;
  padding: 0.8rem;
  background-color: #f9fafb;
  border-radius: 0.7rem;
}

.file-info p {
  margin: 0.4rem 0;
  font-size: 0.85rem;
}

.close-preview-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin-top: 0.8rem;
}

.close-preview-btn:hover {
  background-color: #2563eb;
}

.upload-progress {
  margin-top: 0.8rem;
  background-color: #e5e7eb;
  border-radius: 0.4rem;
  height: 1.25rem;
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
  font-size: 0.75rem;
  color: white;
  line-height: 1.25rem;
  padding: 0 0.4rem;
}

@media (max-width: 768px) {
  .property-form {
    padding: 0.8rem;
  }

  .form-section h2 {
    font-size: 1.15rem;
  }

  .price-input-container {
    flex-direction: column;
    gap: 0.6rem;
  }

  .price-input-container select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 1.4rem;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .confirm-btn,
  .cancel-btn {
    width: 100%;
  }

  .room-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }
}
</style>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ID } from 'appwrite';
import {
  db, account, storage, endpoint, projectId,
  DATABASE_ID, COLLECTION_IDS, PAYSTACK_PUBLIC_KEY
} from './../../utils/appwrite.js';
import Compressor from 'compressorjs';

const router = useRouter();

// Form refs
const propName = ref('');
const category = ref('');
const institutionName = ref('');
const numUnits = ref(1);
const location = ref('');
const exactLocation = ref('');
const country = ref(null);
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
const fullScreenLoading = ref(false);
const submissionError = ref(null);
const userId = ref('');
const latitude = ref(null);
const longitude = ref(null);
const ipAddress = ref(null);
const showLocationModal = ref(true);
const userConfirmedLocation = ref(false);
const uploadProgress = ref(0);
const previewFile = ref(null);
const currencySymbol = ref('KES');
const isFreeUpload = ref(false);
const userData = ref(null);

const durationOptions = ref([
  { value: 'Month', label: 'Month' },
  { value: 'Day', label: 'Day' },
  { value: 'Night', label: 'Night' },
  { value: 'Semester', label: 'Semester' },
  { value: 'Term', label: 'Term' },
  { value: 'Year', label: 'Year' },
  { value: 'N/A', label: 'N/A' }
]);

const propertyCategories = ref([
  'Single Rooms', 'Bedsitter Units', 'Students Rooms',
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
    phoneNumber.value.trim() &&
    currentThumbnail.value
  );
});

const triggerFileInput = (inputId) => {
  document.getElementById(inputId).click();
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.currentTarget.style.borderColor = '#3b82f6';
  e.currentTarget.style.backgroundColor = '#f0f9ff';
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.currentTarget.style.borderColor = '#d1d5db';
  e.currentTarget.style.backgroundColor = '#f8fafc';
};

const handleDrop = (e, fileType) => {
  e.preventDefault();
  e.currentTarget.style.borderColor = '#d1d5db';
  e.currentTarget.style.backgroundColor = '#f8fafc';

  const files = e.dataTransfer.files;
  if (!files.length) return;

  const input = document.createElement('input');
  input.type = 'file';
  
  // Set appropriate accept attributes based on file type
  switch(fileType) {
    case 'image':
      input.accept = 'image/jpeg,image/png,image/webp';
      input.multiple = false;
      handleImageUpload({ target: { files } });
      break;
    case 'video':
      input.accept = 'video/mp4,video/webm,video/quicktime';
      input.multiple = false;
      handleVideoUpload({ target: { files } });
      break;
    case 'roomImages':
      input.accept = 'image/jpeg,image/png';
      input.multiple = true;
      handleRoomImagesUpload({ target: { files } });
      break;
  }
};

const showPreview = (file) => {
  previewFile.value = file;
};

const closePreview = () => {
  previewFile.value = null;
};

const removeFile = (type) => {
  switch(type) {
    case 'image':
      imageFile.value = null;
      if (currentThumbnail.value?.url) URL.revokeObjectURL(currentThumbnail.value.url);
      currentThumbnail.value = null;
      break;
    case 'video':
      videoFile.value = null;
      if (currentVideo.value?.url) URL.revokeObjectURL(currentVideo.value.url);
      currentVideo.value = null;
      break;
  }
};

const removeRoomImage = (index) => {
  if (currentRoomImages.value[index]?.url) {
    URL.revokeObjectURL(currentRoomImages.value[index].url);
  }
  roomImages.value.splice(index, 1);
  currentRoomImages.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const resizeTextarea = (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = (e.target.scrollHeight) + 'px';
};
const getIPAddress = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    ipAddress.value = data.ip;
    return data.ip;
  } catch (error) {
    console.warn('Failed to fetch IP address', error);
    return null;
  }
};

const listingFee = computed(() => {
  if (!country.value) return 10 * numUnits.value;
  let fee = 10;

  if ([
    'One Bedrooms', 'Two Bedrooms', 'Three Bedrooms',
    'Business Spaces', 'Office Spaces'
  ].includes(category.value)) {
    fee = country.value.fee_business || 50;
  } else if (['Plot For Sale', 'Farming Land'].includes(category.value)) {
    fee = country.value.fee_premium || 100;
  } else {
    fee = country.value.fee_low || 10;
  }

  return fee * numUnits.value;
});

const getFileUrlFromResponse = (file) => `${endpoint}/storage/buckets/${COLLECTION_IDS.BUCKET}/files/${file.$id}/view?project=${projectId}`;

const compressImage = (file) => new Promise((resolve, reject) => {
  new Compressor(file, {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    convertSize: 500000,
    success: resolve,
    error: reject
  });
});

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.match('image/jpeg|image/png|image/webp')) {
    submissionError.value = 'Invalid image file';
    return;
  }

  try {
    const compressed = await compressImage(file);
    const finalFile = new File([compressed], file.name, { type: compressed.type });
    imageFile.value = finalFile;
    currentThumbnail.value = {
      name: finalFile.name,
      size: finalFile.size,
      type: finalFile.type,
      url: URL.createObjectURL(finalFile)
    };
    submissionError.value = null;
  } catch (err) {
    submissionError.value = 'Image processing failed';
    console.error(err);
  }
};

const handleVideoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.match('video/mp4|video/webm|video/quicktime')) {
    submissionError.value = 'Invalid video file';
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    submissionError.value = 'Video too large';
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
  const files = Array.from(e.target.files).filter(f => f.type.match('image/jpeg|image/png'));
  if (!files.length) return;

  try {
    const uploads = await Promise.all(files.map(async f => {
      const c = await compressImage(f);
      const final = new File([c], f.name, { type: c.type });
      return {
        file: final,
        preview: {
          name: final.name,
          size: final.size,
          type: final.type,
          url: URL.createObjectURL(final)
        }
      };
    }));

    roomImages.value = uploads.map(u => u.file);
    currentRoomImages.value = uploads.map(u => u.preview);
    submissionError.value = null;
  } catch (err) {
    submissionError.value = 'Room image processing failed';
    console.error(err);
  }
};

const uploadAllFiles = async () => {
  const fileUrls = {};

  try {
    if (imageFile.value) {
      const thumbnail = await storage.createFile(COLLECTION_IDS.BUCKET, ID.unique(), imageFile.value);
      fileUrls.thumbnail_url = getFileUrlFromResponse(thumbnail);
    }

    if (videoFile.value) {
      const video = await storage.createFile(COLLECTION_IDS.BUCKET, ID.unique(), videoFile.value);
      fileUrls.video_url = getFileUrlFromResponse(video);
    }

    if (roomImages.value.length) {
      const uploads = await Promise.all(roomImages.value.map(f =>
        storage.createFile(COLLECTION_IDS.BUCKET, ID.unique(), f)
      ));
      fileUrls.room_image_urls = uploads.map(getFileUrlFromResponse);
    }

    return fileUrls;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload files');
  }
};

const savePropertyData = async (fileUrls) => {
  try {
    const propertyDoc = await db.createDocument(
      DATABASE_ID, 
      COLLECTION_IDS.PROPERTIES, 
      ID.unique(), 
      {
        property_name: propName.value,
        category: category.value,
        location: location.value,
        exact_location: exactLocation.value,
        country_id: country.value?.$id || null,
        amount: amount.value,
        period: duration.value,
        description: description.value,
        phone_number: phoneNumber.value,
        email: email.value,
        latitude: latitude.value,
        longitude: longitude.value,
        ip_address: ipAddress.value,
        status: 'active',
        room_images: fileUrls.room_image_urls || null,
        landlord_id: userId.value,
        num_units: numUnits.value,
        institution_name: institutionName.value.trim(),
        landlord_name: userData.value?.name || '',
        thumbnail_url: fileUrls.thumbnail_url,
        video_url: fileUrls.video_url || null,
        currency: country.value?.currency_code || 'KES'
      }
    );

    if (country.value?.$id) {
      try {
        await db.updateDocument(
          DATABASE_ID,
          COLLECTION_IDS.COUNTRIES,
          country.value.$id,
          { landlords: (country.value.landlords || 0) + 1 }
        );
      } catch (updateError) {
        console.error('Failed to update country count:', updateError);
      }
    }

    return propertyDoc;
  } catch (error) {
    console.error('Document creation error:', error);
    throw error;
  }
};

const fetchUserData = async () => {
  try {
    const currentUser = await account.get();
    userId.value = currentUser.$id;

    const userDoc = await db.getDocument(DATABASE_ID, COLLECTION_IDS.USERS, userId.value);
    userData.value = userDoc;
    email.value = userDoc.email;
    phoneNumber.value = userDoc.phone_number;

    if (!country.value && userDoc.country_id) {
      country.value = await db.getDocument(DATABASE_ID, COLLECTION_IDS.COUNTRIES, userDoc.country_id);
      currencySymbol.value = country.value.currency_symbol || 'KES';

      if ((country.value.landlords || 0) < 500) {
        isFreeUpload.value = true;
      }
    }
  } catch (err) {
    submissionError.value = 'Failed to fetch user data.';
    console.error(err);
    throw err;
  }
};

const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};

const initializePayment = async () => {
  try {
    await loadPaystackScript();
    const fileUrls = await uploadAllFiles();
    const paymentRef = `PROP_${Date.now()}_${userId.value.slice(0, 5)}`;

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email.value,
      amount: listingFee.value * 100,
      currency: country.value?.currency_code || 'KES',
      ref: paymentRef,
      callback: async () => {
        try {
          const savedProperty = await savePropertyData(fileUrls);
          router.push({
            name: 'success',
            query: {
              message: 'Property added successfully!',
              ref: paymentRef,
              propertyId: savedProperty.$id
            }
          });
        } catch (error) {
          console.error('Post-payment processing error:', error);
          submissionError.value = 'Payment succeeded but failed to save property. Please contact support.';
          isLoading.value = false;
          fullScreenLoading.value = false;
        }
      },
      onClose: () => {
        if (!isLoading.value) return;
        submissionError.value = 'Payment was cancelled. Please try again.';
        isLoading.value = false;
        fullScreenLoading.value = false;
      }
    });

    handler.openIframe();
  } catch (err) {
    console.error('Payment initialization error:', err);
    submissionError.value = err.message || 'Failed to initialize payment. Please try again.';
    isLoading.value = false;
    fullScreenLoading.value = false;
  }
};

const confirmLocation = async (isAtProperty) => {
  try {
    userConfirmedLocation.value = isAtProperty;
    
    if (isAtProperty) {
      // Try to get precise location if user is at property
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      latitude.value = position.coords.latitude;
      longitude.value = position.coords.longitude;
    } else {
      // Use approximate location based on IP if user isn't at property
      try {
        const response = await fetch(`https://ipapi.co/${ipAddress.value || ''}/json/`);
        const data = await response.json();
        latitude.value = data.latitude;
        longitude.value = data.longitude;
      } catch (ipError) {
        console.warn('Could not get approximate location', ipError);
      }
    }
    
    showLocationModal.value = false;
  } catch (error) {
    console.error('Location error:', error);
    // Fallback - hide modal and continue without precise location
    showLocationModal.value = false;
  }
};

const submitPropertyForm = async () => {
  if (!isFormValid.value) {
    submissionError.value = 'Please fill all required fields correctly.';
    return;
  }

  isLoading.value = true;
  fullScreenLoading.value = true;
  submissionError.value = null;

  try {
    if (isFreeUpload.value) {
      const fileUrls = await uploadAllFiles();
      const savedProperty = await savePropertyData(fileUrls);
      router.push({
        name: 'success',
        query: {
          message: 'Property added successfully!',
          propertyId: savedProperty.$id
        }
      });
    } else {
      await initializePayment();
    }
  } catch (err) {
    console.error('Form submission error:', err);
    submissionError.value = err.message || 'Failed to submit property listing';
  } finally {
    isLoading.value = false;
    fullScreenLoading.value = false;
  }
};

const initializeComponent = async () => {
  try {
    await Promise.all([fetchUserData(), getIPAddress()]);
  } catch (error) {
    console.error('Initialization error:', error);
    submissionError.value = 'Failed to initialize form. Please refresh the page.';
  }
};

onMounted(() => {
  initializeComponent();
});

onBeforeUnmount(() => {
  // Clean up object URLs to prevent memory leaks
  if (currentThumbnail.value?.url) URL.revokeObjectURL(currentThumbnail.value.url);
  if (currentVideo.value?.url) URL.revokeObjectURL(currentVideo.value.url);
  currentRoomImages.value.forEach(img => {
    if (img?.url) URL.revokeObjectURL(img.url);
  });
});
</script>