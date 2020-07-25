import Vue from "vue";
import VueRouter from "vue-router";
import Layout from "../views/Layout.vue";
import Beranda from "../views/Beranda.vue";
import Laporan from "../views/Laporan.vue";
import Karyawan from "../views/Karyawan.vue";
import Login from "../views/Login.vue";
import { auth } from "../firebase/index";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Layout",
    redirect: "/beranda",
    component: Layout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "beranda",
        name: "Beranda",
        component: Beranda,
      },
      {
        path: "karyawan",
        name: "Karyawan",
        component: Karyawan,
      },
      {
        path: "laporan",
        name: "Laporan",
        component: Laporan,
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((x) => x.meta.requiresAuth);

  if (requiresAuth && !auth.currentUser) {
    next("/login");
  } else {
    next();
  }
});

export default router;
