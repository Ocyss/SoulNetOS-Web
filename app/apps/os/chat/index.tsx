export default defineApp({
  name: 'IM',
  icon: 'i-lucide-messages-square',
  page: [
    { path: 'index', component: () => import('./views/index.vue') },
    { path: 'room/:room_id', component: () => import('./views/room.vue') },
  ],
  ui: {
    phoneLayout: {
      root: '!max-w-3xl',
    },
  },
})
