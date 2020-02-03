import { RouteConfig } from 'vue-router'

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/BaseLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Welcome.vue') },
      // { path: '/exchanges/', name: 'ListExchanges', component: () => import('pages/exchanges/ListExchanges.vue') },
      { path: '/exchanges/', name: 'ExchangesPage', component: () => import('pages/exchanges/Exchange.vue') }

    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes

