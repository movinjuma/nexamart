import { createRouter, createWebHistory } from 'vue-router';
import { account } from './../utils/appwrite.js';

// Import all layouts statically
import HomeLayout from './../layouts/HomeLayout.vue';
import AuthLayout from './../layouts/AuthLayout.vue';
import LandlordPortal from './../layouts/LandlordPortal.vue';
import ProductLayout from './../layouts/ProductLayout.vue';

// Import all home components statically
import Home from './../pages/home/Home.vue';
import Favorite from './../pages/home/Favorite.vue';
import Profile from './../pages/home/Profile.vue';
import ChatRoom from './../pages/home/ChatRoom.vue';
import ChatList from './../pages/home/ChatList.vue';
import Housika from './../pages/home/Housika.vue';

// Import all product components statically
import Filter from './../pages/products/Filter.vue';
import Search from './../pages/products/Search.vue';
import Details from './../pages/products/Details.vue';
import Confirm from './../pages/products/Confirm.vue';
import Success from './../pages/products/Success.vue';
import Failed from './../pages/products/Failed.vue';

// Import all landlord components statically
import EditProperty from './../pages/landlord/EditProperty.vue';
import AddProperty from './../pages/landlord/AddProperty.vue';
import Receipt from './../pages/landlord/Receipt.vue';
import Bookings from './../pages/landlord/Bookings.vue';
import Dashboard from './../pages/landlord/Dashboard.vue';
import ManageListings from './../pages/landlord/ManageListings.vue';

// Import all auth components statically
import Login from './../pages/auth/Login.vue';
import Signup from './../pages/auth/Signup.vue';
import ForgotPassword from './../pages/auth/ForgotPassword.vue';
import ResetPassword from './../pages/auth/ResetPassword.vue';
import NotFound from './../pages/NotFound.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: HomeLayout,
      children: [
        { 
          path: '', 
          name: 'home', 
          component: Home, 
          meta: { requiresAuth: false }
        },
        { path: 'chats', name: 'chatlist', component: ChatList, meta: { requiresAuth: true } },
        { path: 'chatroom/:id', name: 'chatroom', component: ChatRoom, meta: { requiresAuth: true } },
        { path: 'profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },
        { path: 'favorite', name: 'favorite', component: Favorite, meta: { requiresAuth: true } },
        { path: 'housika', name: 'housika', component: Housika, meta: { requiresAuth: false } },
      ]
    },
    {
      path: '/landlord',
      component: LandlordPortal,
      meta: { requiresAuth: true },
      children: [
        { path: 'add', name: 'add', component: AddProperty },
        { path: 'bookings', name: 'bookings', component: Bookings },
        { path: 'receipt', name: 'receipt', component: Receipt },
        { path: 'editproperty/:id', name: 'editproperty', component: EditProperty },
        { path: 'dashboard', name: 'dashboard', component: Dashboard },
        { path: 'managelistings', name: 'managelistings', component: ManageListings }
      ]
    },
    {
      path: '/product',
      component: ProductLayout,
      children: [
        { path: 'filter/:category', name: 'filter', component: Filter, meta: { requiresAuth: false } },
        { path: 'confirm/:id', name: 'confirm', component: Confirm, meta: { requiresAuth: true } },
        { path: 'search/:searchText', name: 'search', component: Search, meta: { requiresAuth: false } },
        { path: 'success', name: 'success', component: Success, meta: { requiresAuth: true } },
        { path: 'failed', name: 'failed', component: Failed, meta: { requiresAuth: true } },
        { path: 'details/:id', name: 'details', component: Details, meta: { requiresAuth: false } },
      ]
    },
    {
      path: '/auth',
      component: AuthLayout,
      meta: { guestOnly: true },
      children: [
        { path: 'login', name: 'login', component: Login, meta: { requiresAuth: false } },
        { path: 'signup', name: 'signup', component: Signup, meta: { requiresAuth: false } },
        { path: 'forgotpassword', name: 'forgotpassword', component: ForgotPassword, meta: { requiresAuth: false } },
        { path: 'resetpassword', name: 'resetpassword', component: ResetPassword, meta: { requiresAuth: false } },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ]
});

// Cache auth state to prevent repeated checks
let authCheckPromise = null;
let lastAuthCheck = 0;
const AUTH_CHECK_TTL = 5000; // 5 seconds cache

async function checkAuth() {
  const now = Date.now();
  if (!authCheckPromise || now - lastAuthCheck > AUTH_CHECK_TTL) {
    authCheckPromise = account.get().then(
      () => { lastAuthCheck = now; return true; },
      () => { lastAuthCheck = now; return false; }
    );
  }
  return authCheckPromise;
}

// Auth Guard (unchanged)
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const guestOnly = to.meta.guestOnly;
  
  if (!requiresAuth && !guestOnly) {
    return next();
  }

  const isAuthenticated = await checkAuth();

  if (requiresAuth && !isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
      replace: true
    });
  }

  if (guestOnly && isAuthenticated) {
    return next({ name: 'home', replace: true });
  }

  next();
});

export default router;