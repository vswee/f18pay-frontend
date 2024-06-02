<template lang="">
<div>
  <div :class="working?'form working':'form'" v-if="type==='login'">
    <h1>Log in</h1>
    <div class="message" v-if="message"><i class="fas fa-exclamation-circle"></i> {{message}}</div>
    <div class="form-section" v-if="!usernameConfirmed">
      <label for="username">email</label>
      <input v-model="username" type="text" ref="username" placeholder="email@example.com" v-on:keyup.enter="checkUsername()" autofocus />
      <input type="password" v-model="password" placeholder="" value="false" class="invisible" />
      <div class="flex">

        <a class="btn" @click="checkUsername()">Next<i class="fas fa-arrow-right"></i></a>

      </div>
      <div class="centre">
        <router-link :to="{name: 'ResetPassword'}" title="Reset your password" class="link">Password reset</router-link>
      </div>
      <div class="centre">
        <router-link :to="{name: 'Signup'}" title="Signup for F18 Pay" class="link">Sign up</router-link>
      </div>
    </div>
    <div class="form-section" v-if="usernameConfirmed">
      <label for="username">email</label>
      <input class="invisible" v-model="username" type="text" placeholder="username" disabled="disabled" />
      <div class="input-placeholder">
        {{username}} <i class="fas fa-check-circle good"></i>
      </div>
      <label for="password">password</label>
      <input v-model="password" type="password" placeholder="" v-on:keyup.enter="checkPassword()" autofocus />
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
      key = this.$CryptoJS.SHA256(key).toString(this.$CryptoJS.enc.Hex).substr(0, 32);
      let iv = this.keyiv.substr(33);
      iv = this.$CryptoJS.SHA256(iv).toString(this.$CryptoJS.enc.Hex).substr(0, 16);
      const encrypted = this.$CryptoJS.AES.encrypt(string, this.$CryptoJS.enc.Utf8.parse(key), {
        iv: this.$CryptoJS.enc.Utf8.parse(iv),
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
        fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/check-username", {
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
              this.$store.commit("setUser", false);
              this.message = "User does not exist";
            } else {
              this.$store.commit("setUser", this.username);
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
      const encrypted = this.encrypt(this.password);
      const username = this.encrypt(this.username);
      fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/password-login", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          this.message = this.message + ' \nError: ' + error + '\n';
          console.error("Error:", error);
        });
    }
  },
  mounted() {
    if(this.$refs.username.$el)
   { this.$refs.username.$el.focus()}
  },
  async created() {
    if (this.session) {
      this.$router.push('dashboard');
      return
    }
    fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/get-keyiv", {
        headers: {
          "Content-Type": "multipart/form-data",
      },
        method:'get'
      })
      .then((response) => response.json())
      .then((data) => {
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
