<template lang="">
<div id="sidebar" :class="sidebarCollapse?'sidebar':'sidebar collapse'" v-if="session">
  <a :class="sidebarCollapse?'collapse-sidebar collapsed':'collapse-sidebar'" @click="toggleCollapse()" title="Collapse or expand sidebar.">
  </a>
  <div :class="storesDropdown?'sidebar-shortcuts dropdown open store-length-'+stores.length:'sidebar-shortcuts dropdown store-length-'+stores.length" @click="storesDropdown=!storesDropdown">
    <div :class="activeStore==store.store_id?'sidebar-shortcut active':'sidebar-shortcut'" v-for="store in stores" :key="store.store_id" @click="activeStore!=store.store_id&&(openStore(store.store_id))">
      <span class="store-flag">
        <i :style="'background: #' + store.store_colour"></i>
        <i :style="'background: #' + store.store_accent_colour"></i>
      </span>
      <span class="collapsible">
        <span class="text">{{decodedString(store.store_name)}}</span>
        <span :class="'store-badge ' + store.network">
          {{store.network}}
        </span>
      </span>
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
      storesDropdown: false,
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

<style lang="scss" scoped>
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
            box-shadow: 0 1px;

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
            animation: u0 150ms linear forwards 1;
            opacity: 0;
            transform: scale(.5)translateY(1rem);
            animation-origin: center;

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

    .store-badge {
      display: inline-block;
      padding: .5px 6px;
      font-size: 10px;
      border-radius: 10px;
      text-transform: uppercase;
      font-weight: 800;

      &.btc {
        background: #ffa700;
        color: #441300;
      }

      &.eth {
        background: #5d76d7;
        color: #fff;
      }
    }
  }

  @keyframes u0 {
    to {
      opacity: 1;
      transform: scale(1)translateY(0)
    }
  }
}
</style>

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

        // background: var(--white);
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
    opacity: .7;

    i {
      font-size: 0.8rem;
    }
  }

  &:not(.collapse) {
    .sidebar-shortcuts {
      .sidebar-shortcut {
        &.active {
          // color: var(--black);
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
