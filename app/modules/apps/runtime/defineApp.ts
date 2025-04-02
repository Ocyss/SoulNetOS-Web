import type { RegisteredApp } from '~/types/app'

export function defineApp(appDefinition: Omit<RegisteredApp, 'key'>) {
  return appDefinition
}
