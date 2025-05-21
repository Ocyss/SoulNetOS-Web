const packageName = 'os.calendar'

export default defineApp({
  package: packageName,
  name: '日历',
  icon: 'i-lucide-calendar',
  page: defineComponent({
    setup() {
      return () => <div>日历</div>
    },
  }),
})
