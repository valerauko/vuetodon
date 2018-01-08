import Vue from 'vue'
import Router from 'vue-router'
import Timeline from '@/components/Timeline'
import Convo from '@/components/Convo'
import Login from '@/components/Login'

Vue.use(Router)

export default new Router({
  hashbang: false,
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Timeline,
      props: { timeline: 'home' }
    },
    {
      path: '/local',
      name: 'Local',
      component: Timeline,
      props: { timeline: 'local' }
    },
    {
      path: '/fed',
      name: 'Fed',
      component: Timeline,
      props: { timeline: 'fed' }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/convo/:id',
      name: 'Convo',
      component: Convo
    }
  ]
})
