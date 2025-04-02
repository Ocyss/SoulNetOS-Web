export default defineApp({
  name: '天气',
  icon: 'i-lucide-cloud',
  page: defineComponent({
    setup() {
      return () => <div>天气</div>
    },
  }),
  widget: defineComponent({
    setup() {
      return () => <div>天气123</div>
    },
  }),
})
