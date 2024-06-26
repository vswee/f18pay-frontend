let getters = {
  fingerprint: state => {
    return state.fingerprint
  },
  user: state => {
    return state.user
  },
  session: state => {
    return state.session
  },
  keyivId: state => {
    return state.keyivId
  },
  keyiv: state => {
    return state.keyiv
  },
  theme: state => {
    return state.theme
  },
  stores: state => {
    return state.stores
  },
  sidebarCollapse: state => {
    return state.sidebarCollapse
  },
  activeStore: state => {
    return state.activeStore
  },
  authFailure: state => {
    return state.notifications.authFailure
  },
  chart: state => {
    return state.chart
  },
  storeView: state => {
    return state.storeView
  },
  storeModalView: state => {
    return state.storeModalView
  },
  showTitle: state => {
    return state.showTitle
  },
  viewTitle: state => {
    return state.viewTitle
  },
  time: state => {
    return state.time
  },
  working: state => {
    return state.working
  },
  epoch: () => {
    return "2018-01-01"
  },
  url: state => {
    return state.url
  },
}
export default getters
