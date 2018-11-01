// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vant from 'vant'
import 'vant/lib/vant-css/index.css'
import App from './App'
import router from './router'
import store from './store'
import vSelect from 'vue-select'
import vuePicturePreview from 'vue-picture-preview'
// import  "../vconsole.js";
Vue.use(vuePicturePreview)


import axios from "./axios";
import cookie from "../static/js/cookie";
import { Toast,Dialog } from "vant";

import "../static/css/reset.css";
import "../static/css/icon/iconfont.css";

Vue.use(Vant)
Vue.component('v-select', vSelect)

Vue.config.productionTip = false
Vue.prototype.$axios = axios
Vue.prototype.$cookie = cookie
Vue.prototype.$back = function () { 
  router.go(-1)
}
if (process.env.NODE_ENV == 'production') { 
  console.log = function () {};
}
// store.commit('getCur')
store.dispatch('setMutation');

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
