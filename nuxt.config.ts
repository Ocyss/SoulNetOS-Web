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
    '@pinia/nuxt', // https://pinia.vuejs.org/ssr/nuxt
    'pinia-plugin-persistedstate', // https://prazdevs.github.io/pinia-plugin-persistedstate/guide/
    '@nuxt/test-utils/module', // https://nuxt.com/docs/getting-started/testing
    'nuxt-typed-router', // https://nuxt-typed-router.vercel.app/usage/how-to-use
    '@vite-pwa/nuxt',
    'nuxt-open-fetch-x', // https://github.com/Norbiros/nuxt-open-fetch-x
    '~/modules/apps',
  ],
  app: {
    rootAttrs: {
      class: 'bg-(--ui-bg-muted) select-none scrollbar-thin w-dvw h-dvh',
    },
  },
  ui: {
    fonts: false,
  },
  openFetch: {
    disableNuxtPlugin: true,
    clients: {
      api: {
        schema: 'http://localhost:10401/openapi.json',
        baseURL: 'http://localhost:10401',
      },
    },
  },
  runtimeConfig: {
    public: {
      openFetch: {
        api: {
          baseURL: 'http://localhost:10401/',
        },
      },
    },
  },
  devServer: {
    port: 10400,
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
