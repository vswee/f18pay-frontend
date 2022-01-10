import Vue from 'vue'
import VueCryptojs from 'vue-cryptojs'
import router from '@/router'

Vue.use(VueCryptojs)

let actions = {

  async encrypt(context, payload) {
    let string = payload.string, keyiv = payload.keyiv;
    let key = keyiv.substr(0, 32);
    key = Vue.CryptoJS.SHA256(key).toString(Vue.CryptoJS.enc.Hex).substr(0, 32);
    let iv = keyiv.substr(33);
    iv = Vue.CryptoJS.SHA256(iv).toString(Vue.CryptoJS.enc.Hex).substr(0, 16);
    const encrypted = Vue.CryptoJS.AES.encrypt(string, Vue.CryptoJS.enc.Utf8.parse(key), {
      iv: Vue.CryptoJS.enc.Utf8.parse(iv),
    }).toString();
    return encrypted;
  },

  async decrypt(context, payload) {
    let string = payload.string, keyiv = payload.keyiv;
    let key = keyiv.substr(0, 32);
    key = Vue.CryptoJS.SHA256(key).toString(Vue.CryptoJS.enc.Hex).substr(0, 32);
    let iv = keyiv.substr(33);
    iv = Vue.CryptoJS.SHA256(iv).toString(Vue.CryptoJS.enc.Hex).substr(0, 16);
    const decrypted = Vue.CryptoJS.enc.Utf8.stringify(Vue.CryptoJS.AES.decrypt(string, Vue.CryptoJS.enc.Utf8.parse(key), {
      iv: Vue.CryptoJS.enc.Utf8.parse(iv),
      mode: Vue.CryptoJS.mode.CBC
    })).toString();
    return decrypted;
  },

  async init(context) {
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

  async verifySession({ commit, getters, dispatch }) {
    let session = false;
    const user = getters.user
    const fingerprint = getters.fingerprint
    const keyivId = getters.keyivId
    const keyiv = getters.keyiv
    if (!user || !fingerprint || !keyivId || !keyiv) {
      commit("setSession", false);
      session = false;
      console.warn("No session. Missing parameters.");
      return session
    }

    const username = await dispatch('encrypt', { string: user, keyiv: keyiv });
    await fetch("https://money-api.flat18.co.uk/validate-fingerprint-check-username", {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data', },
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
        let route = router.currentRoute.name;
        if (!session) {
          switch (route) {
            case 'home':
            case 'login':
            case 'signup':
            case 'verify-email':
            case 'reset-password':
              break;
            default:
              router.push({
                name: 'home'
              });

          }
        }
        if (session) {
          switch (route) {
            case 'home':
            case 'login':
            case 'signup':
            case 'verify-email':
            case 'reset-password':
              router.push({
                name: 'dashboard'
              });
              break;
            default:
          }
        }

      })
      .catch((error) => {
        console.error("Error:", error);
        session = false;
      });
    return session
  },

  async getStores({ commit, getters, dispatch }) {
    const username = await dispatch('encrypt', {
      string: getters.user,
      keyiv: getters.keyiv
    });
    await fetch("https://money-api.flat18.co.uk/stores", {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
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
