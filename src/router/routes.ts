import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('pages/home/HomeLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/home/LoginPage.vue')
      },
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
      }
    ]
  },
  {
    path: '/groups/',
    component: () => import('pages/groups/GroupsLayout.vue'),
    children: [
      {
        path: '/groups/',
        name: 'GroupsListPage',
        component: () => import('pages/groups/GroupsList.vue')
      },
      {
        path: '/groups/:id',
        props: true,
        name: 'GroupPage',
        component: () => import('pages/groups/Group.vue')
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
