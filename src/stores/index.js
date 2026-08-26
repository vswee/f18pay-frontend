import { defineStore } from 'pinia';
import CryptoJS from 'crypto-js';
import router from '../router';
import { apiUrl } from '@/utils/api';
import { isDemoMode } from '@/utils/demo';

// Main store for the application
export const useMainStore = defineStore('main', {
  state: () => ({
    theme: "light",
    fingerprint: false,
    user: false,
    session: false,
    keyivId: false,
    keyiv: false,
    stores: false,
    sidebarCollapse: false,
    activeStore: false,
    chart: { chartData: false, options: false },
    storeView: false,
    storeModalView: false,
    viewTitle: false,
    showTitle: false,
    time: false,
    epoch: '2025-01-01',
    working: false,
    notifications: {
      authFailure: false,
    },
    url: false,
  }),

  getters: {
    getFingerprint: (state) => state.fingerprint,
    getUser: (state) => state.user,
    getSession: (state) => state.session,
    getKeyivId: (state) => state.keyivId,
    getKeyiv: (state) => state.keyiv,
    getTheme: (state) => state.theme,
    getStoresData: (state) => state.stores, // Renamed to avoid conflict with action
    getSidebarCollapse: (state) => state.sidebarCollapse,
    getActiveStore: (state) => state.activeStore,
    getAuthFailure: (state) => state.notifications.authFailure,
    getChart: (state) => state.chart,
    getStoreView: (state) => state.storeView,
    getStoreModalView: (state) => state.storeModalView,
    getShowTitle: (state) => state.showTitle,
    getViewTitle: (state) => state.viewTitle,
    getTime: (state) => state.time,
    getEpoch: (state) => state.epoch,
    getWorking: (state) => state.working,
    getURL: (state) => state.url,
  },

  actions: {
    setFingerprint(payload) {
      this.fingerprint = payload;
      localStorage.setItem("fingerprint", payload);
    },

    setUser(payload) {
      this.user = payload;
      localStorage.setItem("user", payload);
    },

    setSession(payload) {
      this.session = payload;
    },

    setSidebarCollapse(payload) {
      this.sidebarCollapse = payload;
      localStorage.setItem("sidebarCollapse", payload);
    },

    setStores(payload) {
      this.stores = payload;
    },

    setActiveStore(payload) {
      this.activeStore = payload;
      localStorage.setItem("activeStore", payload);
    },

    setKeyivId(payload) {
      this.keyivId = payload[0];
      this.keyiv = payload[1];
      localStorage.setItem("keyivId", payload[0]);
      localStorage.setItem("keyiv", payload[1]);
    },

    setTheme(payload) {
      this.theme = payload;
      localStorage.setItem("theme", payload);
    },

    setAuthFailure(payload) {
      this.notifications.authFailure = payload;
    },

    setChart(payload) {
      this.chart.chartData = payload.chartData;
      this.chart.options = payload.options;
    },

    setStoreView(payload) {
      this.storeView = payload;
    },

    setViewTitle(payload) {
      this.viewTitle = payload;
    },

    setShowTitle(payload) {
      this.showTitle = payload;
    },

    setStoreModalView(payload) {
      this.storeModalView = payload;
    },

    setTime(payload) {
      this.time = payload;
    },

    dispatch(action, payload) {
      if (typeof this[action] === 'function') {
        return this[action](payload);
      }

      return undefined;
    },

    commit(mutation, payload) {
      if (typeof this[mutation] === 'function') {
        return this[mutation](payload);
      }

      return undefined;
    },

    setWorking(payload) {
      this.working = payload;
    },

    setURL(payload) {
      this.url = payload;
    },

    // Initialize the store from localStorage
    init() {
      if (localStorage.getItem("fingerprint")) {
        this.setFingerprint(localStorage.getItem("fingerprint"));
      }

      if (localStorage.getItem("user")) {
        this.setUser(localStorage.getItem("user"));
      }

      if (localStorage.getItem("keyivId") && localStorage.getItem("keyiv")) {
        this.setKeyivId([localStorage.getItem("keyivId"), localStorage.getItem("keyiv")]);
      }

      if (localStorage.getItem("theme")) {
        this.setTheme(localStorage.getItem("theme"));
      } else {
        this.setTheme("light");
      }

      if (localStorage.getItem("sidebarCollapse")) {
        this.setSidebarCollapse(localStorage.getItem("sidebarCollapse"));
      }

      if (localStorage.getItem("activeStore")) {
        this.setActiveStore(localStorage.getItem("activeStore"));
      }

      this.setURL(import.meta.env.VITE_APP_BASE_URL);
    },

    // Crypto utility functions
    async encrypt({ string, keyiv }) {
      if (isDemoMode()) {
        return string;
      }

      const type = Object.prototype.toString.call(string);
      try {
        let stringValue = string.toString();
        let key = keyiv.substr(0, 32);
        key = CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex).substr(0, 32);
        let iv = keyiv.substr(33);
        iv = CryptoJS.SHA256(iv).toString(CryptoJS.enc.Hex).substr(0, 16);
        const encrypted = CryptoJS.AES.encrypt(stringValue, CryptoJS.enc.Utf8.parse(key), {
          iv: CryptoJS.enc.Utf8.parse(iv),
        }).toString();
        return encrypted;
      } catch (e) {
        console.log("Encryption process error:", type, e, string);
        return false;
      }
    },

    async decrypt({ string, keyiv }) {
      if (isDemoMode()) {
        return string;
      }

      try {
        let key = keyiv.substr(0, 32);
        key = CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex).substr(0, 32);
        let iv = keyiv.substr(33);
        iv = CryptoJS.SHA256(iv).toString(CryptoJS.enc.Hex).substr(0, 16);
        const decrypted = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(string, CryptoJS.enc.Utf8.parse(key), {
          iv: CryptoJS.enc.Utf8.parse(iv),
          mode: CryptoJS.mode.CBC
        })).toString();
        return decrypted;
      } catch (e) {
        console.log("Decryption process error:", e);
        return false;
      }
    },

    // Session verification
    async verifySession(payload) {
      let session = false;
      if (!this.user || !this.fingerprint || !this.keyivId || !this.keyiv) {
        this.setSession(false);
        session = false;
        console.warn("No session. Missing parameters.");
        if (!payload) { return session; }
      }

      try {
        const username = await this.encrypt({ string: this.user, keyiv: this.keyiv });
        const response = await fetch(apiUrl('/validate-fingerprint-check-username'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fingerprint: this.fingerprint,
            username: username,
            keyivId: this.keyivId
          }),
        });

        const data = await response.json();

        if (data.proceed === true) {
          this.setSession(true);
          this.setTime(data.time);
          session = true;
        } else {
          this.setSession(false);
          session = false;
        }

        const route = router.currentRoute.value.name;

        if (route !== 'InvoiceAPI') {
          if (!session) {
            switch (route) {
              case 'login':
              case 'signup':
              case 'verify-email':
              case 'reset-password':
              case undefined:
                break;
              case 'dashboard':
                this.setAuthFailure("Session expired. Please re-authenticate to continue.");
                break;
              case 'home':
                break;
              default:
                router.push({ name: 'home' });
            }
          }

          if (session) {
            if (route && !route.includes('/dashboard')) {
              switch (route) {
                case 'home':
                case 'login':
                case 'signup':
                case 'verify-email':
                case 'reset-password':
                case undefined:
                  router.push({ name: 'dashboard' });
                  break;
                default:
                  break;
              }
            }
            this.setAuthFailure(false);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        session = false;
      }

      if (!payload) { return session; }
    },

    // Fetch stores
    async getStores() {
      try {
        const username = await this.encrypt({
          string: this.user,
          keyiv: this.keyiv
        });

        const response = await fetch(apiUrl('/stores'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            fingerprint: this.fingerprint,
            keyivId: this.keyivId
          }),
        });

        const data = await response.json();

        if (data.proceed === true) {
          this.setStores(data.stores);
          return data.stores;
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }

      return [];
    },

    // UI theme initialization
    ui() {
      if (localStorage && localStorage.getItem("theme")) {
        this.setTheme(localStorage.getItem("theme"));
      }
    }
  }
});
