
const routes = [
  {
    path: '/',
    component: () => import('layouts/BaseLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Welcome.vue') },
      { path: '/new-exchange/', name: 'NewExchangePage', component: () => import('pages/NewExchangePage.vue') }
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
