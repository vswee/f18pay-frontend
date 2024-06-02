<template>
  <div :id="'sidebar'" :style="'width:' + sidebarWidth + 'px'" v-if="session">
    <div class="sidebar-outer-wrapper-outer">
      <div class="sidebar-outer-wrapper">
        <div class="sidebar-inner-wrapper">
          <div class="sidebar-inner-wrapper-inner">
            <div :class="[sidebarCollapse ? 'sidebar' : 'sidebar collapse']">
              <a :class="[sidebarCollapse ? 'collapse-sidebar collapsed' : 'collapse-sidebar']"
                @click="toggleCollapse()" :title="!sidebarCollapse ? 'Expand sidebar.' : 'Collapse sidebar.'"></a>
              <div
                :class="[storesDropdown ? 'sidebar-shortcuts dropdown open store-length-' + stores.length : 'sidebar-shortcuts dropdown store-length-' + stores.length]"
                @click="storesDropdown = !storesDropdown">
                <template v-if="(!activeStore || activeStore === 'false') && stores.length > 1">
                  <div class="sidebar-shortcut active">
                    <i class="fas fa-hand-pointer"></i>
                    <span class="collapsible"><span class="text"> Select Store </span></span>
                  </div>
                </template>
                <template v-for="store in stores">
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
              <div class="sidebar-shortcuts" v-if="$route.params.storeId10 && stores[0]?.store_id">
                <a :class="`${currentRouteName == 'StoreSummary' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="openStore($route.params.storeId10)"><i class="fas fa-chart-area"></i><span
                    class="collapsible">Store
                    Overview</span></a>
                <a :class="`${currentRouteName == 'StoreSettings' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="settingsView()"><i class="fas fa-sliders-h"></i><span class="collapsible">Manage
                    Store</span></a>
                <a :class="`${currentRouteName == 'xxx' ? 'active-bar' : ''} sidebar-shortcut`"
                  @click="walletView()"><i class="fas fa-wallet"></i><span class="collapsible">Wallet</span></a>
                <a :class="`${currentRouteName=='xxx' ? 'active-bar':''} sidebar-shortcut`"
                  @click="assetsView()"><i class="fas fa-code"></i><span class="collapsible">Payment Assets</span></a>
                <a :class="`${currentRouteName=='xxx' ? 'active-bar':''} sidebar-shortcut`"
                  @click="invoicesView()"><i class="fas fa-file-invoice"></i><span
                    class="collapsible">Invoices</span></a>
                <a :class="`${currentRouteName=='xxx' ? 'active-bar':''} sidebar-shortcut`"
                  @click="requestsView()"><i class="fas fa-inbox"></i><span class="collapsible">Payment
                    Requests</span></a>
              </div>
              <div class="sidebar-shortcuts">
                <a class="sidebar-shortcut" @click="newStore()"><i class="fas fa-plus"></i><span
                    class="collapsible">Create
                    {{ stores.length == 0 ? 'First' : 'New' }} Store</span></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeMount, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter()

const store = useStore();
const storesDropdown = ref(false);
const sidebarWidth = ref(false);

const session = computed(() => store.getters.session);
const stores = computed(() => store.getters.stores);
const sidebarCollapse = computed(() => store.getters.sidebarCollapse);
const activeStore = computed(() => store.getters.activeStore);
const storeView = computed(() => store.getters.storeView);
const currentRouteName = computed(() => route.name);

const toggleStoresDropdown = () => {
  storesDropdown.value = !storesDropdown.value;
  setSidebarWidth();
};

const setSidebarWidth = () => {
  setTimeout(() => {
    const sidebarElement = document.querySelector('.sidebar');
    if (sidebarElement) {
      sidebarWidth.value = sidebarElement.getBoundingClientRect().width;
    }
  }, 20);
};

const decodedString = (string) => {
  return decodeURIComponent(decodeURI(string));
};

const toggleCollapse = () => {
  store.commit("setSidebarCollapse", !sidebarCollapse.value);
  if (document.getElementById("main")) {
    document.documentElement.style.setProperty('--main', document.getElementById("main").getBoundingClientRect().width + "px");
  }
};

const state = reactive({
  storeId10: String,
})

const openStore = (id) => {
  state.storeId10 = id.substring(0, 5) + id.substring(id.length - 5)
  store.commit("setStoreView", 'overview');
  store.commit("setViewTitle", 'Store Overview');
  router.push({ name: 'StoreSummary', params: { storeId10: state.storeId10 } })
};

const settingsView = () => {
  store.commit("setStoreView", 'settings');
  store.commit("setViewTitle", 'Manage Store');
  router.push({ name: 'StoreSettings', params: { storeId10: state.storeId10 } })
};

const walletView = () => {
  store.commit("setStoreView", 'wallet');
  store.commit("setViewTitle", 'Wallet');
};

const assetsView = () => {
  store.commit("setStoreView", 'buttons');
  store.commit("setViewTitle", 'Payment Assets');
};

const invoicesView = () => {
  store.commit("setStoreView", 'invoices');
  store.commit("setViewTitle", 'Invoices');
};

const requestsView = () => {
  store.commit("setStoreView", 'requests');
  store.commit("setViewTitle", 'Payment Requests');
};

const newStore = () => {
  store.commit("setStoreModalView", 'new');
};

onBeforeMount(async () => {
  let session = await store.dispatch('verifySession', { flag: false, route: route.name, router: router });
  if (!session) {
    console.log("NO SESSION");
    store.commit("setStores", false);
  }
  setSidebarWidth();
});

onMounted(() => {
  if (document.getElementById("main")) {
    document.documentElement.style.setProperty('--main', document.getElementById("main").getBoundingClientRect().width + "px");
  }
  if (!activeStore.value && activeStore.value !== 'false') {
    store.commit('setActiveStore', false);
    store.commit('setStoreView', false);
    store.commit('setViewTitle', false);
  }
});

watch([storesDropdown, sidebarCollapse], () => {
  setSidebarWidth();
});
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

          .sidebar {
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
