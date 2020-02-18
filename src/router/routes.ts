import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('layouts/HomeLayout.vue'),
    children: [
      { path: '', component: () => import('pages/login/LoginPage.vue') },
      {
        path: '/login-select/',
        props: false,
        name: 'LoginSelect',
        component: () => import('pages/login/LoginSelect.vue')
      },
      {
        path: '/login-mail/',
        props: false,
        name: 'LoginMail',
        component: () => import('pages/login/LoginMail.vue')
      }
    ]

    // component: () => import('layouts/BaseLayout.vue'),
    // children: [
    // { path: '', component: () => import('pages/Welcome.vue') },
    //   {
    //     path: '/exchanges/:id',
    //     props: true,
    //     name: 'ExchangePage',
    //     component: () => import('pages/exchanges/Exchange.vue')
    //   },
    //   {
    //     path: '/exchanges/',
    //     name: 'ExchangesListPage',
    //     component: () => import('pages/exchanges/ExchangesList.vue')
    //   }
    // ]
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
