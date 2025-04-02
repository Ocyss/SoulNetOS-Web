// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  future: {
    // https://github.com/nuxt/nuxt/pull/27029
    compatibilityVersion: 4,
  },
  // builder: 'rspack',
  ssr: false,
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@formkit/auto-animate/nuxt', // https://auto-animate.formkit.com/
    '@vueuse/nuxt', // https://vueuse.org/guide/
    '@pinia/nuxt', // https://pinia.vuejs.org/ssr/nuxt.html
    'pinia-plugin-persistedstate', // https://prazdevs.github.io/pinia-plugin-persistedstate/guide/
    '@nuxt/test-utils/module', // https://nuxt.com/docs/getting-started/testing
    'nuxt-typed-router', // https://nuxt-typed-router.vercel.app/usage/how-to-use
    '@vite-pwa/nuxt',
    '~/modules/apps',
  ],
  app: {
    rootAttrs: {
      class: 'bg-(--ui-bg-muted) scrollbar-thin w-dvw h-dvh',
    },
  },
  devServer: {
    https: {
      key: './certs/localhost-key.pem',
      cert: './certs/localhost.pem',
    },
  },
  css: ['~/assets/css/main.css'],
  eslint: {
    config: {
      standalone: false,
    },
    checker: {
      exclude: ['app/**/*.vue'],
      include: ['app/types/openapi.d.ts'],
    },
  },
})
