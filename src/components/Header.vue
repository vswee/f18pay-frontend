<template lang="">
<div class="header" id="header">
  <router-link :to="{name: session?'dashboard':'home'}" title="home" class="logo"><svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 158 201" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <clipPath id="a">
        <path clip-rule="evenodd" d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z" />
      </clipPath>
      <g fill="none" transform="matrix(.783337 0 0 1 -354.093 -485.418639)">
        <path d="m452.032 485.419h200.428v200.428h-200.428z" />
        <g transform="matrix(.887335 0 0 .695083 463.512 491.096)">
          <path d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z" />
          <g style="opacity:.4" clip-path="url(#a)" stroke="var(--accent)">
            <path d="m152.859 88.576c0 36.334-29.498 65.832-65.832 65.832-18.819 0-35.804-7.914-47.807-20.592" stroke-width="12.52" transform="matrix(1.8383 0 0 1.8383 -83.7675 -82.1042)" />
            <circle cx="87.027" cy="88.576" r="65.832" stroke-width="23.27" transform="matrix(.989007 0 0 .989007 -4.79082 -6.87718)" />
          </g>
          <path d="m100 10.547c49.37 0 89.453 40.083 89.453 89.453 0 93.284-109.752 139.496-157.332 155.146-5.028 1.597-10.516.699-14.774-2.416s-6.774-8.074-6.774-13.35c-.026-44.211-.026-139.38-.026-139.38 0-49.37 40.083-89.453 89.453-89.453z" stroke="var(--accent)" stroke-width="23.02" />
        </g>
      </g>
    </svg><b>F18 Pay</b></router-link>
  <div></div>

  <div class="links">
    <div class="links" v-if="!session">
      <router-link :to="{name: 'login'}" title="Log in to your account or sign up" class="link" v-if="currentRouteName!=='login'">log in</router-link>
    </div>
    <div class="links" v-if="session && currentRouteName">
      <router-link v-if="currentRouteName!=='dashboard'" :to="{name: 'dashboard'}" title="Access your dashboard" class="link">Dashboard</router-link>
      <a class="link" @click="logout()">Log Out</a>
    </div>
    <a class="link" @click="toggleTheme()">
      <i v-if="theme==='dark'" class="fas fa-sun"></i>
      <i v-if="theme==='light'" class="fas fa-moon"></i>
    </a>
  </div>
</div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: "Header",
  data() {
    return {
      currentRoute: false,
    }
  },
  computed: {
    ...mapGetters({
      fingerprint: 'fingerprint',
      session: 'session',
      theme: 'theme',
    }),
    currentRouteName() {
      return this.$route.name;
    }
  },
  methods: {
    logout() {
      this.$store.commit("setFingerprint", false);
      this.$store.commit("setSession", false);
      this.$router.push({
        name: 'home'
      });
    },
    toggleTheme() {
      this.$store.commit("setTheme", this.theme === 'dark' ? 'light' : 'dark');
    }
  },
  watch: {
    $route(to) {
      this.currentRoute = to.name;
    }
  }
}
</script>

<style lang="scss">
.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  padding: 10px;
  position: static;
  width: 100vw;
  align-items: center;
  box-shadow: 0 1px 0 0 var(--dark);

  .links {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.logo {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  font-size: 1.6rem;
  text-transform: uppercase;
  font-weight: 800;

  svg {
    height: 40px;
  }
}

.link {
  text-transform: uppercase;
  font-size: 14px;
  padding: 5px;
  cursor: pointer;

  &:hover {
    box-shadow: 0 2px 0 0
  }

  i {
    margin: auto 10px;
  }
}
</style>
