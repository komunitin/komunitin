import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
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
        path: '/settings',
        name: 'Settings',
        component: () => import('../pages/settings/EditSettings.vue')
      },
      {
        path: '/profile',
        name: 'EditProfile',
        component: () => import('../pages/members/EditProfile.vue')
      },
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
        path: '/groups/:code/members/:memberCode/transactions/new',
        props: true,
        name: 'CreateTransaction',
        component: () => import('../pages/transactions/CreateTransaction.vue')
      },
      {
        path: '/groups/:code/members/:memberCode/transactions/confirm',
        props: true,
        name: 'ConfirmCreateTransaction',
        component: () => import('../pages/transactions/ConfirmCreateTransaction.vue')
      },
      {
        path: '/groups/:code/offers/new',
        props: true,
        name: 'CreateOffer',
        component: () => import('../pages/offers/CreateOffer.vue')
      },
      {
        path: '/groups/:code/offers/:offerCode',
        props: true,
        name: 'Offer',
        component: () => import('../pages/offers/Offer.vue')
      },
      {
        path: '/groups/:code/offers/:offerCode/preview',
        props: true,
        name: 'PreviewOffer',
        component: () => import("../pages/offers/PreviewOffer.vue")
      },
      {
        path: '/groups/:code/offers/:offerCode/edit',
        props: true,
        name: 'EditOffer',
        component: () => import("../pages/offers/EditOffer.vue")
      },
      {
        path: '/groups/:code/needs/new',
        props: true,
        name: 'CreateNeed',
        component: () => import('../pages/needs/CreateNeed.vue')
      },
      {
        path: '/groups/:code/needs/:needCode',
        props: true,
        name: 'Need',
        component: () => import("../pages/needs/Need.vue")
      },
      {
        path: '/groups/:code/needs/:needCode/preview',
        props: true,
        name: 'PreviewNeed',
        component: () => import("../pages/needs/PreviewNeed.vue")
      },
      {
        path: '/groups/:code/needs/:needCode/edit',
        props: true,
        name: 'EditNeed',
        component: () => import("../pages/needs/EditNeed.vue")
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
    path: '/:catchAll(.*)*',
    component: () => import('../pages/Error404.vue')
  });
}

export default routes;
