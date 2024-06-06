let mutations = {
  setFingerprint(state, payload) {
    state.fingerprint = payload
    localStorage.setItem("fingerprint", payload)
  },

  setUser(state, payload) {
    state.user = payload
    localStorage.setItem("user", payload)
  },

  setSession(state, payload) {
    state.session = payload
  },

  setSidebarCollapse(state, payload) {
    state.sidebarCollapse = payload
    localStorage.setItem("sidebarCollapse", payload)
  },

  setStores(state, payload) {
    state.stores = payload
  },

  setActiveStore(state, payload) {
    state.activeStore = payload
    localStorage.setItem("activeStore", payload)
  },

  setKeyivId(state, payload) {
    state.keyivId = payload[0]
    state.keyiv = payload[1]
    localStorage.setItem("keyivId", payload[0])
    localStorage.setItem("keyiv", payload[1])
  },

  setTheme(state, payload) {
    state.theme = payload
    localStorage.setItem("theme", payload)
  },
  setAuthFailure(state, payload) {
    state.notifications.authFailure = payload
  },
  setChart(state, payload) {
    state.chart.chartData = payload.chartData;
    state.chart.options = payload.options;
  },
  setStoreView(state, payload) {
    state.storeView = payload
  },
  setViewTitle(state, payload) {
    state.viewTitle = payload
  },
  setShowTitle(state, payload) {
    state.showTitle = payload
  },
  setStoreModalView(state, payload) {
    state.storeModalView = payload
  },
  setTime(state, payload) {
    state.time = payload
  },
  setWorking(state, payload) {
    state.working = payload
  },
}
export default mutations
