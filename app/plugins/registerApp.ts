import { registerApp } from '~/apps'
import * as os from '~/apps/os'

export default defineNuxtPlugin({
  name: 'registerApp',
  async setup() {
    Object.entries(os).forEach(([appName, appModule]) => {
      const appKey = `os.${appName}`
      registerApp({
        key: appKey,
        ...appModule,
      })
    })
  },
})
