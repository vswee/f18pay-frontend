<template lang="">
<div id="sidebar" :class="sidebarCollapse?'sidebar':'sidebar collapse'" v-if="session">
  <a :class="sidebarCollapse?'collapse-sidebar collapsed':'collapse-sidebar'" @click="toggleCollapse()" title="Collapse or expand sidebar.">
  </a>
  <div class="sidebar-shortcuts">
    <div :class="activeStore==store.store_id?'sidebar-shortcut active':'sidebar-shortcut'" v-for="store in stores" :key="store.store_id" @click="openStore(store.store_id)">
      <span class="store-flag">
        <i :style="'background: #' + store.store_colour"></i>
        <i :style="'background: #' + store.store_accent_colour"></i>
      </span>
      <span class="collapsible">{{decodedString(store.store_name)}} | <i class="fab fa-btc" v-if="store.network==='btc'"></i> <i class="fab fa-ethereum" v-if="store.network==='eth'"></i></span>
    </div>
  </div>
  <div></div>
  <div class="sidebar-shortcuts" v-if="activeStore && activeStore!=='false'">
    <a :class="storeView=='overview'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="summaryView()"><i class="fas fa-chart-area"></i><span class="collapsible">Store Overview</span></a>

    <a :class="storeView=='settings'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="settingsView()"><i class="fas fa-sliders-h"></i><span class="collapsible">Manage Store</span></a>

    <a :class="storeView=='buttons'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="assetsView()"><i class="fas fa-code"></i><span class="collapsible">Payment Assets</span></a>

    <a :class="storeView=='invoices'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="invoicesView()"><i class="fas fa-file-invoice"></i><span class="collapsible">Invoices</span></a>

    <a :class="storeView=='requests'?'sidebar-shortcut active-bar':'sidebar-shortcut'" @click="requestsView()"><i class="fas fa-inbox"></i><span class="collapsible">Payment Requests</span></a>
  </div>
  <div></div>
  <div class="sidebar-shortcuts">
    <a class="sidebar-shortcut" @click="newStore()"><i class="fas fa-plus"></i><span class="collapsible">Create New Store</span></a>
  </div>
</div>
</template>

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: "Sidebar",
  data() {
    return {

    }
  },
  computed: {
    ...mapGetters({
      session: 'session',
      stores: 'stores',
      sidebarCollapse: 'sidebarCollapse',
      activeStore: 'activeStore',
      storeView: 'storeView',
    })
  },
  async created() {
    let session = await this.$store.dispatch('verifySession')
    if (!session) {
      console.log("NO SESSION")
      this.$store.commit("setStores", false);
    }
  },
  mounted() {
    if (document.getElementById("main")) {
      document.documentElement.style.setProperty('--main', document.getElementById("main").getBoundingClientRect().width + "px")
    }
    if (!this.activeStore && this.activeStore !== 'false') {
      this.$store.commit('setActiveStore', false)
      this.$store.commit('setStoreView', false);
      this.$store.commit('setViewTitle', false);
    }
  },
  methods: {
    decodedString(string) {
      return decodeURIComponent(decodeURI(string));
    },
    toggleCollapse() {
      this.$store.commit("setSidebarCollapse", !this.sidebarCollapse);
      if (document.getElementById("main")) {
        document.documentElement.style.setProperty('--main', document.getElementById("main").getBoundingClientRect().width + "px")
      }
    },
    openStore(id) {
      this.$store.commit("setActiveStore", id);
      this.$store.commit("setStoreView", 'overview');
      this.$store.commit("setViewTitle", 'Store Overview');
    },
    summaryView() {
      this.$store.commit("setStoreView", 'overview');
      this.$store.commit("setViewTitle", 'Store Overview');
    },
    settingsView() {
      this.$store.commit("setStoreView", 'settings');
      this.$store.commit("setViewTitle", 'Manage Store');
    },
    assetsView() {
      this.$store.commit("setStoreView", 'buttons');
      this.$store.commit("setViewTitle", 'Payment Assets');
    },
    invoicesView() {
      this.$store.commit("setStoreView", 'invoices');
      this.$store.commit("setViewTitle", 'Invoices');
    },
    requestsView() {
      this.$store.commit("setStoreView", 'requests');
      this.$store.commit("setViewTitle", 'Payment Requests');
    },
    newStore() {
      this.$store.commit("setStoreModalView", 'new');
    },
  }
}
</script>

<style lang="scss">
@import "../assets/css/dashboard.scss";

.sidebar {
  >div {
    box-shadow: 0 1px 0 0 var(--dark);
  }

  .sidebar-shortcuts {
    padding: 15px 0;

    .sidebar-shortcut {
      &.active-bar {
        box-shadow: inset -4px 0 0;
      }
      display: grid;
      grid-template-columns: 1.5rem 1fr;
      align-items: center;
      padding: 10px;
      cursor: pointer;

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
        box-shadow: inset -6px 0 0;
      }
      // &:not(&.active-bar) {
      //   box-shadow: inset -2px 0 0;
      // }
        }
      }

      &.active {
        background: var(--white);
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
    opacity: .7;

    i {
      font-size: 0.8rem;
    }
  }

  &:not(.collapse) {
    .sidebar-shortcuts {
      .sidebar-shortcut {
        &.active {
          color: var(--black);
        }
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
        position: relative;

        .collapsible {
          position: absolute;
          bottom: 0;
          top: 0;
          right: 0;
          left: calc(100% + 10px);
          // font-size: 12px;
          // font-weight: 600;
          // text-transform: uppercase;
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
