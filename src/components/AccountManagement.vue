<template>
  <div class="account-page">
    <div class="account-page-heading">
      <div>
        <p class="eyebrow">Account</p>
        <h1>Account Management</h1>
        <p class="help-text">Manage the details and security settings for your F18 Pay account.</p>
      </div>
      <i class="fas fa-user-cog account-page-icon" aria-hidden="true"></i>
    </div>

    <div v-if="loading" class="form working account-status" aria-live="polite">
      <h2>Loading account details</h2>
      <p class="help-text">Please wait while we securely fetch your account.</p>
    </div>

    <template v-else-if="account">
      <div v-if="message" class="message account-message" role="status">{{ message }}</div>

      <div class="account-grid">
        <section class="account-card">
          <div class="account-card-heading">
            <div>
              <p class="eyebrow">Profile</p>
              <h2>Account details</h2>
            </div>
            <i class="fas fa-id-card" aria-hidden="true"></i>
          </div>

          <form class="account-form" @submit.prevent="saveAccount">
            <label for="account-email">Email address</label>
            <input id="account-email" :value="account.email" type="email" disabled>
            <small class="field-help">Your email address is used as your account identity and cannot be changed here.</small>

            <label for="account-display-name">Display name</label>
            <input id="account-display-name" v-model="displayName" type="text" maxlength="100" autocomplete="name">

            <button class="btn" type="submit" :disabled="working || !displayName.trim()">
              <i class="fas fa-save"></i>
              {{ working ? 'Saving' : 'Save details' }}
            </button>
          </form>
        </section>

        <section class="account-card">
          <div class="account-card-heading">
            <div>
              <p class="eyebrow">Security</p>
              <h2>Protect your account</h2>
            </div>
            <i class="fas fa-shield-alt" aria-hidden="true"></i>
          </div>
          <p>Review your email verification status and the security checks used for sensitive changes.</p>
          <div class="account-actions">
            <router-link class="account-action" :to="{ name: 'account-security' }">
              <i class="fas fa-lock"></i>
              <span><b>Security settings</b><small>Review verification and session protection</small></span>
              <i class="fas fa-arrow-right"></i>
            </router-link>
            <router-link class="account-action" :to="{ name: 'account-password' }">
              <i class="fas fa-key"></i>
              <span><b>Change password</b><small>Confirm with your current password and email code</small></span>
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/stores';
import { apiUrl } from '@/utils/api';

const router = useRouter();
const store = useMainStore();
const { user, keyiv, keyivId } = storeToRefs(store);

const account = ref(null);
const displayName = ref('');
const loading = ref(true);
const working = ref(false);
const message = ref('');

const accountRequest = async (path, body = {}) => {
  const username = await store.encrypt({ string: user.value, keyiv: keyiv.value });
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...body,
      username,
      fingerprint: store.fingerprint,
      keyivId: keyivId.value,
    }),
  });
  return response.json();
};

const loadAccount = async () => {
  loading.value = true;
  store.setWorking(true);

  try {
    if (!await store.verifySession(false)) {
      router.push({ name: 'home' });
      return;
    }

    const data = await accountRequest('/account-details');
    if (data.proceed === true) {
      account.value = data.account;
      displayName.value = data.account.username || '';
    } else {
      message.value = data.debug || 'Unable to load account details.';
    }
  } catch (error) {
    message.value = 'Unable to load account details. Please try again.';
    console.error('Account details error:', error);
  } finally {
    loading.value = false;
    store.setWorking(false);
  }
};

const saveAccount = async () => {
  message.value = '';
  working.value = true;
  store.setWorking(true);

  try {
    const data = await accountRequest('/account-update', {
      displayName: await store.encrypt({ string: displayName.value.trim(), keyiv: keyiv.value }),
    });

    if (data.proceed === true) {
      account.value = data.account;
      displayName.value = data.account.username || '';
      message.value = 'Account details updated.';
    } else {
      message.value = data.debug || 'Unable to update account details.';
    }
  } catch (error) {
    message.value = 'Unable to update account details. Please try again.';
    console.error('Account update error:', error);
  } finally {
    working.value = false;
    store.setWorking(false);
  }
};

onMounted(loadAccount);
</script>

<style lang="scss">
@import "@/assets/css/login.scss";
@import "@/assets/css/account.scss";
</style>
