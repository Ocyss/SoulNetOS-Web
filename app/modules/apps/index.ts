import { addImports, createResolver, defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'defineApp',
  },
  setup() {
    const { resolve } = createResolver(import.meta.url)

    addImports(
      { from: resolve('./runtime', 'defineApp'), name: 'defineApp' },
    )
  },
})
