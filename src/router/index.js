/* eslint-disable no-unused-vars */
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import Signup from '@/components/Signup'
import VerifyEmail from '@/components/VerifyEmail'
import ResetPassword from '@/components/ResetPassword'
import Dashboard from '@/components/Dashboard'
import StoreSummary from '@/components/stores-views/StoreSummary.vue';
import StoreSettings from '@/components/stores-views/StoreSettings.vue';
import WalletSettings from '@/components/stores-views/WalletSettings.vue';
import StoreAssets from '@/components/stores-views/StoreAssets.vue';
import InvoicesManager from '@/components/stores-views/InvoicesManager.vue';
import PaymentRequest from '@/components/stores-views/PaymentRequest.vue';
import InvoiceAPI from '../components/invoices/InvoiceAPI.vue'

if(window.location.protocol != 'https:') {
  if(location.href.indexOf("808")<0)
  location.href = location.href.replace("http://", "https://")
}

const app = createApp({})

const routes = [
  {
    path: "/", name: 'InvoiceAPI',
    // props: route => ({ query: route.query }),
    component: InvoiceAPI, meta: { title: 'Invoice API', description: 'Welcome to our application!' } 
  },
  { path: '/home', name: 'home', component: Home, meta: { title: 'Home', description: 'Welcome to our application!' } },
  {
    path: '/dashboard', name: 'dashboard', component: Dashboard, children: [
      { path: 'store-summary/:storeId10', name: 'StoreSummary', component: StoreSummary },
      { path: 'manage-store/:storeId10', name: 'StoreSettings', component: StoreSettings },
      { path: 'manage-store-wallet/:storeId10', name: 'WalletSettings', component: WalletSettings },
      { path: 'store-assets/:storeId10', name: 'StoreAssets', component: StoreAssets },
      { path: 'store-invoices/:storeId10', name: 'Invoices', component: InvoicesManager },
      { path: 'store-payment-requests/:storeId10', name: 'PaymentRequest', component: PaymentRequest },
    ], meta: { title: 'Dashboard', description: 'Manage your dashboard efficiently!' }
  },
  { path: '/login', name: 'login', component: Login, meta: { title: 'Login', description: 'Login to access your account!' } },
  { path: '/signup', name: 'signup', component: Signup, meta: { title: 'Signup', description: 'Sign up and join our community!' } },
  { path: '/verify-email', name: 'verify-email', component: VerifyEmail, meta: { title: 'Verify Email', description: 'Verify your email address!' } },
  { path: '/reset-password', name: 'reset-password', component: ResetPassword, meta: { title: 'Reset Password', description: 'Reset your password!' } },
];


const router = createRouter({
  history: createWebHistory(),
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
app.use(router)

// This callback runs before every route change, including on page load.
router.beforeEach((to, from, next) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);

  // Find the nearest route element with meta tags.
  const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);
  // const previousNearestWithMeta = from.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);

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

export default router