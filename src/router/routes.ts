import { RouteConfig } from 'vue-router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('../layouts/Front.vue'),
    children: [
      {
        path: '',
        component: () => import('../pages/home/Login.vue')
      },
      {
        path: '/login-select/',
        props: false,
        name: 'LoginSelect',
        component: () => import('../pages/home/LoginSelect.vue')
      },
      {
        path: '/login-mail/',
        props: false,
        name: 'LoginMail',
        component: () => import('../pages/home/LoginMail.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('../layouts/Layout.vue'),
    children: [
      {
        path: '/groups',
        name: 'GroupList',
        component: () => import('../pages/groups/GroupList.vue')
      },
      {
        path: '/groups/:code',
        props: true,
        name: 'Group',
        component: () => import('../pages/groups/Group.vue')
      },
      {
        path: '/groups/:code/offers',
        props: true,
        name: 'OfferList',
        component: () => import('../pages/offers/OfferList.vue')
      },
      {
        path: '/groups/:code/needs',
        props: true,
        name: 'NeedList',
        component: () => import('../pages/needs/NeedList.vue')
      },
      {
        path: '/groups/:code/members',
        props: true,
        name: 'MemberList',
        component: () => import('../pages/members/MemberList.vue')
      },
      {
        path: '/groups/:code/members/:memberCode',
        props: true,
        name: 'Member',
        component: () => import('../pages/members/Member.vue')
      },
      {
        path: '/groups/:code/members/:memberCode/transactions',
        props: true,
        name: 'TransactionList',
        component: () => import('../pages/transactions/TransactionList.vue')
      },
      {
        path: '/groups/:code/offers/:offerCode',
        props: true,
        name: 'Offer',
        component: () => import('../pages/offers/Offer.vue')
      },
      {
        path: '/groups/:code/needs/:needCode',
        props: true,
        name: 'Need',
        component: () => import("../pages/needs/Need.vue")
      },
      {
        path: '/groups/:code/transactions/:transferCode',
        props: true,
        name: 'Transaction',
        component: () => import("../pages/transactions/Transaction.vue")
      }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('../pages/Error404.vue')
  });
}

export default routes;
