import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/repos',
    name: 'repos',
    component: () => import('@/views/ReposView.vue'),
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
  },
  {
    path: '/uilibrary',
    name: 'uilibrary',
    component: () => import('@/views/UiLibraryView.vue'),
  },
  {
    path: '/career',
    name: 'career',
    component: () => import('@/views/PipelinesView.vue'),
  },
  {
    path: '/pipelines',
    redirect: '/career',
  },
  {
    path: '/resume-templates',
    redirect: '/career#templates',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
