import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/Users.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes :[
    {
      path:'/',
      redirect:'/login'
    },
    {
      path:'/login',
      component:Login
    },
    {
      path:'/home',
      component:Home,
      redirect:'/welcome',
      children:[
        {
          path:'/welcome',
          component:Welcome
        },
        {
          path:'/users',
          component:Users
        }
      ]
    }
  ]
})
router.beforeEach((to,from,next)=>{
  // to将要访问的路径
  // from代表从哪个路径跳转而来
  // next是一个函数，表示放行
  // next（）放行  next('/login)强制跳转

  const token = window.sessionStorage.getItem('token')
  if(to.path === '/login'){return next()}
  if(!token){
    console.log('token不存在')
    return next('/login')
  }
  next()
})
export default router