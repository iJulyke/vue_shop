import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes :[
    {
      path:'/login',
      component:Login
    },
    {
      path:'/',
      redirect:'/login'
    }
  ]
})

export default router