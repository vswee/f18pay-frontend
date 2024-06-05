<template lang="">
<div>
  <div :class="working?'form working':'form'" v-if="type==='sign-up'">
    <h1>Password Reset</h1>
    <p class="help-text">Enter the information below to confirm your account and set a new password.</p>
    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
    <div class="form-section" v-if="!usernameConfirmed">
      <label for="username">email</label>
      <input v-model="username" type="email" placeholder="email@example.com" v-on:keyup.enter="checkUsername()" />
      <div class="flex">
        <router-link :to="{name: 'login'}" title="Log in to your account" class="btn sec"><i class="fas fa-arrow-circle-left"></i>Log in</router-link>
        <a class="btn" @click="checkUsername()">Next<i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
    <div class="form-section" v-if="usernameConfirmed">
      <label for="username">email</label>
      <input class="invisible" v-model="username" type="text" placeholder="username" disabled="disabled" />
      <div class="input-placeholder">
        {{username}} <i class="fas fa-check-circle good"></i>
      </div>
      <label for="password">password</label>
      <input v-model="password" type="password" placeholder="" />
      <label for="password">confirm password</label>
      <input v-model="password2" type="password" placeholder="" v-on:keyup.enter="checkPassword()" />
      <div class="flex">
        <a class="btn sec" @click="usernameConfirmed=false"><i class="fas fa-arrow-left"></i>Back</a>
        <a class="btn" @click="checkPassword()">Next<i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
    <p v-if="serverMessage"><small>{{serverMessage}}</small></p>
  </div>
</div>
</template>

<script>
import Vue from "vue";
import VueCryptojs from "vue-cryptojs";
import {
  mapGetters
} from 'vuex';

Vue.use(VueCryptojs);

export default {
  name: "Signup",
  data() {
    return {
      type: "sign-up",
      keyiv: false,
      keyivId: false,
      password: "",
      password2: "",
      username: "",
      usernameConfirmed: false,
      message: false,
      working: false,
      serverMessage: false,
    };
  },
  computed: {
    ...mapGetters({
      fingerprint: 'fingerprint',
      session: 'session',
    })
  },
  methods: {
    encrypt(string) {
      let key = this.keyiv.substr(0, 32);
      key = this.CryptoJS.SHA256(key).toString(this.CryptoJS.enc.Hex).substr(0, 32);
      let iv = this.keyiv.substr(33);
      iv = this.CryptoJS.SHA256(iv).toString(this.CryptoJS.enc.Hex).substr(0, 16);
      const encrypted = this.CryptoJS.AES.encrypt(string, this.CryptoJS.enc.Utf8.parse(key), {
        iv: this.CryptoJS.enc.Utf8.parse(iv),
      }).toString();
      return encrypted;
    },
    checkUsername() {
      this.message = false;
      this.working = true;
      if (!this.username || this.username.length == 0) {
        this.message = "Please enter your email address"
      } else {
        const username = this.encrypt(this.username);
        fetch('http://localhost:3000/check-username-for-password-reset', {
            method: 'POST', // or 'PUT'
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              keyivId: this.keyivId
            }),
          })
          .then((response) => response.json())
          .then((data) => {
            this.usernameConfirmed = data.usernameConfirmed
            if (data.usernameConfirmed !== true) {
              this.message = data.debug ? data.debug : false;
            }
            this.working = false
          })
          .catch((error) => {
            this.message = this.message + ' \nError: ' + error + '\n';
            console.error("Error:", error);
          });
      }
    },
    checkPassword() {
      this.message = false;
      this.working = true;
      if (this.password === this.password2) {
        const encrypted = this.encrypt(this.password);
        const encrypted2 = this.encrypt(this.password2);
        const username = this.encrypt(this.username);
        fetch('http://localhost:3000/register-new-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              password: encrypted,
              password2: encrypted2,
              keyivId: this.keyivId
            }),
          })
          .then((response) => response.json())
          .then((data) => {
            this.message = data.debug ? data.debug : false
            if (data.proceed == true) {
              this.$store.commit("setUser", this.username);
              this.$router.push({
                name: 'verify-email'
              });
            } else {
              this.usernameConfirmed = false
            }
            this.working = false
          })
          .catch((error) => {
            this.message = this.message + ' \nError: ' + error + '\n';
            console.error("Error:", error);
          });
      } else {
        this.message = "Passwords must match."
        this.working = false

      }
    }
  },
  mounted() {},
  async created() {
    if (this.session) {
      this.$router.push('dashboard');
      return
    }
    fetch(process.env.VUE_APP_APPLICATION_ENDPOINT + "/get-keyiv", {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.json())
      .then((data) => {
        this.serverMessage = data.debug ? data.debug : false;
        this.keyiv = data.keyiv
        this.keyivId = data.keyivId
        this.$store.commit("setKeyivId", [data.keyivId, data.keyiv]);
      })
      .catch((error) => {
        this.message = this.message + ' \nError: ' + error + '\n';
        console.error("Error:", error);
      });
  },
};
</script>

<style lang="scss">
@import "@/assets/css/login.scss";
</style>
