<template lang="">
<div id="footer" :class="session?'sessioned':''" v-if="!demoMode">
  <a class="btn help" @click="help=true" v-if="session && !help"><i class="fas fa-exclamation-circle"></i></a>
  <a class="btn help" @click="help=false" v-if="session && help"><i class="fas fa-times"></i></a>
  <div class="footer-inner" v-if="(session && help) || !session">

    <p class="copyright_" @click="help=false">
      Having a problem? Send us an email at <a href="mailto:f18pay.help@flat18.co.uk">f18pay.help@flat18.co.uk</a>
      <br><br>
      Found a bug or an issue with our frontend code? Submit an Issue or PR on our <a class="" href="https://github.com/vswee/f18pay-frontend" target="_blank" title="F18 Pay Github">GitHub page <i class="fab fa-github"></i></a><br><br>
      © Flat 18 Microsystems Development 2018-2022
      <br><br>This website does not use cookies.
      <br>
      <br>
      <a alt="" target="_blank" href="https://flat18.co.uk/privacy">Flat18 Umbrella Privacy Policy&nbsp;<i class="fas fa-arrow-right"></i></a>
    </p>
  </div>
</div>
</template>

<script setup>
defineOptions({ name: 'SiteFooter' });

import { ref } from 'vue';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';

const help = ref(false);
const demoMode = typeof window !== 'undefined' && window.localStorage.getItem('f18_demo_mode') === '1';
const store = useMainStore();
const { session } = storeToRefs(store);
</script>

<style lang="scss" scoped>
#footer {
  &.sessioned {
    position: fixed;

    .help {
      position: fixed;
      z-index: 2;
      bottom: 0;
      right: 0;
      font-weight: 200;
      background: transparent !important;
      font-size: 13px;

      &:not(:hover) {
        color: var(--accent) !important;
      }
    }

    .footer-inner {
      position: fixed;
      bottom: 10px;
      right: 10px;
      box-shadow: 0 0 50px -20px #000;
      border-radius: 10px;
      overflow: auto;
      // background: var(--accent-3);
    }
  }
}

.footer-inner {
  background: var(--dark);
  overflow: auto;
  padding: 20px;
  font-size: 12px;
}
</style>
