const packageName = 'os.browser'

export default defineApp({
  package: packageName,
  name: '浏览器',
  icon: 'i-lucide-globe',
  page: defineComponent({
    setup() {
      return () => <div>浏览器</div>
    },
  }),
})
