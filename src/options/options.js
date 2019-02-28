global.browser = require('webextension-polyfill')

import Vue from 'vue'
import App from './App'


import Vuetify from 'vuetify'
Vue.use(Vuetify)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
