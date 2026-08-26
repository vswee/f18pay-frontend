<template>
  <div class="account-page">
    <div class="account-page-heading">
      <div>
        <p class="eyebrow">Account security</p>
        <h1>Change password</h1>
        <p class="help-text">Changing your password requires your current password and a one-time code sent to your account email.</p>
      </div>
      <i class="fas fa-key account-page-icon" aria-hidden="true"></i>
    </div>

    <div v-if="message" class="message account-message" role="alert">{{ message }}</div>

    <div v-if="loading" class="form working account-status" aria-live="polite">
      <h2>Checking your session</h2>
      <p class="help-text">Please wait while we securely prepare this page.</p>
    </div>

    <form v-else class="form account-password-form" @submit.prevent="step === 1 ? requestCode() : changePassword()">
      <template v-if="step === 1">
        <h2>Choose a new password</h2>
        <p class="help-text">We will confirm your current password before sending the verification code.</p>

        <label for="current-password">current password</label>
        <input id="current-password" v-model="currentPassword" type="password" autocomplete="current-password" required>

        <label for="new-password">new password</label>
        <input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" required>
        <small class="field-help">Use at least 5 characters with uppercase, lowercase, a number, and a special character.</small>

        <label for="confirm-password">confirm new password</label>
        <input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" required>

        <div class="flex account-form-actions">
          <router-link class="btn sec" :to="{ name: 'account' }"><i class="fas fa-arrow-left"></i>Back</router-link>
          <button class="btn" type="submit" :disabled="working">
            <i class="fas fa-paper-plane"></i>{{ working ? 'Sending code' : 'Send verification code' }}
          </button>
        </div>
      </template>

      <template v-else>
        <h2>Enter your verification code</h2>
        <p class="help-text">A one-time code was sent to your account email. It expires after 10 minutes.</p>

        <label for="password-code">email verification code</label>
        <input id="password-code" v-model="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required>

        <div class="flex account-form-actions">
          <button class="btn sec" type="button" @click="step = 1"><i class="fas fa-arrow-left"></i>Back</button>
          <button class="btn" type="submit" :disabled="working">
            <i class="fas fa-check"></i>{{ working ? 'Updating password' : 'Update password' }}
          </button>
        </div>
        <button class="link-button" type="button" @click="requestCode(true)" :disabled="working">Send a new code</button>
      </template>
    </form>
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

const loading = ref(true);
const working = ref(false);
const message = ref('');
const step = ref(1);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const code = ref('');

const passwordIsSecure = (password) => /[A-Z]/.test(password)
  && /[a-z]/.test(password)
  && /[0-9]/.test(password)
  && /\W/.test(password)
  && password.length >= 5;

const encryptedRequest = async (path, values = {}) => {
  const encrypted = {};
  for (const [key, value] of Object.entries(values)) {
    encrypted[key] = await store.encrypt({ string: value, keyiv: keyiv.value });
  }

  const username = await store.encrypt({ string: user.value, keyiv: keyiv.value });
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...encrypted,
      username,
      fingerprint: store.fingerprint,
      keyivId: keyivId.value,
    }),
  });
  return response.json();
};

const requestCode = async (resend = false) => {
  message.value = '';
  if (!currentPassword.value || !passwordIsSecure(newPassword.value)) {
    message.value = 'Enter your current password and a stronger new password.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'New passwords must match.';
    return;
  }

  working.value = true;
  store.setWorking(true);
  try {
    const data = await encryptedRequest('/account-password-request-code', {
      currentPassword: currentPassword.value,
    });
    if (data.proceed === true) {
      step.value = 2;
      message.value = resend ? 'A new verification code has been sent.' : 'Verification code sent.';
    } else {
      message.value = data.debug || 'Unable to send a verification code.';
    }
  } catch (error) {
    message.value = 'Unable to send a verification code. Please try again.';
    console.error('Password code request error:', error);
  } finally {
    working.value = false;
    store.setWorking(false);
  }
};

const changePassword = async () => {
  message.value = '';
  if (!code.value || code.value.length !== 6) {
    message.value = 'Enter the six-digit verification code.';
    return;
  }

  working.value = true;
  store.setWorking(true);
  try {
    const data = await encryptedRequest('/account-password-change', {
      currentPassword: currentPassword.value,
      password: newPassword.value,
      password2: confirmPassword.value,
      code: code.value,
    });
    if (data.proceed === true) {
      if (data.fingerprint) {
        store.setFingerprint(data.fingerprint);
      }
      message.value = 'Password updated successfully.';
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      code.value = '';
      step.value = 1;
    } else {
      message.value = data.debug || 'Unable to update your password.';
    }
  } catch (error) {
    message.value = 'Unable to update your password. Please try again.';
    console.error('Password change error:', error);
  } finally {
    working.value = false;
    store.setWorking(false);
  }
};

onMounted(async () => {
  store.setWorking(true);
  try {
    if (!await store.verifySession(false)) {
      router.push({ name: 'home' });
    }
  } finally {
    loading.value = false;
    store.setWorking(false);
  }
});
</script>

<style lang="scss">
@import "@/assets/css/login.scss";
@import "@/assets/css/account.scss";

.account-password-form {
  max-width: 520px;
}

.account-password-form h2 {
  margin: 0;
}

.account-password-form input {
  width: 100%;
}

.account-form-actions {
  align-items: center;
  justify-content: flex-end;
  margin-top: 1rem;
}

.account-form-actions .btn {
  border: 0;
  cursor: pointer;
}

.account-form-actions .btn:disabled,
.link-button:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.link-button {
  background: transparent;
  border: 0;
  color: var(--accent);
  cursor: pointer;
  justify-self: center;
  padding: .5rem;
}
</style>
