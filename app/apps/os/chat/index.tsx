const packageName = 'os.chat'

export default defineApp({
  package: packageName,
  name: 'IM',
  icon: 'i-lucide-messages-square',
  page: [
    { name: 'index', path: 'index', component: () => import('./views/index.vue') },
    { name: 'room', path: 'room/:room_id', component: () => import('./views/room.vue') },
  ],
  notifyHandler: {
    async chat_message(notify) {
      const app = useApps()
      const room_id = notify.event.split('/').pop()
      app.launchApp(packageName, { name: 'room', params: { room_id } })
    },
  },
  ui: {
    phoneLayout: {
      root: '!max-w-3xl',
    },
  },
})
