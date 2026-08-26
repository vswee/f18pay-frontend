<template>
  <div :class="theme">
    <div class="session-status">
      <span v-if="session">Logged in</span>
      <span v-else>Not logged in</span>
    </div>
    
    <div class="store-list" v-if="stores && stores.length > 0">
      <div v-for="store in stores" :key="store.store_id" class="store-item">
        {{ store.store_name }}
      </div>
    </div>
    
    <button @click="toggleTheme">Toggle Theme</button>
    <button @click="fetchStores">Fetch Stores</button>
  </div>
</template>

<script setup>
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

// Initialize the store
const store = useMainStore();

// Use storeToRefs to maintain reactivity when destructuring
const { theme, session, stores, user, keyiv, keyivId, fingerprint } = storeToRefs(store);

// Methods
const toggleTheme = () => {
  store.setTheme(theme.value === 'light' ? 'dark' : 'light');
};

const fetchStores = async () => {
  if (!session.value) {
    console.error('Not logged in');
    return;
  }
  
  try {
    const username = await store.encrypt({
      string: user.value,
      keyiv: keyiv.value,
    });
    
    const response = await fetch(`${import.meta.env.VITE_APP_APPLICATION_ENDPOINT}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        fingerprint: fingerprint.value,
        keyivId: keyivId.value,
      }),
    });
    
    const data = await response.json();
    
    if (data.proceed) {
      store.setStores(data.stores);
    } else {
      console.error('Failed to fetch stores');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Lifecycle hooks
onMounted(() => {
  store.verifySession(false);
});
</script>

<style scoped>
.dark {
  background-color: #333;
  color: white;
}

.light {
  background-color: #fff;
  color: #333;
}

.store-item {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin: 5px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
