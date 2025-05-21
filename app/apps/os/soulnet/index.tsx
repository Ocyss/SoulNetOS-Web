const packageName = 'os.soulnet'

export default defineApp({
  package: packageName,
  name: '万象',
  icon: 'i-lucide-sparkles',
  actions: {
    click: () => {
      useSoulnet().setState()
    },
  },
})
