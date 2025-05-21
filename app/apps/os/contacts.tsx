const packageName = 'os.contacts'

export default defineApp({
  package: packageName,
  name: '联系人',
  icon: 'i-lucide-users',
  page: defineComponent({
    setup() {
      return () => <div>联系人</div>
    },
  }),
})
