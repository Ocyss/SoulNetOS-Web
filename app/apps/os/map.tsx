const packageName = 'os.map'

export default defineApp({
  package: packageName,
  name: '地图',
  icon: 'i-lucide-map-pin',
  page: defineComponent({
    setup() {
      return () => <div>地图</div>
    },
  }),
})
