// src/utils/auth.js
import { account, isLoggedIn } from './appwrite.js';

export async function getUser() {
  try {
    const user = await account.get();
    isLoggedIn.value = true;
    
    return {
      $id: user.$id,
      id: user.$id, // dual reference for compatibility
      email: user.email,
      phone: user.phone,
      name: user.name,
      prefs: user.prefs || {},
      country: user.prefs?.country || null,
    };
  } catch (error) {
    console.error('Auth error:', error);
    isLoggedIn.value = false;
    return null;
  }
}

export const authService = {
  getCurrentUser: getUser, // alias for compatibility
  async logout() {
    try {
      await account.deleteSession('current');
      isLoggedIn.value = false;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};