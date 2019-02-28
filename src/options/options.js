global.browser = require('webextension-polyfill')

import Vue from 'vue'
import App from './App'


import Vuetify from 'vuetify'
Vue.use(Vuetify, {
  theme: {
    primary: '#3f51b5',
    secondary: '#b0bec5',
    accent: '#8c9eff',
    error: '#b71c1c'
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
