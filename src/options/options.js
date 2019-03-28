global.browser = require('webextension-polyfill')

import Vue from 'vue'
import App from './App'


import Vuetify from 'vuetify'
Vue.use(Vuetify, {
  theme: {
    primary: '#2c6eff',
    secondary: '#039BE5',
    // accent: '#8c9eff',
    // error: '#b71c1c'
  }
})


import VueProgressBar from 'vue-progressbar'

const options = {
  color: 'white',
  failedColor: 'red',
  thickness: '5px',
  transition: {
    speed: '0.5s',
    opacity: '0.1s',
    termination: 300
  },
  autoRevert: false,
  location: 'top'
}

Vue.use(VueProgressBar, options)



/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
