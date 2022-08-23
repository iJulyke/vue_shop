import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
//将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor, /* { default global options } */)

Vue.config.productionTip = false
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'//默认的请求路径
axios.interceptors.request.use(config =>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios//每一个vue组件都可以通过http直接发起ajax请求
Vue.component('tree-table',TreeTable)
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2,'0')
  const d = (dt.getDate() + '').padStart(2,'0')
  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')

  return `${y}-${m}--${d} ${hh}:${hh}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
