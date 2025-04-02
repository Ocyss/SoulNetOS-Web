export default defineApp({
  name: 'QQ',
  icon: 'i-lucide-messages-square',
  page: [
    { path: 'index', component: () => import('./views/index.vue') },
    { path: 'chat-page', component: () => import('./views/chat-page.vue') },
  ],
  ui: {
    phoneLayout: {
      root: 'max-w-3xl',
    },
  },
})
