/* eslint-disable unused-imports/no-unused-imports */
import type { ResolvedFetchOptions } from 'ofetch'

declare global {
  interface Window {
    __tasks__: Ref<AppTask[]>
    appRegistry: Record<string, RegisteredApp>
    notificationRegistry: Record<string, AppComponent>
    eventMap: Map<string, Set<EventListenerArgs>>
  }
}

declare module 'ofetch' {
  interface HandleOptions {
    message?: boolean
    throwError?: boolean
  }
  export interface ResolvedFetchOptions {
    handleOptions?: HandleOptions
  }
  export interface FetchOptions {
    handleOptions?: HandleOptions
  }
}
