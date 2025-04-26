import type { AppComponent, RegisteredApp } from '~/types/app'
import { createRoute } from '~/composables/useAppTask'

export const appRegistry = ref<Map<string, RegisteredApp>>(new Map())
export const notificationRegistry = ref<Map<string, AppComponent>>(new Map())

export function registerApp(app: RegisteredApp) {
  appRegistry.value.get(app.key)?.rmRoute?.()

  appRegistry.value.set(app.key, {
    ...app,
    widget: app.widget ? markRaw(app.widget) : undefined,
    page: markRaw(app.page),
    rmRoute: createRoute(app),
  })
}

export function unRegisterApp(appKey: string) {
  appRegistry.value.delete(appKey)
}

export function registerNotification(appKey: string, component: AppComponent) {
  notificationRegistry.value.set(appKey, component)
}

export function unRegisterNotification(appKey: string) {
  notificationRegistry.value.delete(appKey)
}

window.appRegistry = appRegistry
window.notificationRegistry = notificationRegistry

export default appRegistry
