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

<script>
import Vue from "vue";
import VueCryptojs from "vue-cryptojs";
import {
  mapGetters
} from 'vuex';

Vue.use(VueCryptojs);

export default {
  name: "VerifyEmail",
  data() {
    return {
      type: "verify",
      code: "",
      keyiv: false,
      message: false,
      working: false,
      serverMessage: false,
      usernameManual: "",
      usernameManualConfirmedBool: false,
    };
  },
  computed: {
    ...mapGetters({
      fingerprint: 'fingerprint',
      session: 'session',
      username: 'user',
      keyivId: 'keyivId',
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
      if (!this.usernameManual || this.usernameManual.length == 0) {
        this.message = "Please enter your email address"
      } else {
        const username = this.encrypt(this.usernameManual);
        fetch('https://money-api.flat18.co.uk/check-username-for-activation', {
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
            this.usernameManualConfirmedBool = data.usernameConfirmed
            if (data.usernameConfirmed !== true) {
              this.message = data.debug ? data.debug : false;
            } else {
              this.$store.commit("setUser", this.usernameManual);
            }
            this.working = false
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    },
    checkCode() {
      this.message = false;
      this.working = true;
      if (this.code.length >= 6 && (this.username || this.usernameManual)) {
        const username = this.encrypt(this.username);
        fetch('https://money-api.flat18.co.uk/code-verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: JSON.stringify({
              username: username,
              code: this.code,
              keyivId: this.keyivId
            }),
          })
          .then((response) => response.json())
          .then((data) => {
            this.message = data.debug ? data.debug : false
            if (data.proceed == true) {
              this.$store.commit("setUser", this.username);
            this.$store.commit("setFingerprint", data.fingerprint);
              this.$router.push({
                name: 'dashboard'
              });
            }
            this.working = false
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else {
        this.message = "Invalid code entered. Try again."
        this.working = false

      }
    },
    getNewCode() {
      this.message = false;
      this.working = true;
      if (this.username || this.usernameManual) {
        const username = this.username ? this.encrypt(this.username) : this.encrypt(this.usernameManual);
        fetch('https://money-api.flat18.co.uk/request-new-code', {
            method: 'POST',
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
            this.message = data.debug ? data.debug : false
            if (data.proceed == true) {
              this.message = "If email is valid a new code will be sent immediately."
            }
            this.working = false
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else {
        this.message = "Email missing. Refresh this page to try again."
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
    if (!this.keyivId) {
      fetch("https://money-api.flat18.co.uk/get-keyiv", {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => response.json())
        .then((data) => {
          this.serverMessage = data.debug ? data.debug : false;
          this.keyiv = data.keyiv
          this.$store.commit("setKeyivId", [data.keyivId, data.keyiv]);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  },
};
</script>

<style lang="scss">
@import "../assets/css/login.scss";
</style>
