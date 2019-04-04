import Vue from 'vue'
import App from './App.vue'
import router from './routers'
import store from './stores'

import axios from 'axios'
Vue.prototype.axios = axios;   // 这样就可以通过 this 的方式引入 axios

// 设置图片宽高的过滤器
Vue.filter('setWH',(url , arg)=>{
    return url.replace(/w\.h/,arg);
});

import Scroller from '@/components/Scroller'
Vue.component('Scroller' , Scroller);

import Loading from '@/components/Loading'
Vue.component('Loading',Loading);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
