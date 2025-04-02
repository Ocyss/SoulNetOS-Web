export default defineApp({
  name: '短信',
  icon: 'i-lucide-message-square',
  page: [
    { path: 'index', component: () => import('./views/index.vue') },
    { path: 'message', component: () => import('./views/message.vue') },
  ],
  ui: {
    phoneLayout: {
      root: 'max-w-3xl',
    },
  },
})
