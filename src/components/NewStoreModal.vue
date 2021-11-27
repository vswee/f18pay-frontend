<template lang="">
<div class="modal-input">
  <div :class="working?'form working':'form'" v-if="type==='login'">
    <h1>Create New Store</h1>
    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
    <div class="form-section" v-if="storeNameConfirmed">
      <label for="username">Store Name</label>
      <input v-model="name" type="text" placeholder="Store Name" />
      <label for="password">password</label>
      <input v-model="password" type="password" placeholder="" v-on:keyup.enter="checkPassword()" />
      <div class="flex">
        <a class="btn sec" @click="usernameConfirmed=false"><i class="fas fa-arrow-left"></i>Back</a>
        <a class="btn" @click="checkPassword()">Login<i class="fas fa-arrow-right"></i></a></div>
    </div>
  </div>
</div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: "NewStoreModal",
  data() {
    return {
      storeNameConfirmed:false,
      name: '',
      zpub: '',
    }
  },
  computed: {
    ...mapGetters({
      fingerprint: 'fingerprint',
      user: 'user',
      keyiv: 'keyiv',
      keyivId: 'keyivId',
      stores: 'stores',
    })
  },
  methods: {
    async createNewStore() {
      const username = await this.$store.dispatch('encrypt', {
        string: this.user,
        keyiv: this.keyiv
      });
      const storeName = await this.$store.dispatch('encrypt', {
        string: this.name,
        keyiv: this.keyiv
      });
      const zpub = await this.$store.dispatch('encrypt', {
        string: this.zpub,
        keyiv: this.keyiv
      });
      await fetch("https://money-api.flat18.co.uk/new-store", {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          body: JSON.stringify({
            username: username,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId,
            storeName: storeName,
            zpub: zpub,
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          this.message = data.debug ? data.debug : false
          if (data.proceed == true) {
            //HANDLE STORES DATA

          } else {
            this.message = "Failed to save store"
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    async setStoreLocal(object, value) {
      let temp = []
      for (const store of this.stores) {
        let tempObject = store;
        if (store.store_id == this.activeStore) {
          tempObject[object] = store[value];
        }
        temp.push(tempObject)
      }
      this.$store.commit("setStores", temp);
    }
  }
}
</script>

<style lang="">
  
</style>
