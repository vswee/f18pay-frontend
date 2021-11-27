<template lang="">
<div>
  <div :class="working?'form working':'form'" v-if="type==='login'">
    <h1>Log in</h1>
    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
    <div class="form-section" v-if="!usernameConfirmed">
      <label for="username">email</label>
      <input v-model="username" type="text" placeholder="email@example.com" v-on:keyup.enter="checkUsername()" />
      <input type="password" placeholder="" value="false" class="invisible" />
      <div class="flex">

        <a class="btn" @click="checkUsername()">Next<i class="fas fa-arrow-right"></i></a>

      </div>
      <div class="centre">
        <router-link :to="{name: 'reset-password'}" title="Reset your password" class="link">Password reset</router-link>
      </div>
      <div class="centre">
        <router-link :to="{name: 'signup'}" title="Signup for F18 Pay" class="link">Sign up</router-link>
      </div>
    </div>
    <div class="form-section" v-if="usernameConfirmed">
      <label for="username">email</label>
      <input class="invisible" v-model="username" type="text" placeholder="username" disabled="disabled" />
      <div class="input-placeholder">
        {{username}} <i class="fas fa-check-circle good"></i>
      </div>
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
import Vue from "vue";
import VueCryptojs from "vue-cryptojs";
import {
  mapGetters
} from 'vuex';

Vue.use(VueCryptojs);

export default {
  name: "Login",
  data() {
    return {
      type: "login",
      keyiv: false,
      keyivId: false,
      password: "",
      username: "",
      usernameConfirmed: false,
      message: false,
      working: false,
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
        this.message = "Please enter your account email address"
      } else {
        const username = this.encrypt(this.username);
        fetch('https://money-api.flat18.co.uk/check-username', {
            method: 'POST', // or 'PUT'
            headers: {
              'Content-Type': 'multipart/form-data',
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
              this.$store.commit("setUser", false);
              this.message = "User does not exist";
            } else {
              this.$store.commit("setUser", this.username);
            }
            this.working = false
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    },
    checkPassword() {
      this.message = false;
      this.working = true;
      const encrypted = this.encrypt(this.password);
      const username = this.encrypt(this.username);
      fetch('https://money-api.flat18.co.uk/password-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: JSON.stringify({
            username: username,
            password: encrypted,
            keyivId: this.keyivId
          }),
        })
        .then((response) => response.json())
        .then((data) => {
          if (data.proceed == true && data.fingerprint) {
            console.log('ALL OK', this.username, data.fingerprint)
            this.$store.commit("setUser", this.username);
            this.$store.commit("setFingerprint", data.fingerprint);
            this.$router.push('dashboard');
          } else {
            this.$store.commit("setUser", false);
            this.usernameConfirmed = false
            this.message = "Check your login credentials and try again."
          }
          this.working = false
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  },
  mounted() {},
  async created() {
    if (this.session) {
      this.$router.push('dashboard');
      return
    }
    fetch("https://money-api.flat18.co.uk/get-keyiv", {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.json())
      .then((data) => {
        this.keyiv = data.keyiv
        this.keyivId = data.keyivId
        this.$store.commit("setKeyivId", [data.keyivId, data.keyiv]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  },
};
</script>

<style lang="scss">
@import "../assets/css/login.scss";
</style>
