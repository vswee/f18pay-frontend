<template>
<div>
  <div :class="working ? 'form working' : 'form'" v-if="type === 'sign-up'">
    <h1>Sign up</h1>
    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{ message }}</div>
    <div class="form-section" v-if="!usernameConfirmed">
      <label for="username">email</label>
      <input v-model="username" type="email" placeholder="email@example.com" @keyup.enter="checkUsername()" />
      <div class="flex">
        <router-link :to="{ name: 'login' }" title="Log in to your account" class="btn sec"><i class="fas fa-arrow-circle-left"></i>Log in</router-link>
        <a class="btn" @click="checkUsername()">Next<i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
    <div class="form-section" v-if="usernameConfirmed">
      <label for="username">email</label>
      <input class="invisible" v-model="username" type="text" placeholder="username" disabled="disabled" />
      <div class="input-placeholder">
        {{ username }} <i class="fas fa-check-circle good"></i>
      </div>
      <label for="password">password</label>
      <input v-model="password" type="password" placeholder="" />
      <label for="password">confirm password</label>
      <input v-model="password2" type="password" placeholder="" @keyup.enter="checkPassword()" />
      <div class="flex">
        <a class="btn sec" @click="usernameConfirmed = false"><i class="fas fa-arrow-left"></i>Back</a>
        <a class="btn" @click="checkPassword()">Next<i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
    <p v-if="serverMessage"><small>{{ serverMessage }}</small></p>
  </div>
</div>
</template>

<script setup>
defineOptions({ name: 'AuthSignup' });

import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { apiUrl } from '@/utils/api';

const router = useRouter();
const store = useMainStore();

// Reactive state
const type = ref("sign-up");
const password = ref("");
const password2 = ref("");
const username = ref("");
const usernameConfirmed = ref(false);
const message = ref(false);
const working = ref(false);
const serverMessage = ref(false);

// Store state with storeToRefs for reactivity
const { session, keyiv, keyivId } = storeToRefs(store);

// Methods
const checkUsername = async () => {
  message.value = false;
  working.value = true;

  if (!username.value || username.value.length === 0) {
    message.value = "Please enter your email address";
    working.value = false;
    return;
  }

  try {
    const encryptedUsername = await store.encrypt({
      string: username.value,
      keyiv: keyiv.value
    });

    const response = await fetch(apiUrl('/check-username-pre-exist'), {
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
      message.value = data.debug ? data.debug : false;
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

  if (password.value !== password2.value) {
    message.value = "Passwords must match.";
    working.value = false;
    return;
  }

  try {
    const encryptedUsername = await store.encrypt({
      string: username.value,
      keyiv: keyiv.value
    });

    const encryptedPassword = await store.encrypt({
      string: password.value,
      keyiv: keyiv.value
    });

    const encryptedPassword2 = await store.encrypt({
      string: password2.value,
      keyiv: keyiv.value
    });

    const response = await fetch(apiUrl('/register-new-user'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: encryptedUsername,
        password: encryptedPassword,
        password2: encryptedPassword2,
        keyivId: keyivId.value
      }),
    });

    const data = await response.json();
    message.value = data.debug ? data.debug : false;

    if (data.proceed === true) {
      store.setUser(username.value);
      router.push({ name: 'verify-email' });
    } else {
      usernameConfirmed.value = false;
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
    serverMessage.value = data.debug ? data.debug : false;
    store.setKeyivId([data.keyivId, data.keyiv]);
  } catch (error) {
    message.value = `Error: ${error}`;
    console.error("Error:", error);
  }
});
</script>

<style lang="scss">
@import "@/assets/css/login.scss";
</style>
