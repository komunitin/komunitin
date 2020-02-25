import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('pages/home/HomeLayout.vue'),
    children: [
      { path: '', component: () => import('pages/home/LoginPage.vue') },
      {
        path: '/login-select/',
        props: false,
        name: 'LoginSelect',
        component: () => import('pages/home/LoginSelect.vue')
      },
      {
        path: '/login-mail/',
        props: false,
        name: 'LoginMail',
        component: () => import('pages/home/LoginMail.vue')
      },
      {
        path: '/help/',
        props: false,
        name: 'Help',
        component: () => import('pages/home/Help.vue')
      },
      {
        path: '/contribute/',
        props: false,
        name: 'Contribute',
        component: () => import('pages/home/Contribute.vue')
      }
    ]
  },
  {
    path: '/exchanges/',
    component: () => import('pages/exchanges/ExchangesLayout.vue'),
    children: [
      {
        path: '/exchanges/',
        name: 'ExchangesListPage',
        component: () => import('pages/exchanges/ExchangesList.vue')
      },
      {
        path: '/exchanges/:id',
        props: true,
        name: 'ExchangePage',
        component: () => import('pages/exchanges/Exchange.vue')
      }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  });
}

export default routes;
