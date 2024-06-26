import CryptoJS from 'crypto-js'
import router from '../router'


let actions = {

  headerUIAppend(context, payload) {
    for (const item of payload) {
      let fn = item.fn ? item.fn : false
      let id = item.id;
      if (document.querySelectorAll('.dynamic-cta-header-space').length == 1 && document.querySelector(id)) {
        let cta = document.querySelector(id).cloneNode(true);
        cta.setAttribute('id', cta.getAttribute('id') + '_' + Date.now())
        cta.addEventListener("click", function () {
          fn()
        })
        document.querySelector('.dynamic-cta-header-space').append(cta);
      }
    }
  },

  async encrypt(context, payload) {
    const type = Object.prototype.toString.call(payload.string);
    try {
      let string = payload.string.toString(), keyiv = payload.keyiv;
      let key = keyiv.substr(0, 32);
      key = CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex).substr(0, 32);
      let iv = keyiv.substr(33);
      iv = CryptoJS.SHA256(iv).toString(CryptoJS.enc.Hex).substr(0, 16);
      const encrypted = CryptoJS.AES.encrypt(string, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
      }).toString();
      return encrypted;
    } catch (e) {
      console.log("Encryption process error:",type, e, payload)
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

  async init(context) {
    context.commit("setURL", import.meta.env.VITE_APP_BASE_URL);

    if (localStorage.getItem("fingerprint")) {
      context.commit("setFingerprint", localStorage.getItem("fingerprint"));
    } else {
      context.commit("setFingerprint", false);
    }

    if (localStorage.getItem("user")) {
      context.commit("setUser", localStorage.getItem("user"));
    } else {
      context.commit("setUser", false);
    }

    if (localStorage.getItem("keyivId") && localStorage.getItem("keyiv")) {
      context.commit("setKeyivId", [localStorage.getItem("keyivId"), localStorage.getItem("keyiv")]);
    } else {
      context.commit("setKeyivId", false);
    }


    if (localStorage.getItem("sidebarCollapse")) {
      context.commit("setSidebarCollapse", localStorage.getItem("sidebarCollapse"));
    } else {
      context.commit("setSidebarCollapse", false);
    }


    if (localStorage.getItem("activeStore")) {
      context.commit("setActiveStore", localStorage.getItem("activeStore"));
    } else {
      context.commit("setActiveStore", false);
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
      if (!payload) { return session }
    }

    const username = await dispatch('encrypt', { string: user, keyiv: keyiv });
    await fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + "/validate-fingerprint-check-username", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({ fingerprint: fingerprint, username: username, keyivId: keyivId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.proceed == true) {
          commit("setSession", true);
          commit("setTime", data.time);
          session = true;

        } else {
          commit("setSession", false);
          session = false;
        }
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
                // console.log("throw error")
                commit("setAuthFailure", "Session expired. Please re-authenticate to continue.");
                break;
              case 'home':
                break;
              default:
                router.push({
                  name: 'home'
                });
            }
          }
          if (session) {
            if (route && route.indexOf('/dashboard') < 0) {
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
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        session = false;
      });
    if (!payload) { return session }
  },

  async getStores({ commit, getters, dispatch }) {
    const username = await dispatch('encrypt', {
      string: getters.user,
      keyiv: getters.keyiv
    });
    await fetch(import.meta.env.VITE_APP_APPLICATION_ENDPOINT + "/stores", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        fingerprint: getters.fingerprint,
        keyivId: getters.keyivId
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.proceed == true) {
          //HANDLE STORES DATA
          commit("setStores", data.stores);
        }
      })
      .catch((error) => {
        this.message = this.message + ' \nError: ' + error + '\n';
        console.error("Error:", error);
      });
  },


  test(payload) {
    console.log(payload)
  },

  ui(context) {
    if (localStorage && localStorage.getItem("theme")) {
      context.commit("setTheme", localStorage.getItem("theme"))
    }
  }

}
export default actions
