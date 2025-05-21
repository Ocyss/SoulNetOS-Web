import { FetchError } from 'ofetch'

declare global {
  interface Headers {
    Authorization?: string
  }
}

export default defineNuxtPlugin({
  enforce: 'pre', // clients will be ready to use by other plugins, Pinia stores etc.
  setup() {
    const clients = useRuntimeConfig().public.openFetch
    const localFetch = useRequestFetch() as typeof globalThis.$fetch
    const toast = useToast()
    return {
      provide: Object.entries(clients).reduce((acc, [name, options]) => ({
        ...acc,
        [name]: createOpenFetch(localOptions => ({
          ...options,
          ...localOptions,
          onRequest(ctx) {
            const header = {
              ...ctx.options.headers || {},
              // @ts-expect-error https://github.com/enkot/nuxt-open-fetch/issues/79
              ...ctx.options.header || {},
            }
            const token = useStore().token
            if (token) {
              header.Authorization = `Bearer ${token}`
            }
            ctx.options.headers = header
            // @ts-expect-error 123
            return localOptions?.onRequest?.(ctx)
          },
          onResponse(ctx) {
            if (ctx.response.status >= 400) {
              let errMsg = JSON.stringify(ctx.response._data?.detail ?? ctx.response.statusText)
              console.log('onResponse Error', { ctx, errMsg })
              const { throwError = true, message = true } = ctx.options.handleOptions ?? {}
              switch (ctx.response.status) {
                case 401:
                case 418: {
                  useStore().token = ''
                  const route = useRoute()
                  navigateTo({ path: ctx.response.status === 401 ? '/login' : '/init', query: { redirect: route.fullPath } })
                  return
                }
                case 422: {
                  const detail = ctx.response._data?.detail
                  if (detail && Array.isArray(detail)) {
                    errMsg = `参数校验错误:${detail.map(item => item.type).join(', ')}`
                  }
                }
              }
              if (message === true) {
                toast.add({
                  title: 'Error',
                  description: errMsg,
                  icon: 'i-heroicons-exclamation-triangle',
                  color: 'error',
                })
              }
              if (throwError === true) {
                throw new FetchError(errMsg, { cause: ctx })
              }
            }
            // @ts-expect-error 123
            return localOptions?.onResponse?.(ctx)
          },
          onRequestError(ctx) {
            console.log('onRequestError', ctx)
            // @ts-expect-error 123
            return localOptions?.onRequestError?.(ctx)
          },
        }), localFetch),
      }), {}),
    }
  },
})
