//import { h, resolveComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout'
import { routeGuard } from '../auth'

const routes = [
  {
    path: '/',
    name: 'Start',
    component: DefaultLayout,
    redirect: to => {
      const { query } = to
      return { path: '/welcome', query: query }
    },
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: () => import('@/views/Welcome.vue'),
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue'),
      },
      {
        path: '/reports',
        beforeEnter: routeGuard,
        name: 'Reports',
        component: () => import('@/views/reports/Reports.vue'),
      },
    ],
  },
  {
    path: '/callback',
    name: 'Callback',
    redirect: '/welcome'
  }
]

const router = createRouter({
  history: createWebHistory('/app/'),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

export default router
