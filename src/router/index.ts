import { createRouter, createWebHistory } from 'vue-router'
import BlogLayout from '../layouts/BlogLayout.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: BlogLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: 'tags/:tag',
          name: 'tag-posts',
          component: () => import('../views/TagPostsView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: 'projects',
          name: 'projects',
          component: () => import('../views/ProjectsView.vue'),
        },
        {
          path: 'vault',
          name: 'vault-index',
          component: () => import('../views/VaultIndexView.vue'),
        },
        {
          path: 'vault/:pathMatch(.*)*',
          name: 'vault-note',
          component: () => import('../views/VaultNoteView.vue'),
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router