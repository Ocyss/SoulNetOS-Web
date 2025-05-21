const packageName = 'os.settings'

export default defineApp({
  package: packageName,
  name: '设置',
  icon: 'i-lucide-settings',
  page: [
    { path: 'index', component: () => import('./views/index.vue') },
  ],
})
