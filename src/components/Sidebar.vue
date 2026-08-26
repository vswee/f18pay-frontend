<template>
  <div id="sidebar" :style="'width:' + sidebarWidth + 'px'" v-if="session">
    <div class="sidebar-outer-wrapper-outer">
      <div class="sidebar-outer-wrapper">
        <div class="sidebar-inner-wrapper">
          <div class="sidebar-inner-wrapper-inner">
            <div :class="`${sidebarCollapse ? 'sidebar' : ''}' sidebar collapse'`">
              <a :class="`${sidebarCollapse ? 'collapse-sidebar collapsed' : ''}' collapse-sidebar'`"
                @click="toggleCollapse()" :title="!sidebarCollapse ? 'Expand sidebar.' : 'Collapse sidebar.'"></a>
              <div
                :class="[storesDropdown ? 'sidebar-shortcuts dropdown open store-length-' + storeList.length : 'sidebar-shortcuts dropdown store-length-' + storeList.length]"
                @click="storesDropdown = !storesDropdown">
                <template v-if="(!activeStore)">
                  <template v-if="storeList.length > 1">
                  <div class="sidebar-shortcut active">
                    <i class="fas fa-th"></i>
                    <span class="collapsible"><span class="text"> Select Store </span></span>
                  </div>
                </template>
                <template v-else>
                </template>
                </template>
                <template v-else>
                  <div class="sidebar-shortcut active">
                    <span class="store-flag">
                      <i :style="'background: #' + activeStore.store_colour"></i>
                      <i :style="'background: #' + activeStore.store_accent_colour"></i>
                    </span>
                    <span class="collapsible">
                      <span class="text">{{ decodedString(activeStore.store_name) }}</span>
                      <span :class="'badge ' + activeStore.network">{{ activeStore.network }}</span>
                    </span>
                  </div>
                </template>
                <template v-for="store in storeList">
                  <template v-if="activeStore == store.store_id">
                    <div class="sidebar-shortcut active" :key="store.store_id"
                      @click="activeStore != store.store_id && (openStore(store.store_id))">
                      <span class="store-flag">
                        <i :style="'background: #' + store.store_colour"></i>
                        <i :style="'background: #' + store.store_accent_colour"></i>
                      </span>
                      <span class="collapsible">
                        <span class="text">{{ decodedString(store.store_name) }}</span>
                        <span :class="'badge ' + store.network">{{ store.network }}</span>
                      </span>
                    </div>
                  </template>
                  <template v-if="activeStore != store.store_id && storesDropdown">
                    <div class="sidebar-shortcut" :key="store.store_id"
                      @click="activeStore != store.store_id && (openStore(store.store_id))">
                      <span class="store-flag">
                        <i :style="'background: #' + store.store_colour"></i>
                        <i :style="'background: #' + store.store_accent_colour"></i>
                      </span>
                      <span class="collapsible">
                        <span class="text">{{ decodedString(store.store_name) }}</span>
                        <span :class="'badge ' + store.network">{{ store.network }}</span>
                      </span>
                    </div>
                  </template>
                </template>
              </div>
              <div class="sidebar-shortcuts" v-if="$route.params.storeId10 && storeList[0]?.store_id">
                <a :class="`${currentRouteName == 'StoreSummary' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="openStore($route.params.storeId10)"><i class="fas fa-chart-area"></i><span
                    class="collapsible">Store
                    Overview</span></a>
                <a :class="`${currentRouteName == 'StoreSettings' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="settingsView()"><i class="fas fa-sliders-h"></i><span class="collapsible">Manage
                    Store</span></a>
                <a :class="`${currentRouteName == 'WalletSettings' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="walletView()"><i class="fas fa-wallet"></i><span class="collapsible">Wallet</span></a>
                <a :class="`${currentRouteName == 'StoreAssets' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="assetsView()"><i class="fas fa-code"></i><span class="collapsible">Payment Assets</span></a>
                <a :class="`${currentRouteName == 'Invoices' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="invoicesView()"><i class="fas fa-file-invoice"></i><span
                    class="collapsible">Invoices</span></a>
                <a :class="`${currentRouteName == 'PaymentRequest' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="requestsView()"><i class="fas fa-inbox"></i><span class="collapsible">Payment
                    Requests</span></a>
              </div>
              <div class="sidebar-shortcuts">
                <a class="sidebar-shortcut" @click="newStore()"><i class="fas fa-plus"></i><span
                    class="collapsible">Create
                    {{ storeList.length == 0 ? 'First' : 'New' }} Store</span></a>
              </div>
              <div class="sidebar-footer">
                <button
                  class="sidebar-drawer-toggle"
                  :class="accountRouteActive ? 'active-bar' : ''"
                  type="button"
                  aria-controls="sidebar-footer-drawer"
                  :aria-expanded="footerDrawerOpen"
                  @click="footerDrawerOpen = !footerDrawerOpen"
                  title="Toggle account shortcuts"
                >
                  <i class="fas fa-user-cog"></i>
                  <span class="collapsible">Account shortcuts</span>
                  <i :class="footerDrawerOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" aria-hidden="true"></i>
                </button>
                <Transition name="sidebar-drawer">
                  <div id="sidebar-footer-drawer" class="sidebar-drawer" v-show="footerDrawerOpen">
                    <div class="sidebar-shortcuts sidebar-account">
                      <router-link class="sidebar-shortcut" :class="currentRouteName == 'account' ? 'active-bar' : ''" :to="{ name: 'account' }">
                        <i class="fas fa-id-card"></i>
                        <span class="collapsible">Account Management</span>
                      </router-link>
                      <div class="sidebar-account-email collapsible">{{ user }}</div>
                      <router-link class="sidebar-shortcut" :class="currentRouteName == 'account-security' ? 'active-bar' : ''" :to="{ name: 'account-security' }">
                        <i class="fas fa-shield-alt"></i>
                        <span class="collapsible">Security settings</span>
                      </router-link>
                      <router-link class="sidebar-shortcut" :class="currentRouteName == 'account-password' ? 'active-bar' : ''" :to="{ name: 'account-password' }">
                        <i class="fas fa-key"></i>
                        <span class="collapsible">Change password</span>
                      </router-link>
                      <a class="sidebar-shortcut" @click="logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span class="collapsible">Log Out</span>
                      </a>
                    </div>
                  </div>
                </Transition>
                <div class="sidebar-build-info">
                    <a class="sidebar-info-link" href="https://github.com/vswee/f18pay-frontend" target="_blank"
                      rel="noopener" title="F18 Pay Github">
                      <i class="fab fa-github"></i>
                      <span class="collapsible">F18 Pay project</span>
                    </a>
                    <a class="sidebar-info-link" href="https://flat18.co.uk/privacy" target="_blank"
                      rel="noopener" title="Flat18 Umbrella Privacy Policy">
                      <i class="fas fa-shield-alt"></i>
                      <span class="collapsible">Privacy policy</span>
                    </a>
                    <span class="sidebar-build-line" :title="`Build ${buildIdentifier}`">
                      <i class="fas fa-code-branch"></i>
                      <span class="collapsible">Build {{ buildIdentifier }}</span>
                    </span>
                    <span class="sidebar-build-line" :title="`Environment: ${buildEnvironment}`">
                      <i class="fas fa-server"></i>
                      <span class="collapsible">{{ buildEnvironment }}</span>
                    </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'AppSidebar' });

import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const store = useMainStore();

// Reactive state
const storesDropdown = ref(false);
const sidebarWidth = ref(false);
const storeId10 = ref(false);
const footerDrawerOpen = ref(false);

// Store state with storeToRefs for reactivity
const { session, stores, sidebarCollapse, user } = storeToRefs(store);

const buildIdentifier = process.env.VITE_APP_GIT_HASH || 'local';
const buildEnvironment = import.meta.env.MODE || 'production';

// Computed properties
const currentRouteName = computed(() => route.name);
const accountRouteActive = computed(() => ['account', 'account-security', 'account-password'].includes(currentRouteName.value));
const storeList = computed(() => Array.isArray(stores.value) ? stores.value : []);
const activeStore = computed(() => {
  let current = false;
  if (currentRouteName.value) {
    for (const sto of storeList.value) {
      if (`${sto.store_id.substring(0, 5)}${sto.store_id.substring(sto.store_id.length - 5)}` === route.params.storeId10) {
        current = sto;
        break;
      }
    }
    return current;
  }
  return false;
});

// Watchers
watch(activeStore, (newVal) => {
  if (newVal && newVal.store_id) {
    storeId10.value = newVal.store_id.substring(0, 5) + newVal.store_id.substring(newVal.store_id.length - 5);
  }
});

watch(accountRouteActive, (active) => {
  if (active) {
    footerDrawerOpen.value = true;
  }
});

// Lifecycle hooks
onMounted(() => {
  if (document.getElementById("main")) {
    document.documentElement.style.setProperty('--main', document.getElementById("main").getBoundingClientRect().width + "px");
  }

  if (!activeStore.value && activeStore.value !== 'false') {
    store.setActiveStore(false);
    store.setStoreView(false);
    store.setViewTitle(false);
  }
});

// Methods
const decodedString = (string) => {
  return decodeURIComponent(decodeURI(string));
};

const toggleCollapse = () => {
  store.setSidebarCollapse(!sidebarCollapse.value);
  if (document.getElementById("main")) {
    document.documentElement.style.setProperty('--main', document.getElementById("main").getBoundingClientRect().width + "px");
  }
};

const openStore = (id) => {
  storeId10.value = id.substring(0, 5) + id.substring(id.length - 5);
  store.setViewTitle('Store Overview');
  router.push({ name: 'StoreSummary', params: { storeId10: storeId10.value } });
};

const settingsView = () => {
  store.setViewTitle('Manage Store');
  router.push({ name: 'StoreSettings', params: { storeId10: route.params.storeId10 } });
};

const walletView = () => {
  store.setViewTitle('Wallet');
  router.push({ name: 'WalletSettings', params: { storeId10: route.params.storeId10 } });
};

const assetsView = () => {
  store.setViewTitle('Payment Assets');
  router.push({ name: 'StoreAssets', params: { storeId10: route.params.storeId10 } });
};

const invoicesView = () => {
  store.setViewTitle('Invoices');
  router.push({ name: 'Invoices', params: { storeId10: route.params.storeId10 } });
};

const requestsView = () => {
  store.setViewTitle('Payment Requests');
  router.push({ name: 'PaymentRequest', params: { storeId10: route.params.storeId10 } });
};

const newStore = () => {
  store.setStoreModalView('new');
};

const logout = () => {
  store.setFingerprint(false);
  store.setSession(false);
  router.push({ name: 'home' });
};

</script>

<style lang="scss" scoped>
#sidebar {
  transition: 0.05s linear;
  background: var(--black);
  display: grid;
  grid-template: auto auto auto auto 1fr auto/1fr;
  height: calc(100vh - 60px);
  position: sticky;
  top: 60px;

  .sidebar-outer-wrapper-outer {
    .sidebar-outer-wrapper {
      position: relative;
      width: 100%;
      height: calc(100vh - 60px);

      .sidebar-inner-wrapper {
        overflow-x: hidden;
        overflow-y: auto;
        height: calc(100vh - 60px);
        width: 100%;
        -ms-overflow-style: none;
        scrollbar-width: none;

        &::-webkit-scrollbar {
          display: none;
        }

        .sidebar-inner-wrapper-inner {
          position: static;
          height: 100%;
          .sidebar {
            display: flex; flex-direction: column;
            transition: 0.05s linear;

            &:not(.collapse) {
              width: max-content;
              max-width: calc(var(--main, 100vw) * .2);
            }
          }
        }
      }
    }
  }

  .sidebar {
    .compartmentalise {
      display: grid;
      grid-template: 1fr/auto auto 1fr;
      gap: .5rem;

      .text-clip {
        max-height: 2rem;
        max-width: 125px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
      }
    }

    .dropdown {
      &:not(.store-length-1) {
        &.open {
          box-shadow: 0 1px;
        }
      }

      &.open {
        display: grid;
        grid-auto-flow: row;

        &:not(.store-length-1) {
          .sidebar-shortcut {
            &.active {
              grid-row: 1/2;
              margin-bottom: .5rem;
              padding-top: 10px;
              padding-bottom: 10px;
              position: sticky;
              top: 15px;
              background: var(--shadow-20);
              z-index: 2;
              transform: translateY(-15px);

              &::after {
                content: "\f077";
                font-size: 0.8rem;
                font-family: 'Font Awesome 5 Free';
                font-weight: 900;
                -moz-osx-font-smoothing: grayscale;
                font-style: normal;
                font-variant: normal;
                text-rendering: auto;
                line-height: 1;
                margin-left: 10px;
              }

              grid-template-columns: 1.5rem 1fr auto;
            }

            &:not(.active) {
              // padding-left: 2rem;
              opacity: 0;
              animation: u0 200ms linear forwards 1;
            }
          }
        }
      }

      &:not(.open) {
        &:not(.store-length-1) {
          .sidebar-shortcut {
            &:not(.active) {
              display: none;
            }

            &.active {
              &::after {
                content: "\f078";
                font-size: 0.8rem;
                font-family: 'Font Awesome 5 Free';
                font-weight: 900;
                -moz-osx-font-smoothing: grayscale;
                font-style: normal;
                font-variant: normal;
                text-rendering: auto;
                line-height: 1;
                margin-left: 10px;
              }

              grid-template-columns: 1.5rem 1fr auto;
            }
          }
        }
      }

      .text {
        margin-right: 10px;
      }
    }

    @keyframes u0 {
      to {
        opacity: 1;
      }
    }
  }
}
</style>

<style lang="scss">
@import "@/assets/css/dashboard.scss";

.sidebar {
  min-height: 100%;

  .sidebar-footer {
    margin-top: auto;
  }

  .sidebar-account-heading,
  .sidebar-account-email,
  .sidebar-info-link,
  .sidebar-build-line {
    display: grid;
    grid-template-columns: 1.5rem 1fr;
    align-items: center;
    padding: 10px;
    margin: 5px 10px;

    > :first-child {
      text-align: center;
      font-size: 1.1rem;
    }
  }

  .sidebar-account-heading {
    font-weight: 500;
    cursor: default;
  }

  .sidebar-drawer-toggle {
    display: grid;
    grid-template-columns: 1.5rem 1fr auto;
    align-items: center;
    width: calc(100% - 20px);
    margin: 5px 10px;
    padding: 8px 10px;
    border: 0;
    border-radius: 7px;
    color: var(--white);
    background: transparent;
    text-align: left;
    cursor: pointer;

    > :first-child {
      text-align: center;
      font-size: 1.1rem;
    }

    > :last-child {
      font-size: 0.7rem;
      opacity: 0.6;
    }

    &:hover,
    &.active-bar {
      color: var(--accent);
      background: var(--shadow-20);
    }
  }

  .sidebar-drawer-enter-active,
  .sidebar-drawer-leave-active {
    max-height: 280px;
    overflow: hidden;
    transition: max-height 240ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 180ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .sidebar-drawer-enter-from,
  .sidebar-drawer-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-5px);
  }

  .sidebar-drawer-enter-to,
  .sidebar-drawer-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-drawer-enter-active,
    .sidebar-drawer-leave-active {
      transition-duration: 1ms;
    }
  }

  .sidebar-account-email,
  .sidebar-build-info {
    color: var(--accent);
  }

  .sidebar-account-email {
    font-size: 0.7rem;
    opacity: 0.7;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sidebar-build-info {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 10px;
    margin: 0 10px;
    padding: 6px 0 8px;
    border-top: 1px solid var(--dark);
    color: var(--white);
    font-size: 0.58rem;
    line-height: 1.1;
  }

  .sidebar-build-info .sidebar-info-link,
  .sidebar-build-info .sidebar-build-line {
    grid-template-columns: 0.9rem minmax(0, 1fr);
    min-width: 0;
    margin: 0;
    padding: 2px 0;
    opacity: 0.45;
    text-decoration: none;

    > :first-child {
      font-size: 0.65rem;
    }

    .collapsible {
      min-width: 0;
      margin-left: 4px;
      font-size: 0.58rem;
    }
  }

  .sidebar-build-info .sidebar-info-link:hover {
    opacity: 1;
  }

  >div {
    box-shadow: 0 1px 0 0 var(--dark);
  }

  .sidebar-shortcuts {
    padding: 15px 0;

    .sidebar-shortcut {
      &.active-bar {
        // box-shadow: inset -2px 0 0;
        color: var(--accent);
        background: var(--shadow-20);

        .collapsible {
          opacity: 1 !important;
        }
      }

      display: grid;
      grid-template-columns: 1.5rem 1fr;
      align-items: center;
      padding: 10px;
      cursor: pointer;
      margin: 5px 10px;
      border-radius: 7px;

      > :first-child {
        text-align: center;
        font-size: 1.1rem;
      }

      &:not(.active) {
        &:hover {
          .collapsible {
            opacity: 1;
          }

          &.active-bar {
            background: var(--shadow-30);
          }

          // box-shadow: inset -4px 0 0;
        }
      }

      &.active {
        .collapsible {
          opacity: 1;
        }
      }
    }
  }

  .collapsible {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    margin-left: 10px;
    font-weight: 400;
    font-size: 0.8rem;
    opacity: .5;

    i {
      font-size: 0.8rem;
    }
  }

  &:not(.collapse) {
    .sidebar-shortcuts {
      .sidebar-shortcut {
        &.active {}
      }
    }
  }

  &.collapse {
    text-align: center;

    .collapsible {
      display: none;
    }
  }

  &.collapse {
    .sidebar-shortcut {
      display: grid;
      grid-template-columns: auto;
      align-items: center;

      &:hover {
        .collapsible {
          position: absolute;
          left: calc(100% + 10px);
          padding: .5rem;
          box-shadow: 0 10px 30px -15px #000;
          border-radius: 6px;
          z-index: 2;
          background: var(--black);
          display: block;
          width: 100%;
          height: -webkit-max-content;
          height: -moz-max-content;
          height: max-content;
          min-width: 100px;
          margin: auto;
        }
      }
    }
  }
}

.collapse-sidebar {
  height: 2rem;
  width: 1rem;
  position: absolute;
  display: grid;
  grid-template: 1fr 1fr/ 1fr;
  left: calc(100% + 0px);
  padding: 0 1rem;
  margin: auto 0;
  top: 0;
  bottom: 0;
  cursor: pointer;

  &:before,
  &:after {
    content: '';
    height: 1rem;
    width: 3px;
    background: var(--accent);
    position: relative;
    transition: .2s ease;
  }

  &:hover {
    &.collapsed {
      &:before {
        transform-origin: 0 0;
        transform: rotate(15deg)translateY(1px);
      }

      &:after {
        transform-origin: 0 100%;
        transform: rotate(-15deg);
      }
    }

    &:not(&.collapsed) {
      &:before {
        transform-origin: 0 0;
        transform: rotate(-15deg)translateY(2px);
      }

      &:after {
        transform-origin: 0 100%;
        transform: rotate(15deg);
      }
    }
  }
}
</style>
