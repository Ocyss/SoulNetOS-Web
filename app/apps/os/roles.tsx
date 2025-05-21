const packageName = 'os.roles'

export default defineApp({
  package: packageName,
  name: '角色卡',
  icon: 'i-lucide-user',
  page: defineComponent({
    setup() {
      return () => <div>角色卡</div>
    },
  }),
})
