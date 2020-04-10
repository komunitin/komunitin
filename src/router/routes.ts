import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("../layouts/Front.vue"),
    children: [
      {
        path: "",
        component: () => import("../pages/home/Login.vue")
      },
      {
        path: "/login-select/",
        props: false,
        name: "LoginSelect",
        component: () => import("../pages/home/LoginSelect.vue")
      },
      {
        path: "/login-mail/",
        props: false,
        name: "LoginMail",
        component: () => import("../pages/home/LoginMail.vue")
      }
    ]
  },
  {
    path: "/groups/",
    component: () => import("../layouts/Guest.vue"),
    children: [
      {
        path: "/groups/",
        name: "GroupList",
        component: () => import("../pages/groups/GroupList.vue")
      },
      {
        path: "/groups/:code",
        props: true,
        name: "Group",
        component: () => import("../pages/groups/Group.vue")
      },
      {
        path: "/groups/:code/offers",
        props: true,
        name: "GroupOffers",
        component: () => import("pages/groups/GroupOffers.vue")
      }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("../pages/Error404.vue")
  });
}

export default routes;
