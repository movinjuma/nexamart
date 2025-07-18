<template>
  <div class="chat-room">
    <div ref="chatBodyRef" class="chat-body">
      <div v-if="state.isLoading" class="loading">Loading messages...</div>
      <div v-else-if="state.error" class="error">{{ state.error }}</div>
      <template v-else>
        <div
          v-for="msg in state.messages"
          :key="msg.$id"
          :class="msg.sender_id === state.userId ? 'message sent' : 'message received'"
        >
          <div class="message-content">{{ msg.content }}</div>
          <div class="message-time">
            {{ formatTime(msg.$createdAt) }}
            <span v-if="msg.sender_id === state.userId" class="read-status">
              {{ msg.is_read ? '✓✓' : '✓' }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <div class="chat-input">
      <input
        v-model="state.newMessage"
        @keyup.enter="sendMessage"
        placeholder="Type a message..."
        :disabled="state.isSending"
      />
      <button @click="sendMessage" :disabled="!state.newMessage.trim() || state.isSending">
        {{ state.isSending ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: azure;
}

.message {
  max-width: 70%;
  padding: 0.5rem 1rem;
  border-radius: 7.5px;
  animation: fadeIn 0.3s ease-out;
}

.message.sent {
  align-self: flex-end;
  background-color: #dcf8c6;
  border-bottom-right-radius: 0;
}

.message.received {
  align-self: flex-start;
  background-color: white;
  border-bottom-left-radius: 0;
}

.message-content {
  word-wrap: break-word;
}

.message-time {
  font-size: 0.7rem;
  color: #666;
  text-align: right;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.read-status {
  color: #4fc3f7;
}

.chat-input {
  display: flex;
  padding: 0.75rem;
  background-color: #f0f0f0;
  border-top: 1px solid #ddd;
}

.chat-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 21px;
  margin-right: 0.5rem;
  outline: none;
}

.chat-input button {
  padding: 0.75rem 1.25rem;
  background-color: #075e54;
  color: white;
  border: none;
  border-radius: 21px;
  cursor: pointer;
}

.chat-input button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  padding: 1rem;
  color: #666;
}

.error {
  color: #f44336;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<script setup>
import { reactive, ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db, account, client, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite';
import { Query, ID } from 'appwrite';

const route = useRoute();
const chatBodyRef = ref(null);

const state = reactive({
  chatId: route.params.id,
  userId: '',
  userDocId: '',
  chatRoom: null,
  messages: [],
  newMessage: '',
  isLoading: false,
  isSending: false,
  error: null,
  otherUser: route.query.otherUser || 'User',
  propertyName: route.query.propertyName || ''
});

// Load current user ID from Appwrite
async function getUserId() {
  try {
    const session = await account.get();
    const res = await db.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      [Query.equal('user_id', session.$id)]
    );
    if (!res.documents.length) throw new Error('User profile not found');
    state.userId = res.documents[0].user_id;
    state.userDocId = res.documents[0].$id;
  } catch (err) {
    state.error = 'Failed to get user ID: ' + err.message;
  }
}

// Load chatroom and initial messages
async function initializeChat() {
  try {
    state.isLoading = true;
    await getUserId();

    // Load chatroom
    state.chatRoom = await db.getDocument(DATABASE_ID, COLLECTION_IDS.CHATS, state.chatId);
    
    // Fetch messages from the chatroom
    await fetchMessages();
    
    // Set up realtime updates
    setupRealtime();
  } catch (err) {
    state.error = 'Failed to initialize chat: ' + err.message;
    console.error(err);
  } finally {
    state.isLoading = false;
  }
}

// Fetch messages from the chatroom
async function fetchMessages() {
  try {
    if (state.chatRoom?.messages) {
      state.messages = state.chatRoom.messages.map(msg => ({
        ...msg,
        content: String(msg.content) // Ensure content is always a string
      }));
    }
  } catch (err) {
    state.error = 'Failed to fetch messages: ' + err.message;
  }
}

// Send a message
async function sendMessage() {
  if (!state.newMessage.trim() || state.newMessage.length > 1000) {
    state.error = 'Message must be between 1-1000 characters';
    return;
  }
  
  const msgContent = state.newMessage.trim();
  state.newMessage = '';
  state.isSending = true;
  state.error = null;

  try {
    // Create a new message object with validated content
    const newMsg = {
      $id: ID.unique(),
      sender_id: state.userId,
      content: String(msgContent).substring(0, 1000), // Ensure string and limit length
      is_read: false,
      $createdAt: new Date().toISOString()
    };

    // Update the chatroom document with the new message
    await db.updateDocument(
      DATABASE_ID,
      COLLECTION_IDS.CHATS,
      state.chatId,
      {
        messages: [...state.messages, newMsg]
      }
    );

  } catch (err) {
    state.error = 'Failed to send message: ' + err.message;
    console.error(err);
  } finally {
    state.isSending = false;
  }
}

// Format timestamp
function formatTime(t) {
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Realtime message subscription
function setupRealtime() {
  const unsub = client.subscribe(
    `databases.${DATABASE_ID}.collections.${COLLECTION_IDS.CHATS}.documents`,
    (res) => {
      if (res.payload.$id === state.chatId && res.events.includes('databases.*.collections.*.documents.*.update')) {
        // Ensure all message contents are strings
        state.chatRoom = res.payload;
        state.messages = (res.payload.messages || []).map(msg => ({
          ...msg,
          content: String(msg.content)
        }));
      }
    }
  );
  
  onUnmounted(() => unsub());
}

// Scroll to bottom when messages change
watch(() => state.messages, async () => {
  await nextTick();
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
  }
}, { deep: true });

// Compute chat title
const chatTitle = computed(() => {
  return state.propertyName || state.chatRoom?.property_name || state.otherUser || 'Chat Room';
});

onMounted(initializeChat);
</script>