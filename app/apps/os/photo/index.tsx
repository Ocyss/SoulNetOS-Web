const packageName = 'os.photo'

export default defineApp({
  package: packageName,
  name: '相册',
  icon: 'i-lucide-image',
  page: import('./views/index.vue'),
  widget: defineComponent({
    setup() {
      return () => <div>相册123</div>
    },
  }),
})
