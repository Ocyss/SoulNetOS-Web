import * as os from '~/apps/os'

export default defineNuxtPlugin({
  name: 'registerApp',
  async setup() {
    const apps = useApps()
    Object.entries(os).forEach(([appName, appModule]) => {
      const appKey = `os.${appName}`
      apps.registerApp({
        key: appKey,
        ...appModule,
      })
    })
  },
})
