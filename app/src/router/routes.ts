import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/Front.vue'),
    meta: {
      public: true
    },
    children: [
      {
        path: '',
        component: () => import('../pages/home/Login.vue')
      },
      {
        path: '/login-select',
        name: 'LoginSelect',
        component: () => import('../pages/home/LoginSelect.vue')
      },
      {
        path: '/login-mail',
        name: 'LoginMail',
        component: () => import('../pages/home/LoginMail.vue')
      },
      {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../pages/home/ForgotPassword.vue')
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
        path: '/set-password',
        name: 'SetPassword',
        component: () => import('../pages/members/SetPassword.vue')
      },
      {
        path: '/groups',
        name: 'GroupList',
        component: () => import('../pages/groups/GroupList.vue'),
        meta: {
          public: true
        }
      },
      {
        path: '/groups/:code',
        props: true,
        name: 'Group',
        component: () => import('../pages/groups/Group.vue'),
        meta: {
          public: true
        }
      },
      {
        path: '/groups/:code/signup',
        props: true,
        name: 'Signup',
        component: () => import('../pages/members/Signup.vue'),
        meta: {
          public: true
        }
      },
      {
        path: '/groups/:code/signup-member',
        props: true,
        name: 'SignupMember',
        component: () => import('../pages/members/SignupMember.vue')
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
        path: '/groups/:code/members/:memberCode/transactions/send',
        props: route => ({code: route.params.code, direction: "send"}),
        name: 'CreateTransactionSend',
        component: () => import('../pages/transactions/CreateTransaction.vue'),
        children: [
          {
            path: '',
            props: route => ({direction: 'send', ...route.params}),
            name: 'CreateTransactionSendSingle',
            component: () => import('../pages/transactions/CreateTransactionSingle.vue'),
          },
          {
            path: 'qr',
            props: route => ({...route.params, qr: route.query.qr}),
            name: 'CreateTransactionSendQR',
            component: () => import('../pages/transactions/CreateTransactionSendQR.vue'),
          },
          {
            path: 'multiple',
            props: route => ({direction: 'send', ...route.params}),
            name: 'CreateTransactionSendMultiple',
            component: () => import('../pages/transactions/CreateTransactionMultiple.vue'),
          },          
        ]
      },
      {
        path: '/groups/:code/members/:memberCode/transactions/receive',
        props: route => ({code: route.params.code, direction: "receive"}),
        name: 'CreateTransactionReceive',
        component: () => import('../pages/transactions/CreateTransaction.vue'),
        children: [
          {
            path: '',
            props: route => ({direction: 'receive', ...route.params}),
            name: 'CreateTransactionReceiveSingle',
            component: () => import('../pages/transactions/CreateTransactionSingle.vue'),
          },
          {
            path: 'qr',
            props: true,
            name: 'CreateTransactionReceiveQR',
            component: () => import('../pages/transactions/CreateTransactionReceiveQR.vue'),
          },
          {
            path: 'nfc',
            props: true,
            name: 'CreateTransactionReceiveNFC',
            component: () => import('../pages/transactions/CreateTransactionReceiveNFC.vue')
          },
          {
            path: 'multiple',
            props: route => ({direction: 'receive', ...route.params}),
            name: 'CreateTransactionReceiveMultiple',
            component: () => import('../pages/transactions/CreateTransactionMultiple.vue'),
          },   
        ]
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
        component: () => import("../pages/offers/PreviewOffer.vue"),
        meta: {
          // do not allow to go back to this page
          back: false
        }
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
        component: () => import("../pages/needs/PreviewNeed.vue"),
        meta: {
          // do not allow to go back to this page
          back: false
        }
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
  },
  {
    path: '/pay',
    component: () => import('../pages/transactions/Pay.vue'),
    name: 'Pay',
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
