import {createApp} from 'vue'
import {createStore} from 'vuex'
import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'

const store = createStore({
  state,
  mutations,
  actions,
  getters,
})

const app = createApp({})
app.use(store)
export default store