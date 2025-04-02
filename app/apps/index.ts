import type { RegisteredApp } from '~/types/app'
import * as os from './os'

export default Object.entries(os).reduce((appRegistry, [appName, appModule]) => {
  const appKey = `os.${appName}`
  appRegistry[appKey] = {
    key: appKey,
    ...appModule,
  }
  return appRegistry
}, {} as Record<string, RegisteredApp>)
