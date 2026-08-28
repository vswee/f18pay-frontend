<template>
  <div class="account-page">
    <div class="account-page-heading">
      <div>
        <p class="eyebrow">Account</p>
        <h1>Security settings</h1>
        <p class="help-text">Your account uses the original F18 Pay session and email-code protection model.</p>
      </div>
      <i class="fas fa-shield-alt account-page-icon" aria-hidden="true"></i>
    </div>

    <div v-if="loading" class="form account-status" aria-live="polite">
      <h2>Checking account security</h2>
      <p class="help-text">Please wait while we securely fetch your account status.</p>
    </div>

    <template v-else-if="account">
      <div class="security-status" :class="account.emailVerified ? 'good' : 'partial'">
        <i :class="account.emailVerified ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        <span>
          <b>{{ account.emailVerified ? 'Email verified' : 'Email verification required' }}</b>
          <small>{{ account.emailVerified ? 'Your email can receive security codes.' : 'Complete email verification before sensitive account activity.' }}</small>
        </span>
      </div>

      <div class="account-grid">
        <section class="account-card">
          <div class="account-card-heading">
            <div>
              <p class="eyebrow">Session protection</p>
              <h2>Bound to your session</h2>
            </div>
            <i class="fas fa-fingerprint" aria-hidden="true"></i>
          </div>
          <p>Signed-in requests are checked against your current encrypted session fingerprint and IP address. Sessions expire after a period of inactivity.</p>
          <span class="security-pill"><i class="fas fa-check"></i> Active for this session</span>
        </section>

        <section class="account-card">
          <div class="account-card-heading">
            <div>
              <p class="eyebrow">Sensitive changes</p>
              <h2>Email code verification</h2>
            </div>
            <i class="fas fa-envelope-open-text" aria-hidden="true"></i>
          </div>
          <p>Password changes require your current password and a fresh one-time code sent to <span class="mono">{{ account.email }}</span>.</p>
          <router-link class="btn" :to="{ name: 'account-password' }"><i class="fas fa-key"></i>Change password</router-link>
        </section>
      </div>

      <router-link class="account-back-link" :to="{ name: 'account' }"><i class="fas fa-arrow-left"></i> Back to account management</router-link>
    </template>

    <div v-if="message" class="message account-message" role="alert">{{ message }}</div>
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
const loading = ref(true);
const message = ref('');

const loadSecurity = async () => {
  store.setWorking(true);
  try {
    if (!await store.verifySession(false)) {
      router.push({ name: 'home' });
      return;
    }

    const username = await store.encrypt({ string: user.value, keyiv: keyiv.value });
    const response = await fetch(apiUrl('/account-details'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fingerprint: store.fingerprint, keyivId: keyivId.value }),
    });
    const data = await response.json();
    if (data.proceed === true) {
      account.value = data.account;
    } else {
      message.value = data.debug || 'Unable to load account security.';
    }
  } catch (error) {
    message.value = 'Unable to load account security. Please try again.';
    console.error('Account security error:', error);
  } finally {
    loading.value = false;
    store.setWorking(false);
  }
};

onMounted(loadSecurity);
</script>

<style lang="scss">
@import "@/assets/css/account.scss";

.security-status {
  align-items: center;
  border-radius: 8px;
  display: flex;
  gap: .8rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
}

.security-status.good {
  background: var(--green-bg);
  color: var(--green);
}

.security-status.partial {
  background: var(--accent-bg);
  color: var(--accent);
}

.security-status span {
  display: grid;
  gap: .2rem;
}

.security-status small {
  color: var(--white);
  font-size: .75rem;
  opacity: .7;
}

.security-pill {
  color: var(--green);
  font-size: .8rem;
}

.security-pill i {
  margin-right: .4rem;
}

.account-back-link {
  color: var(--accent);
  display: inline-block;
  margin-top: 1.5rem;
}

.account-back-link i {
  margin-right: .4rem;
}
</style>
