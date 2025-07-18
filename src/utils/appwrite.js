import { Client, Databases, Account, Storage, ID } from 'appwrite';
import { ref } from 'vue';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

// ✅ Correctly assign to a variable
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PAYSTACK_PUBLIC_KEY=import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const COLLECTION_IDS = {
  BOOKINGS: import.meta.env.VITE_APPWRITE_COLLECTION_BOOKINGS,
  CHATS: import.meta.env.VITE_APPWRITE_COLLECTION_CHATS,
  USERS: import.meta.env.VITE_APPWRITE_COLLECTION_USERS,
  RECEIPTS: import.meta.env.VITE_APPWRITE_COLLECTION_RECEIPTS,
  BANNERS: import.meta.env.VITE_APPWRITE_COLLECTION_BANNERS,
  PROPERTIES: import.meta.env.VITE_APPWRITE_COLLECTION_PROPERTIES,
  BUCKET: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  COUNTRIES: import.meta.env.VITE_APPWRITE_COLLECTION_COUNTRIES,


};

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);
const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);
const isLoggedIn = ref(false);

export {
  client,
  endpoint,
  projectId,
  DATABASE_ID,
  COLLECTION_IDS,
  databases as db,
  account,
  storage,
  ID,
  isLoggedIn,
  PAYSTACK_PUBLIC_KEY
};