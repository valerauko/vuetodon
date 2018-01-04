import Vue from 'vue'
import Router from 'vue-router'
import Timeline from '@/components/Timeline'
import Login from '@/components/Login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Timeline
    },
    {
      path: '/local',
      name: 'Local',
      component: Timeline
    },
    {
      path: '/fed',
      name: 'Fed',
      component: Timeline
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})
