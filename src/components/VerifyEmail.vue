<template lang="">
<div>
  <div :class="working?'form working':'form'">
    <h1>Verify Email</h1>
    <p class="help-text">Enter the information below to confirm your account.</p>
    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>

    <div class="form-section" v-if="!usernameManualConfirmedBool && !username">
      <label for="username">email</label>
      <input v-model="usernameManual" type="email" placeholder="email@example.com" v-on:keyup.enter="checkUsername()" />
      <div class="flex">
        <router-link :to="{name: 'home'}" class="btn sec"><i class="fas fa-times"></i>Exit</router-link>
        <a class="btn" @click="checkUsername()">Next<i class="fas fa-arrow-right"></i></a>
      </div>
    </div>

    <div class="form-section" v-if="usernameManualConfirmedBool || username">
      <label for="username">email</label>

      <input class="invisible" :value="usernameManual || username" type="text" :placeholder="usernameManual || username" disabled="disabled" />
      <div class="input-placeholder">
        {{usernameManual || username}} <i class="fas fa-check-circle good"></i>
      </div>

      <label for="code">code</label>
      <input v-model="code" type="text" placeholder="" v-on:keyup.enter="checkCode()" />

      <div class="flex">
        <router-link :to="{name: 'home'}" class="btn sec">Exit</router-link>
        <a class="btn sec" @click="getNewCode()">Get New Code<i class="fas fa-keyboard"></i></a>
        <a class="btn" @click="checkCode()">Finish<i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
    <p v-if="serverMessage"><small>{{serverMessage}}</small></p>
  </div>
</div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { apiUrl } from '@/utils/api';

const router = useRouter();
const store = useMainStore();

// Reactive state
const code = ref("");
const keyivLocal = ref(false);
const message = ref(false);
const working = ref(false);
const serverMessage = ref(false);
const usernameManual = ref("");
const usernameManualConfirmedBool = ref(false);

// Store state with storeToRefs for reactivity
const { session, user: username, keyivId, keyiv: keyivIfIDSet } = storeToRefs(store);

// Methods
const checkUsername = async () => {
  message.value = false;
  working.value = true;

  if (!usernameManual.value || usernameManual.value.length === 0) {
    message.value = "Please enter your email address";
    working.value = false;
    return;
  }

  try {
    const encryptedUsername = await store.encrypt({
      string: usernameManual.value,
      keyiv: keyivLocal.value
    });

    const response = await fetch(apiUrl('/check-username-for-activation'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: encryptedUsername,
        keyivId: keyivId.value
      }),
    });

    const data = await response.json();
    usernameManualConfirmedBool.value = data.usernameConfirmed;
    message.value = data.debug ? data.debug : false;

    if (data.usernameConfirmed === true) {
      store.setUser(usernameManual.value);
    }
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  } finally {
    working.value = false;
  }
};

const checkCode = async () => {
  message.value = false;
  working.value = true;

  if (code.value.length < 6 || (!username.value && !usernameManual.value)) {
    message.value = "Invalid code entered. Try again.";
    working.value = false;
    return;
  }

  try {
    const encryptedUsername = await store.encrypt({
      string: username.value,
      keyiv: keyivLocal.value
    });

    const response = await fetch(apiUrl('/code-verify'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: encryptedUsername,
        code: code.value,
        keyivId: keyivId.value
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      store.setUser(username.value);
      store.setFingerprint(data.fingerprint);
      router.push({ name: 'dashboard' });
    }
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  } finally {
    working.value = false;
  }
};

const getNewCode = async () => {
  message.value = false;
  working.value = true;

  if (!username.value && !usernameManual.value) {
    message.value = "Email missing. Refresh this page to try again.";
    working.value = false;
    return;
  }

  try {
    let encryptedUsername;

    if (username.value) {
      encryptedUsername = await store.encrypt({
        string: username.value,
        keyiv: keyivLocal.value
      });
    } else {
      encryptedUsername = await store.encrypt({
        string: usernameManual.value,
        keyiv: keyivLocal.value
      });
    }

    const response = await fetch(apiUrl('/request-new-code'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: encryptedUsername,
        keyivId: keyivId.value
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      message.value = "If email is valid a new code will be sent immediately.";
    }
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  } finally {
    working.value = false;
  }
};

// Lifecycle hooks
onBeforeMount(async () => {
  if (session.value) {
    router.push({ name: 'dashboard' });
    return;
  }

  if (!keyivId.value) {
    try {
      const response = await fetch(apiUrl('/get-keyiv'), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      serverMessage.value = data.debug ? data.debug : false;
      keyivLocal.value = data.keyiv;
      store.setKeyivId([data.keyivId, data.keyiv]);
    } catch (error) {
      message.value = `Error: ${error}`;
      console.error("Error:", error);
    }
  } else {
    keyivLocal.value = keyivIfIDSet.value;
  }
});
</script>

<style lang="scss">
@import "@/assets/css/login.scss";
</style>
