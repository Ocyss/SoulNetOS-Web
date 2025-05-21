import * as os from '~/apps/os'

export default defineNuxtPlugin({
  name: 'registerApp',
  async setup() {
    const apps = useApps()
    Object.entries(os).forEach(([_appName, appModule]) => {
      apps.registerApp(appModule)
    })
  },
})
