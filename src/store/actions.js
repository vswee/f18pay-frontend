import crypto from 'crypto';
import router from '@/router';

const actions = {
  headerUIAppend({ commit }, payload) {
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

  async encrypt({ commit }, payload) {
    let string = payload.string;
    let keyiv = payload.keyiv;

    // Extract and hash the key
    let key = String(keyiv).trim().substring(0, 32);
    key = crypto.createHash('sha256').update(key).digest().slice(0, 32);

    // Extract and hash the IV
    let iv = String(keyiv).trim().substring(33);
    iv = crypto.createHash('sha256').update(iv).digest().slice(0, 16);

    // Create the cipher object
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    // Encrypt the data
    let encrypted = cipher.update(string, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  },

  async decrypt({ commit }, payload) {
    let string = payload.string;
    let keyiv = payload.keyiv;
    const key = crypto.createHash('sha256').update(keyiv.slice(0, 32)).digest('hex').slice(0, 32);
    const iv = crypto.createHash('sha256').update(keyiv.slice(33)).digest('hex').slice(0, 16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(string, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
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
    const user = getters.user;
    const fingerprint = getters.fingerprint;
    const keyivId = getters.keyivId;
    const keyiv = getters.keyiv;

    if (!user || !fingerprint || !keyivId || !keyiv) {
      commit("setSession", false);
      session = false;
      console.warn("No session. Missing parameters.");
      if (!payload) { return session; }
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
        let route = router.currentRoute.name;
        if (!session) {
          switch (route) {
            case 'login':
            case 'signup':
            case 'verify-email':
            case 'reset-password':
            case undefined:
              break;
            case 'dashboard':
              commit("setAuthFailure", "Session expired. Please re-authenticate to continue.");
              break;
            case 'home':
              break;
            default:
              router.push({ name: 'home' });
          }
        }
        if (session) {
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
          }
          commit("setAuthFailure", false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        session = false;
      });
    if (!payload) { return session; }
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
  }
};

export default actions;