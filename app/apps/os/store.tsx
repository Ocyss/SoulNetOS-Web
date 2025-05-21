const packageName = 'os.store'

export default defineApp({
  package: packageName,
  name: '应用商店',
  icon: 'i-lucide-package',
  page: defineComponent({
    setup() {
      return () => <div>应用商店</div>
    },
  }),
})
