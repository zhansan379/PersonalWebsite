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
          path: 'tags',
          name: 'tags',
          component: () => import('../views/TagsView.vue'),
        },
        {
          path: 'tags/:tag',
          name: 'tag-posts',
          component: () => import('../views/TagPostsView.vue'),
        },
        {
          path: 'archive',
          name: 'archive',
          component: () => import('../views/ArchiveView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
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