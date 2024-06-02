import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue';
import Login from '@/components/Login.vue';
import Signup from '@/components/Signup.vue';
import VerifyEmail from '@/components/VerifyEmail.vue';
import ResetPassword from '@/components/ResetPassword.vue';
import Dashboard from '@/components/Dashboard.vue';
import StoreSummary from '@/components/stores-views/StoreSummary.vue';
import StoreSettings from '@/components/stores-views/StoreSettings.vue';
import WalletSettings from '@/components/stores-views/WalletSettings.vue';
import StoreAssets from '@/components/stores-views/StoreAssets.vue';
import Invoices from '@/components/stores-views/Invoices.vue';
import PaymentRequest from '@/components/stores-views/PaymentRequest.vue';

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { title: 'Home', description: 'Welcome to our application!' } },
  {
    path: '/dashboard', name: 'Dashboard', component: Dashboard, children: [
      { path: 'store-summary/:storeId10', name: 'StoreSummary', component: StoreSummary },
      { path: 'manage-store/:storeId10', name: 'StoreSettings', component: StoreSettings },
    ], meta: { title: 'Dashboard', description: 'Manage your dashboard efficiently!' }
  },
  { path: '/login', name: 'Login', component: Login, meta: { title: 'Login', description: 'Login to access your account!' } },
  { path: '/signup', name: 'Signup', component: Signup, meta: { title: 'Signup', description: 'Sign up and join our community!' } },
  { path: '/verify-email', name: 'VerifyEmail', component: VerifyEmail, meta: { title: 'Verify Email', description: 'Verify your email address!' } },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword, meta: { title: 'Reset Password', description: 'Reset your password!' } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);

  // Find the nearest route element with meta tags.
  const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);

  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) document.title = nearestWithTitle.meta.title;

  // Remove any stale meta tags from the document using the key attribute we set below.
  Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(el => el.parentNode.removeChild(el));

  // Skip rendering meta tags if there are none.
  if (!nearestWithMeta) return next();

  // Turn the meta tag definitions into actual elements in the head.
  nearestWithMeta.meta.metaTags.map(tagDef => {
    const tag = document.createElement('meta');

    Object.keys(tagDef).forEach(key => {
      tag.setAttribute(key, tagDef[key]);
    });

    // We use this to track which meta tags we create, so we don't interfere with other ones.
    tag.setAttribute('data-vue-router-controlled', '');

    return tag;
  })
    // Add the meta tags to the document head.
    .forEach(tag => document.head.appendChild(tag));

  next();
});

export default router;
