<template>
  <div class="bookings-container">
    <div class="bookings-header">
      <div class="header-content">
        <h1>Tenant Bookings</h1>
        <p class="subtitle">Manage all your property bookings in one place</p>
      </div>
      <div class="header-actions">
        <button @click="refreshBookings" class="btn btn-icon">
          <i class="fas fa-sync-alt"></i>
          <span>Refresh</span>
        </button>
        <button @click="openAddDialog" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          <span>Add Booking</span>
        </button>
      </div>
    </div>

    <div class="bookings-filters">
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" @change="filterBookings">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-range">
          <input type="date" v-model="filters.startDate" @change="filterBookings">
          <span>to</span>
          <input type="date" v-model="filters.endDate" @change="filterBookings">
        </div>
      </div>
      <div class="filter-group">
        <label>Search</label>
        <input type="text" v-model="filters.searchQuery" placeholder="Search bookings..." @input="filterBookings">
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading bookings...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button @click="fetchBookings" class="btn btn-outline">Try Again</button>
    </div>

    <div v-else-if="filteredBookings.length === 0" class="empty-state">
      <i class="fas fa-calendar-times"></i>
      <h3>No bookings found</h3>
      <p v-if="hasFilters">Try adjusting your filters</p>
      <button v-else @click="openAddDialog" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        <span>Create Booking</span>
      </button>
    </div>

    <div v-else class="bookings-grid">
      <div class="stats-cards">
        <div class="stats-card">
          <div class="stats-value">{{ stats.active }}</div>
          <div class="stats-label">Active</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ stats.pending }}</div>
          <div class="stats-label">Pending</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ stats.completed }}</div>
          <div class="stats-label">Completed</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ stats.total }}</div>
          <div class="stats-label">Total</div>
        </div>
      </div>

      <div class="bookings-table">
        <div class="table-header">
          <div class="header-cell">Property</div>
          <div class="header-cell">Tenant</div>
          <div class="header-cell">Dates</div>
          <div class="header-cell">Amount</div>
          <div class="header-cell">Status</div>
          <div class="header-cell">Actions</div>
        </div>
        
        <div class="table-body">
          <div v-for="booking in paginatedBookings" :key="booking.id" class="table-row">
            <div class="table-cell">
              <div class="property-info">
                <div class="property-name">{{ booking.propertyName }}</div>
                <div class="property-id">ID: {{ booking.propertyId }}</div>
              </div>
            </div>
            <div class="table-cell">
              <div class="tenant-info">
                <div class="tenant-name">{{ booking.tenantName }}</div>
                <div class="tenant-id">ID: {{ booking.tenantId }}</div>
              </div>
            </div>
            <div class="table-cell">
              <div class="date-range">
                <div>{{ formatDate(booking.startDate) }}</div>
                <div class="date-to">to</div>
                <div>{{ formatDate(booking.endDate) }}</div>
              </div>
            </div>
            <div class="table-cell">
              <div class="amount">
                {{ booking.currency }} {{ booking.amount.toLocaleString() }}
              </div>
            </div>
            <div class="table-cell">
              <div class="status-badge" :class="getStatusClass(booking.status)">
                {{ booking.status }}
              </div>
            </div>
            <div class="table-cell">
              <div class="action-buttons">
                <button @click="viewBookingDetails(booking)" class="btn-icon" title="View details">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="editBooking(booking)" class="btn-icon" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(booking)" class="btn-icon danger" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="btn-icon">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-icon">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Add/Edit Booking Modal -->
    <div v-if="showAddDialog" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Booking' : 'Add New Booking' }}</h2>
          <button @click="closeModal" class="btn-icon close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitBooking">
            <div class="form-grid">
              <div class="form-group">
                <label>Property Name</label>
                <input v-model="currentBooking.propertyName" type="text" required>
              </div>
              <div class="form-group">
                <label>Property ID</label>
                <input v-model="currentBooking.propertyId" type="text" required>
              </div>
              
              <!-- Tenant Selection Section -->
              <div class="form-group">
                <label>Tenant</label>
                <div class="tenant-selection">
                  <select v-model="tenantSelectionOption" @change="handleTenantSelectionChange">
                    <option value="existing">Select Existing Tenant</option>
                    <option value="new">Add New Tenant</option>
                  </select>
                  
                  <select v-if="tenantSelectionOption === 'existing'" 
                          v-model="currentBooking.tenantId" 
                          required
                          class="mt-2">
                    <option value="">Select Tenant</option>
                    <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                      {{ tenant.name }} ({{ tenant.id }})
                    </option>
                  </select>
                  
                  <div v-if="tenantSelectionOption === 'new'" class="new-tenant-fields mt-2">
                    <input v-model="newTenant.name" type="text" placeholder="Tenant Name" required>
                    <input v-model="newTenant.email" type="email" placeholder="Email" class="mt-2" required>
                    <input v-model="newTenant.phone" type="tel" placeholder="Phone" class="mt-2" required>
                    <button type="button" @click="addNewTenant" class="btn btn-sm btn-primary mt-2">
                      Add Tenant
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label>Start Date</label>
                <input v-model="currentBooking.startDate" type="date" required>
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input v-model="currentBooking.endDate" type="date" required>
              </div>
              <div class="form-group">
                <label>Amount</label>
                <div class="input-group">
                  <select v-model="currentBooking.currency" class="currency-select">
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                  </select>
                  <input v-model.number="currentBooking.amount" type="number" min="0" step="0.01" required>
                </div>
              </div>
              <div class="form-group">
                <label>Payment Reference</label>
                <input v-model="currentBooking.paymentReference" type="text" required>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="currentBooking.status" required>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-outline">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="processing">
                <span v-if="processing" class="spinner"></span>
                {{ isEditing ? 'Update Booking' : 'Add Booking' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h2>Confirm Deletion</h2>
          <button @click="showDeleteConfirm = false" class="btn-icon close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>Are you sure you want to delete this booking?</p>
          </div>
          <div class="booking-preview">
            <div><strong>Property:</strong> {{ bookingToDelete?.propertyName }}</div>
            <div><strong>Tenant:</strong> {{ bookingToDelete?.tenantName }}</div>
            <div><strong>Dates:</strong> {{ formatDate(bookingToDelete?.startDate) }} to {{ formatDate(bookingToDelete?.endDate) }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteConfirm = false" class="btn btn-outline">
            Cancel
          </button>
          <button @click="deleteBooking" class="btn btn-danger" :disabled="deleting">
            <span v-if="deleting" class="spinner"></span>
            {{ deleting ? 'Deleting...' : 'Delete Booking' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <div v-if="selectedBooking" class="modal-overlay">
      <div class="modal-content details-modal">
        <div class="modal-header">
          <h2>Booking Details</h2>
          <button @click="selectedBooking = null" class="btn-icon close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h3>Property Information</h3>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value">{{ selectedBooking.propertyName }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">ID:</div>
              <div class="detail-value">{{ selectedBooking.propertyId }}</div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Tenant Information</h3>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value">{{ selectedBooking.tenantName }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">ID:</div>
              <div class="detail-value">{{ selectedBooking.tenantId }}</div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <div class="detail-label">Dates:</div>
              <div class="detail-value">
                {{ formatDate(selectedBooking.startDate) }} to {{ formatDate(selectedBooking.endDate) }}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Status:</div>
              <div class="detail-value">
                <span class="status-badge" :class="getStatusClass(selectedBooking.status)">
                  {{ selectedBooking.status }}
                </span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Amount:</div>
              <div class="detail-value">
                {{ selectedBooking.currency }} {{ selectedBooking.amount.toLocaleString() }}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Payment Reference:</div>
              <div class="detail-value">{{ selectedBooking.paymentReference }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Created:</div>
              <div class="detail-value">{{ formatDateTime(selectedBooking.createdAt) }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="selectedBooking = null" class="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Modern Professional Booking Management System */
:root {
  --primary: #4361ee;
  --primary-hover: #3a56d4;
  --primary-light: #eef2ff;
  --success: #10b981;
  --success-light: #ecfdf5;
  --warning: #f59e0b;
  --warning-light: #fffbeb;
  --danger: #ef4444;
  --danger-light: #fef2f2;
  --dark: #1f2937;
  --dark-80: #374151;
  --gray: #6b7280;
  --gray-light: #f3f4f6;
  --border-radius: 8px;
  --border-radius-sm: 6px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base Container */
.bookings-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 4px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--dark);
  background-color: #f9fafb;
  min-height: 100vh;
}

/* Header Section */
.bookings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: var(--dark);
  line-height: 1.3;
}

.header-content .subtitle {
  margin: 8px 0 0;
  color: var(--gray);
  font-size: 14px;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.btn-outline {
  background-color: white;
  color: var(--primary);
  border-color: var(--gray-light);
}

.btn-outline:hover {
  background-color: var(--primary-light);
  border-color: var(--primary);
}

.btn-icon {
  padding: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: var(--gray);
  border: 1px solid var(--gray-light);
}

.btn-icon:hover {
  background-color: var(--gray-light);
  color: var(--dark);
}

.btn-icon.danger {
  color: var(--danger);
}

.btn-icon.danger:hover {
  background-color: var(--danger-light);
  color: var(--danger);
}

/* Filter Section */
.bookings-filters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dark-80);
  letter-spacing: 0.02em;
}

.filter-group select,
.filter-group input {
  padding: 10px 12px;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  width: 100%;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-range span {
  color: var(--gray);
  font-size: 14px;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stats-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: var(--transition);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.2;
}

.stats-label {
  font-size: 14px;
  color: var(--gray);
  margin-top: 4px;
}

/* Table Styles */
.bookings-table {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr 120px;
  background-color: var(--gray-light);
  padding: 12px 20px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--dark-80);
}

.header-cell {
  padding: 8px;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr 120px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-light);
  transition: var(--transition);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: var(--gray-light);
}

.table-cell {
  padding: 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.property-info,
.tenant-info {
  display: flex;
  flex-direction: column;
}

.property-name,
.tenant-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.property-id,
.tenant-id {
  font-size: 12px;
  color: var(--gray);
}

.date-range {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-to {
  font-size: 12px;
  color: var(--gray);
  text-align: center;
}

.amount {
  font-weight: 500;
  color: var(--success);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-active {
  background-color: var(--success-light);
  color: var(--success);
}

.status-pending {
  background-color: var(--warning-light);
  color: var(--warning);
}

.status-completed {
  background-color: var(--primary-light);
  color: var(--primary);
}

.status-cancelled {
  background-color: var(--danger-light);
  color: var(--danger);
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  font-size: 14px;
}

/* Modal Styles */
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
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: white;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--gray-light);
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background-color: transparent;
  border: none;
  color: var(--gray);
  transition: var(--transition);
}

.close-btn:hover {
  color: var(--dark);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--gray-light);
  position: sticky;
  bottom: 0;
  background-color: white;
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--dark);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.input-group {
  display: flex;
}

.input-group .currency-select {
  width: 80px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.input-group input {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* Tenant Selection Styles */
.tenant-selection {
  display: flex;
  flex-direction: column;
}

.new-tenant-fields {
  display: flex;
  flex-direction: column;
}

.new-tenant-fields input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--gray-light);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  margin-bottom: 8px;
}

.new-tenant-fields input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

/* Utility Classes */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  grid-column: span 2;
}

/* Details Modal */
.details-modal {
  max-width: 640px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--dark);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--gray-light);
}

.detail-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-label {
  color: var(--gray);
  font-weight: 500;
}

.detail-value {
  color: var(--dark);
  word-break: break-word;
}

/* Confirm Modal */
.confirm-modal {
  max-width: 520px;
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  color: var(--danger);
  font-weight: 500;
  font-size: 16px;
}

.warning-message i {
  font-size: 24px;
}

.booking-preview {
  background-color: var(--gray-light);
  padding: 16px;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.booking-preview div {
  margin-bottom: 8px;
}

.booking-preview div:last-child {
  margin-bottom: 0;
}

.booking-preview strong {
  color: var(--dark);
  font-weight: 500;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background-color: var(--danger-light);
  border-radius: var(--border-radius);
  color: var(--danger);
  gap: 16px;
  text-align: center;
}

.error-state i {
  font-size: 32px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: rgba(0, 0, 0, 0.1);
}

.empty-state h3 {
  margin: 0;
  font-size: 20px;
  color: var(--dark);
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: var(--gray);
  font-size: 14px;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .bookings-container {
    padding: 20px;
  }
}

@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 120px;
  }
  
  .table-cell:nth-child(2) {
    display: none;
  }
}

@media (max-width: 768px) {
  .bookings-container {
    padding: 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    grid-column: span 1;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr 120px;
  }
  
  .table-cell:nth-child(3),
  .table-cell:nth-child(4) {
    display: none;
  }
}

@media (max-width: 576px) {
  .bookings-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 12px;
  }
  
  .btn {
    width: 100%;
  }
  
  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 120px;
  }
  
  .table-cell:nth-child(2),
  .table-cell:nth-child(5) {
    display: none;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .modal-content {
    max-height: 80vh;
  }
}
</style>
<script>
import { ref, computed, onMounted } from 'vue';
import { db, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite';
import { account } from './../../utils/appwrite';
import { Query, ID } from 'appwrite';

// Models with snake_case properties to match Appwrite
class Booking {
  constructor(data = {}) {
    this.$id = data.$id || '';
    this.property_id = data.property_id || '';
    this.property_name = data.property_name || '';
    this.tenant_id = data.tenant_id || '';
    this.tenant_name = data.tenant_name || '';
    this.start_date = data.start_date || '';
    this.end_date = data.end_date || '';
    this.status = data.status || 'active';
    this.amount = data.amount || 0;
    this.currency = data.currency || 'KES';
    this.payment_reference = data.payment_reference || '';
    this.landlord_id = data.landlord_id || '';
    this.created_at = data.created_at || new Date().toISOString();
  }
}

class Tenant {
  constructor(data = {}) {
    this.$id = data.$id || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone_number = data.phone_number || '';
    this.created_at = data.created_at || new Date().toISOString();
    this.landlord_id = data.landlord_id || '';
  }
}

export default {
  setup() {
    // State
    const bookings = ref([]);
    const filteredBookings = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const showAddDialog = ref(false);
    const showDeleteConfirm = ref(false);
    const selectedBooking = ref(null);
    const bookingToDelete = ref(null);
    const deleting = ref(false);
    const processing = ref(false);
    const isEditing = ref(false);
    const tenants = ref([]);
    const tenantSelectionOption = ref('existing');
    const newTenant = ref(new Tenant());

    // Filters
    const filters = ref({
      status: 'all',
      start_date: '',
      end_date: '',
      search_query: ''
    });

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = 10;

    // Current booking form
    const currentBooking = ref(new Booking());

    // Computed properties
    const stats = computed(() => {
      return {
        active: bookings.value.filter(b => b.status === 'active').length,
        pending: bookings.value.filter(b => b.status === 'pending').length,
        completed: bookings.value.filter(b => b.status === 'completed').length,
        total: bookings.value.length
      };
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredBookings.value.length / itemsPerPage);
    });

    const paginatedBookings = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredBookings.value.slice(start, end);
    });

    const hasFilters = computed(() => {
      return filters.value.status !== 'all' || 
             filters.value.start_date || 
             filters.value.end_date || 
             filters.value.search_query;
    });

    // Methods
    async function fetchBookings() {
      try {
        loading.value = true;
        error.value = null;
        
        const user = await account.get();
        const userDocs = await db.listDocuments(
          DATABASE_ID, 
          COLLECTION_IDS.USERS, 
          [Query.equal('user_id', user.$id)]
        );
        
        if (userDocs.total === 0) {
          throw new Error('User profile not found');
        }
        
        const userDoc = userDocs.documents[0];
        const landlordId = userDoc.$id;
        
        // Fetch bookings
        const bookingsResponse = await db.listDocuments(
          DATABASE_ID, 
          COLLECTION_IDS.BOOKINGS,
          [Query.equal('landlord_id', landlordId)]
        );
        
        // Fetch tenants
        const tenantsResponse = await db.listDocuments(
          DATABASE_ID,
          COLLECTION_IDS.TENANTS,
          [Query.equal('landlord_id', landlordId)]
        );
        
        bookings.value = bookingsResponse.documents.map(b => new Booking(b));
        tenants.value = tenantsResponse.documents.map(t => new Tenant(t));
        filterBookings();
      } catch (err) {
        error.value = 'Failed to load data. Please try again.';
        console.error(err);
      } finally {
        loading.value = false;
      }
    }

    function filterBookings() {
      let result = [...bookings.value];
      
      if (filters.value.status !== 'all') {
        result = result.filter(b => b.status === filters.value.status);
      }
      
      if (filters.value.start_date) {
        const startDate = new Date(filters.value.start_date);
        result = result.filter(b => new Date(b.start_date) >= startDate);
      }
      
      if (filters.value.end_date) {
        const endDate = new Date(filters.value.end_date);
        result = result.filter(b => new Date(b.end_date) <= endDate);
      }
      
      if (filters.value.search_query) {
        const query = filters.value.search_query.toLowerCase();
        result = result.filter(b => 
          b.property_name.toLowerCase().includes(query) ||
          b.tenant_name.toLowerCase().includes(query) ||
          b.property_id.toLowerCase().includes(query) ||
          b.tenant_id.toLowerCase().includes(query) ||
          b.payment_reference.toLowerCase().includes(query)
        );
      }
      
      filteredBookings.value = result;
      currentPage.value = 1;
    }

    function refreshBookings() {
      fetchBookings();
    }

    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }

    function formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function getStatusClass(status) {
      return {
        'active': 'status-active',
        'pending': 'status-pending',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
      }[status.toLowerCase()] || '';
    }

    function viewBookingDetails(booking) {
      selectedBooking.value = booking;
    }

    function openAddDialog() {
      isEditing.value = false;
      currentBooking.value = new Booking();
      tenantSelectionOption.value = 'existing';
      newTenant.value = new Tenant();
      showAddDialog.value = true;
    }

    function editBooking(booking) {
      isEditing.value = true;
      currentBooking.value = new Booking({ ...booking });
      tenantSelectionOption.value = 'existing';
      newTenant.value = new Tenant();
      showAddDialog.value = true;
    }

    function confirmDelete(booking) {
      bookingToDelete.value = booking;
      showDeleteConfirm.value = true;
    }

    async function deleteBooking() {
      try {
        deleting.value = true;
        await db.deleteDocument(DATABASE_ID, COLLECTION_IDS.BOOKINGS, bookingToDelete.value.$id);
        bookings.value = bookings.value.filter(b => b.$id !== bookingToDelete.value.$id);
        filterBookings();
        showDeleteConfirm.value = false;
        bookingToDelete.value = null;
      } catch (err) {
        error.value = 'Failed to delete booking. Please try again.';
        console.error(err);
      } finally {
        deleting.value = false;
      }
    }

    async function addNewTenant() {
      try {
        processing.value = true;
        
        const user = await account.get();
        const userDocs = await db.listDocuments(
          DATABASE_ID, 
          COLLECTION_IDS.USERS, 
          [Query.equal('user_id', user.$id)]
        );
        
        if (userDocs.total === 0) {
          throw new Error('User profile not found');
        }
        
        const userDoc = userDocs.documents[0];
        
        const tenantData = {
          name: newTenant.value.name,
          email: newTenant.value.email,
          phone_number: newTenant.value.phone_number,
          landlord_id: userDoc.$id
        };
        
        const response = await db.createDocument(
          DATABASE_ID,
          COLLECTION_IDS.TENANTS,
          ID.unique(),
          tenantData
        );
        
        const addedTenant = new Tenant(response);
        tenants.value.unshift(addedTenant);
        
        // Set the new tenant as selected
        currentBooking.value.tenant_id = addedTenant.$id;
        currentBooking.value.tenant_name = addedTenant.name;
        
        // Reset new tenant form
        newTenant.value = new Tenant();
        tenantSelectionOption.value = 'existing';
        
      } catch (err) {
        error.value = 'Failed to add tenant. Please try again.';
        console.error(err);
      } finally {
        processing.value = false;
      }
    }

    function handleTenantSelectionChange() {
      if (tenantSelectionOption.value === 'existing') {
        currentBooking.value.tenant_id = '';
        currentBooking.value.tenant_name = '';
      }
    }

    async function submitBooking() {
      try {
        processing.value = true;
        
        const user = await account.get();
        const userDocs = await db.listDocuments(
          DATABASE_ID, 
          COLLECTION_IDS.USERS, 
          [Query.equal('user_id', user.$id)]
        );
        
        if (userDocs.total === 0) {
          throw new Error('User profile not found');
        }
        
        const userDoc = userDocs.documents[0];
        
        // If tenant is selected from existing, set the tenant name
        if (tenantSelectionOption.value === 'existing' && currentBooking.value.tenant_id) {
          const selectedTenant = tenants.value.find(t => t.$id === currentBooking.value.tenant_id);
          if (selectedTenant) {
            currentBooking.value.tenant_name = selectedTenant.name;
          }
        }
        
        const bookingData = {
          property_id: currentBooking.value.property_id,
          property_name: currentBooking.value.property_name,
          tenant_id: currentBooking.value.tenant_id,
          tenant_name: currentBooking.value.tenant_name,
          start_date: currentBooking.value.start_date,
          end_date: currentBooking.value.end_date,
          status: currentBooking.value.status,
          amount: parseFloat(currentBooking.value.amount),
          currency: currentBooking.value.currency,
          payment_reference: currentBooking.value.payment_reference,
          landlord_id: userDoc.$id,
          created_at: currentBooking.value.created_at || new Date().toISOString()
        };
        
        if (isEditing.value) {
          await db.updateDocument(
            DATABASE_ID, 
            COLLECTION_IDS.BOOKINGS, 
            currentBooking.value.$id, 
            bookingData
          );
          
          const index = bookings.value.findIndex(b => b.$id === currentBooking.value.$id);
          if (index !== -1) {
            bookings.value[index] = new Booking({ ...bookings.value[index], ...bookingData });
          }
        } else {
          const response = await db.createDocument(
            DATABASE_ID, 
            COLLECTION_IDS.BOOKINGS, 
            ID.unique(),
            bookingData
          );
          bookings.value.unshift(new Booking(response));
        }
        
        closeModal();
        filterBookings();
      } catch (err) {
        error.value = 'Failed to save booking. Please try again.';
        console.error(err);
      } finally {
        processing.value = false;
      }
    }

    function closeModal() {
      showAddDialog.value = false;
      isEditing.value = false;
      currentBooking.value = new Booking();
      tenantSelectionOption.value = 'existing';
      newTenant.value = new Tenant();
    }

    function prevPage() {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    }

    function nextPage() {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    }

    onMounted(() => {
      fetchBookings();
    });

    return {
      // State
      bookings,
      filteredBookings,
      loading,
      error,
      showAddDialog,
      showDeleteConfirm,
      selectedBooking,
      bookingToDelete,
      deleting,
      processing,
      isEditing,
      tenants,
      tenantSelectionOption,
      newTenant,
      
      // Filters
      filters,
      
      // Pagination
      currentPage,
      itemsPerPage,
      
      // Current booking
      currentBooking,
      
      // Computed
      stats,
      totalPages,
      paginatedBookings,
      hasFilters,
      
      // Methods
      fetchBookings,
      filterBookings,
      refreshBookings,
      formatDate,
      formatDateTime,
      getStatusClass,
      viewBookingDetails,
      openAddDialog,
      editBooking,
      confirmDelete,
      deleteBooking,
      addNewTenant,
      handleTenantSelectionChange,
      submitBooking,
      closeModal,
      prevPage,
      nextPage
    };
  }
};
</script>