import CryptoJS from 'crypto-js'
import router from '../router'


let actions = {

  headerUIAppend(context, payload) {
    for (const item of payload) {
      let fn = item.fn ? item.fn : false;
      let id = item.id;
      if (document.querySelectorAll('.dynamic-cta-header-space').length === 1 && document.querySelector(id)) {
        let cta = document.querySelector(id).cloneNode(true);
        cta.setAttribute('id', cta.getAttribute('id') + '_' + Date.now());
        cta.addEventListener("click", function () {
          fn();
        });
        document.querySelector('.dynamic-cta-header-space').append(cta);
      }
    }
  },

  async encrypt(context, payload) {
    try {
      let string = payload.string, keyiv = payload.keyiv;
      let key = keyiv.substr(0, 32);
      key = CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex).substr(0, 32);
      let iv = keyiv.substr(33);
      iv = CryptoJS.SHA256(iv).toString(CryptoJS.enc.Hex).substr(0, 16);
      const encrypted = CryptoJS.AES.encrypt(string, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
      }).toString();
      return encrypted;
    } catch (e) {
      console.log("Encryption process error:", e, payload)
      return false
    }
  },

  async decrypt(context, payload) {
    try {
      let string = payload.string, keyiv = payload.keyiv;
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
      console.log("Decryption process error:", e)
      return false
    }
  },

  async init({ commit }) {
    if (localStorage.getItem("fingerprint")) {
      commit("setFingerprint", localStorage.getItem("fingerprint"));
    } else {
      commit("setFingerprint", false);
    }

    if (localStorage.getItem("user")) {
      commit("setUser", localStorage.getItem("user"));
    } else {
      commit("setUser", false);
    }

    if (localStorage.getItem("keyivId") && localStorage.getItem("keyiv")) {
      commit("setKeyivId", [localStorage.getItem("keyivId"), localStorage.getItem("keyiv")]);
    } else {
      commit("setKeyivId", false);
    }

    if (localStorage.getItem("sidebarCollapse")) {
      commit("setSidebarCollapse", localStorage.getItem("sidebarCollapse"));
    } else {
      commit("setSidebarCollapse", false);
    }

    if (localStorage.getItem("activeStore")) {
      commit("setActiveStore", localStorage.getItem("activeStore"));
    } else {
      commit("setActiveStore", false);
    }
  },

  async verifySession({ commit, getters, dispatch }, payload) {
    let session = false;
    const user = getters.user
    const fingerprint = getters.fingerprint
    const keyivId = getters.keyivId
    const keyiv = getters.keyiv
    const route = router.currentRoute.name || router.currentRoute.value.name;
    if (!user || !fingerprint || !keyivId || !keyiv) {
      commit("setSession", false);
      session = false;
      console.warn("No session. Missing parameters.");
      if (!payload.flag) { return session; }
    }

    const username = await dispatch('encrypt', { string: user, keyiv: keyiv });
    await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/validate-fingerprint-check-username", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint: fingerprint, username: username, keyivId: keyivId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.proceed === true) {
          commit("setSession", true);
          commit("setTime", data.time);
          session = true;
        } else {
          commit("setSession", false);
          session = false;
        }
        if (!session) {
          switch (routeName) {
            case 'login':
            case 'signup':
            case 'verify-email':
            case 'reset-password':
            case undefined:
              console.log("ex expect to be here", routeName)
              break;
            case 'dashboard':
              // console.log("throw error")
              commit("setAuthFailure", "Session expired. Please re-authenticate to continue.");
              break;
            case 'home':
              break;
            default:
              payload.router.push({ name: 'Home' });
          }
        }
        if (session) {
          if (route&&route.indexOf('/dashboard') < 0) {
            switch (route) {
              case 'home':
              case 'login':
              case 'signup':
              case 'verify-email':
              case 'reset-password':
              case undefined:
                router.push({
                  name: 'dashboard'
                });
                break;
              default:
            }
          }
          commit("setAuthFailure", false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        session = false;
      });
    if (!payload.flag) { return session; }
  },

  async getStores({ commit, getters, dispatch }) {
    const username = await dispatch('encrypt', {
      string: getters.user,
      keyiv: getters.keyiv
    });
    await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/stores", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        fingerprint: getters.fingerprint,
        keyivId: getters.keyivId
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.proceed === true) {
          commit("setStores", data.stores);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  },

  test({ commit }, payload) {
    console.log(payload);
  },

  ui({ commit }) {
    if (localStorage && localStorage.getItem("theme")) {
      commit("setTheme", localStorage.getItem("theme"));
    }
  },

  async fetchStores({ commit, getters, dispatch }) {
    const user = getters.user;
    const fingerprint = getters.fingerprint;
    const keyivId = getters.keyivId;
    const keyiv = getters.keyiv;
    const username = await dispatch('encrypt', {string: user,keyiv: keyiv});

  try {
    const response = await fetch(import.meta.env.VITE_APPLICATION_ENDPOINT + "/stores", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        fingerprint: fingerprint,
        keyivId: keyivId,
      }),
    });
    const data = await response.json();
    if (data.proceed) {
      const stores = []
      for (const item of data.stores) {
        let inst = item
        let logo = parseImgSrc(inst.store_logo)
        inst.storeLogo = logo
        stores.push(inst)
      }
      state.stores = stores;
      commit('setStores', data.stores);
      if (!storeView) {
        commit('setStoreView', 'overview');
      }
    } else {
      console.error('Failed to fetch stores');
    }
  } catch (error) {
    console.error('Error:', error);
  }
},
}

export default actions;