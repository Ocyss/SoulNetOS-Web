export default defineApp({
  name: '相册',
  icon: 'i-lucide-image',
  page: defineComponent({
    setup() {
      return () => <div>相册</div>
    },
  }),
  widget: defineComponent({
    setup() {
      return () => <div>相册123</div>
    },
  }),
})
