<template>
<div>
  <div :class="working ? 'form working' : 'form'" v-if="type === 'login'">
    <h1>Log in</h1>
    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{ message }}</div>
    <div class="form-section" v-if="!usernameConfirmed">
      <label for="username">email</label>
      <input v-model="username" type="text" ref="usernameRef" placeholder="email@example.com" @keyup.enter="checkUsername()" autofocus />
      <input type="password" v-model="password" placeholder="" value="false" class="invisible" />
      <div class="flex">
        <a class="btn" @click="checkUsername()">Next<i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="centre">
        <router-link :to="{ name: 'reset-password' }" title="Reset your password" class="link">Password reset</router-link>
      </div>
      <div class="centre">
        <router-link :to="{ name: 'signup' }" title="Signup for F18 Pay" class="link">Sign up</router-link>
      </div>
    </div>
    <div class="form-section" v-if="usernameConfirmed">
      <label for="username">email</label>
      <input class="invisible" v-model="username" type="text" placeholder="username" disabled="disabled" />
      <div class="input-placeholder">
        {{ username }} <i class="fas fa-check-circle good"></i>
      </div>
      <label for="password">password</label>
      <input v-model="password" type="password" placeholder="" @keyup.enter="checkPassword()" autofocus />
      <div class="flex">
        <a class="btn sec" @click="usernameConfirmed = false"><i class="fas fa-arrow-left"></i>Back</a>
        <a class="btn" @click="checkPassword()">Login<i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
defineOptions({ name: 'AuthLogin' });

import { ref, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { apiUrl } from '@/utils/api';

const router = useRouter();
const store = useMainStore();

// Reactive state
const type = ref("login");
const password = ref("");
const username = ref("");
const usernameConfirmed = ref(false);
const message = ref(false);
const working = ref(false);
const usernameRef = ref(null);

// Store state with storeToRefs for reactivity
const { session, keyiv, keyivId } = storeToRefs(store);

// Methods
const checkUsername = async () => {
  message.value = false;
  working.value = true;

  if (!username.value || username.value.length === 0) {
    message.value = "Please enter your account email address";
    working.value = false;
    return;
  }

  try {
    const encryptedUsername = await store.encrypt({
      string: username.value,
      keyiv: keyiv.value
    });

    const response = await fetch(apiUrl('/check-username'), {
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
    usernameConfirmed.value = data.usernameConfirmed;

    if (data.usernameConfirmed !== true) {
      store.setUser(false);
      message.value = "User does not exist";
    } else {
      store.setUser(username.value);
    }
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  } finally {
    working.value = false;
  }
};

const checkPassword = async () => {
  message.value = false;
  working.value = true;

  try {
    const encryptedUsername = await store.encrypt({
      string: username.value,
      keyiv: keyiv.value
    });

    const encryptedPassword = await store.encrypt({
      string: password.value,
      keyiv: keyiv.value
    });

    const response = await fetch(apiUrl('/password-login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: encryptedUsername,
        password: encryptedPassword,
        keyivId: keyivId.value
      }),
    });

    const data = await response.json();

    if (data.proceed === true && data.fingerprint) {
      store.setUser(username.value);
      store.setFingerprint(data.fingerprint);
      router.push({ name: 'dashboard' });
    } else {
      store.setUser(false);
      usernameConfirmed.value = false;
      message.value = "Check your login credentials and try again.";
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

  try {
    const response = await fetch(apiUrl('/get-keyiv'), {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = await response.json();
    store.setKeyivId([data.keyivId, data.keyiv]);
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  }
});

onMounted(() => {
  if (usernameRef.value && usernameRef.value.$el) {
    usernameRef.value.$el.focus();
  }
});
</script>

<style lang="scss">
@import "@/assets/css/login.scss";
</style>
