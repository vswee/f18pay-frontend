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
import {
  mapGetters
} from 'vuex';

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
      keyivIfIDSet: 'keyiv',
    })
  },
  methods: {
    async checkUsername() {
      this.message = false;
      this.working = true;
      if (!this.usernameManual || this.usernameManual.length == 0) {
        this.message = "Please enter your email address"
      } else {
        const username = await this.$store.dispatch('encrypt', {
          string: this.usernameManual,
          keyiv: this.keyiv
        });
        fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + '/check-username-for-activation', {
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
            this.usernameManualConfirmedBool = data.usernameConfirmed
            this.message = data.debug ? data.debug : false;
            if (data.usernameConfirmed == true) {
              this.$store.commit("setUser", this.usernameManual);
            }
            this.working = false
          })
          .catch((error) => {
            this.message = this.message + ' \nError: ' + error + '\n';
            console.error("Error:", error);
          });
      }
    },
    async checkCode() {
      this.message = false;
      this.working = true;
      if (this.code.length >= 6 && (this.username || this.usernameManual)) {
        const username = await this.$store.dispatch('encrypt', {
          string: this.username,
          keyiv: this.keyiv
        });
        fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + '/code-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
            this.message = this.message + ' \nError: ' + error + '\n';
            console.error("Error:", error);
          });
      } else {
        this.message = "Invalid code entered. Try again."
        this.working = false

      }
    },
    async getNewCode() {
      this.message = false;
      this.working = true;
      if (this.username || this.usernameManual) {
        let username = false
        if (this.username) {
          username = await this.$store.dispatch('encrypt', {
            string: this.username,
            keyiv: this.keyiv
          });
        } else {
          username = await this.$store.dispatch('encrypt', {
            string: this.usernameManual,
            keyiv: this.keyiv
          });
        }
        fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + '/request-new-code', {
          method: 'POST',
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
            this.message = data.debug ? data.debug : false
            if (data.proceed == true) {
              this.message = "If email is valid a new code will be sent immediately."
            }
            this.working = false
          })
          .catch((error) => {
            this.message = this.message + ' \nError: ' + error + '\n';
            console.error("Error:", error);
          });
      } else {
        this.message = "Email missing. Refresh this page to try again."
        this.working = false

      }
    }
  },
  mounted() { },
  async created() {
    if (this.session) {
      this.$router.push('dashboard');
      return
    }
    if (!this.keyivId) {
      fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + "/get-keyiv", {
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
    } else {
      this.keyiv = this.keyivIfIDSet
    }
  },
};
</script>

<style lang="scss">
@import "@/assets/css/login.scss";
</style>
