<template>
  <div class="chat-list-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading chats...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchChatRooms">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredChatRooms.length === 0" class="empty-state">
      <p>No chats found</p>
      <button @click="startNewChat" class="new-chat-btn">
        Start a new chat
      </button>
    </div>

    <!-- Chat list -->
    <div v-else class="chat-list">
      <div
        v-for="chat in filteredChatRooms"
        :key="chat.$id"
        class="chat-item"
        @click="goToChat(chat)"
      >
        <div class="chat-avatar" :style="getAvatarStyle(chat)">
          {{ getAvatarInitial(chat.property_name || getOtherUser(chat)) }}
        </div>
        <div class="chat-content">
          <div class="chat-header">
            <h3>{{ chat.property_name || getOtherUser(chat) }}</h3>
            <span class="chat-time">{{ formatTime(chat.created_at) }}</span>
          </div>
          <div class="chat-preview">
            <p>{{ getLastMessagePreview(chat) }}</p>
            <div v-if="hasUnreadMessages(chat)" class="unread-indicator">
              <span class="unread-dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.chat-list-container {
  width: 100%;
  max-width: 1200px;
  height: 100vh;
  margin: 0 auto;
  background: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eaeaea;
}
.chat-list-container {
  width: 100%;
  max-width: 1200px;
  height: 100vh;
  margin: 0 auto;
  background: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eaeaea;
}
.chat-list-header h1 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.search-box {
  position: relative;
}
.unread-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #25d366;
  border-radius: 50%;
  margin-left: 8px;
}
.search-box input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
  outline: none;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
}

.loading-state, .error-state, .empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #075e54;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.error-state button, .new-chat-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #075e54;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.chat-item {
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.chat-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #075e54;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.chat-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 0.75rem;
  color: #666;
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
}

.chat-preview p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.unread-indicator {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.unread-count {
  background: #25d366;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Scrollbar styling */
.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-track {
  background-color: transparent;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, account, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite';
import { Query } from 'appwrite';

const router = useRouter();

// State
const chatRooms = ref([]);
const userId = ref('');
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

// Fetch chat rooms
const fetchChatRooms = async () => {
  try {
    loading.value = true;
    error.value = null;

    const user = await account.get();
    userId.value = user.$id;

    const response = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.CHATS,
      [
        Query.equal('user_id', userId.value),
        Query.equal('status', 'active'),
        Query.orderDesc('created_at')
      ]
    );

    chatRooms.value = response.documents;
  } catch (err) {
    console.error('Failed to fetch chat rooms:', err);
    error.value = 'Failed to load chats. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Filter chats based on search query
const filteredChatRooms = computed(() => {
  if (!searchQuery.value) return chatRooms.value;

  const query = searchQuery.value.toLowerCase();
  return chatRooms.value.filter(chat => {
    const propertyName = (chat.property_name || '').toLowerCase();
    const landlordName = (chat.landlord_name || '').toLowerCase();
    return propertyName.includes(query) || landlordName.includes(query);
  });
});

// Get other user in chat (landlord in this case)
const getOtherUser = (chat) => {
  return chat.landlord_name || 'Landlord';
};

// Avatar initials
const getAvatarInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?';
};

// Avatar background
const getAvatarStyle = (chat) => {
  const colors = ['#075e54', '#128c7e', '#25d366', '#34b7f1', '#dcf8c6'];
  const name = chat.property_name || getOtherUser(chat);
  const hash = name ? name.charCodeAt(0) % colors.length : 0;
  return { backgroundColor: colors[hash] };
};

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

// Message preview
const getLastMessagePreview = (chat) => {
  if (!chat.messages || chat.messages.length === 0) return 'No messages yet';
  const lastMsg = chat.messages[chat.messages.length - 1].content;
  return lastMsg.length > 30
    ? lastMsg.substring(0, 30) + '...'
    : lastMsg;
};

// Unread check - simplified version
const hasUnreadMessages = (chat) => {
  if (!chat.messages || chat.messages.length === 0) return false;
  const lastMsg = chat.messages[chat.messages.length - 1];
  return lastMsg.sender_id !== userId.value && !lastMsg.is_read;
};

// Start new chat - you'll need to implement this based on your flow
const startNewChat = () => {
  // This would be handled by your property details page
  router.push({ name: 'properties' });
};

// Go to chat
const goToChat = (chat) => {
  router.push({
    name: 'chatroom',
    params: { id: chat.$id },
    query: {
      propertyName: chat.property_name,
      otherUser: chat.landlord_name || 'Landlord'
    }
  });
};

// Fetch on mount
onMounted(fetchChatRooms);
</script>