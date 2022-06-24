<template lang="">
<div :class="session && (showTitle && viewTitle) && working?'header working':'header'" id="header">
  <a @click="clearToHome()" title="home" class="logo"><svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 158 201" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
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
    </svg>
    <b v-if="!showTitle || (!showTitle || !viewTitle)">F18 Pay</b>
    <b v-if="session && (showTitle && viewTitle)" class="ui-scroll-title">{{viewTitle}}</b>
  </a>
  <div :class="session && (showTitle && viewTitle) ? 'dynamic-cta-header-space active':'dynamic-cta-header-space'"></div>
  <div class="notification-workspace"><template v-if="authFailure">
      <div @click="clearAuthFailure" class="notification foot bad error">{{authFailure}}</div>
    </template></div>

  <div class="links">
    <div class="links" v-if="!session">
      <router-link :to="{name: 'login'}" title="Log in to your account or sign up" class="link" v-if="currentRouteName!=='login'">log in</router-link>
    </div>
    <a class="link" @click="toggleTheme()">
      <i v-if="theme==='dark'" class="fas fa-sun"></i>
      <i v-if="theme==='light'" class="fas fa-moon"></i>
    </a>
    <a class="link" href="https://github.com/vswee/f18pay-frontend" target="_blank" title="F18 Pay Github"><i class="fab fa-github"></i></a>
    <a class="link" href="https://twitter.com/f18micro" target="_blank" title="Flat18 Twitter"><i class="fab fa-twitter"></i></a>
    <div class="links" v-if="session && currentRouteName">
      <router-link v-if="currentRouteName!=='dashboard'" :to="{name: 'dashboard'}" title="Access your dashboard" class="link">Dashboard</router-link>
      <a class="link" @click="logout()">Log Out</a>
    </div>
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
      showTitle: 'showTitle',
      viewTitle: 'viewTitle',
      theme: 'theme',
      working: 'working',
      authFailure: 'authFailure',
    }),
    currentRouteName() {
      return this.$route.name;
    }
  },
  methods: {
    clearAuthFailure() {
      this.$store.commit('setAuthFailure', false)
      this.$router.push({
        name: 'home'
      });
    },
    clearToHome() {
      if (this.session) {
        if (this.$router.currentRoute.name !== 'dashboard') {
          this.$router.push({
            name: 'dashboard'
          });
        }
        this.$store.commit('setActiveStore', false)
        this.$store.commit('setStoreView', false);
        this.$store.commit('setViewTitle', false);
        this.$store.commit('setShowTitle', false);

      } else {
        if (this.$router.currentRoute.name !== 'home') {
          this.$router.push({
            name: 'home'
          });
        }
      }
    },
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
.notification {
  &.foot {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1.5rem;
    font-size: 1rem;
    z-index: 2;

    &::after,
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    &::after {
      z-index: -2;
      background: var(--black);
    }

    &::before {
      box-shadow: inset 0 0 0 400vw;
      z-index: -1;
      opacity: .2;
    }
  }
}

.header {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
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

    .links {
      margin: auto 20px;
    }
  }

  &.working {
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      display: block;
      position: absolute;
      height: 2px;
      width: 100%;
      left: 0;
      transition: 0.2s ease;
      background: linear-gradient(90deg, var(--black), var(--accent));
      -webkit-animation: shootingBar 1s ease forwards infinite;
      animation: shootingBar 1s ease forwards infinite;
      top: 0;
    }

    @keyframes shootingBar {
      from {
        transform: translateX(-100%);
      }

      to {
        transform: translateX(100%);
      }
    }
  }

  .dynamic-cta-header-space {
    .btn {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 14px;
      margin-left: 1rem;
    }

    &:not(.active) {
      visibility: hidden;
      pointer-events: none;
      height: 0px;
      width: 0px;
    }
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
  cursor: pointer;

  svg {
    height: 40px;
  }

  b {
    animation: slideUp .1s linear forwards 1;

    &.ui-scroll-title {
      text-transform: capitalize;
      font-weight: 400;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(-2rem);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
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
