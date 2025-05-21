const packageName = 'os.phone'

export default defineApp({
  package: packageName,
  name: '电话',
  icon: 'i-lucide-phone',
  page: defineComponent({
    setup() {
      return () => <div>电话(施工中)</div>
    },
  }),
})
