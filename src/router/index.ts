import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomePage/index.vue"),
      meta: {requiresAuth: true},
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/upload",
      name: "upload",
      component: () => import("../views/HomePage/index.vue"),
      meta: {requiresAuth: true},
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("../views/Editor/index.vue"),
      meta: {requiresAuth: true},
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Auth/Login.vue"),
      meta: {requiresGuest: true},
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/Auth/Register.vue"),
      meta: {requiresGuest: true},
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      name: "login",
      query: {redirect: to.fullPath !== "/" ? to.fullPath : undefined},
    });
  }
  else if (to.meta.requiresGuest && userStore.isLoggedIn) {
    const redirectPath = from.query.redirect || "/";
    next(redirectPath as string);
  }
  else {
    next();
  }
});

export default router;
