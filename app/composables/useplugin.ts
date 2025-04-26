import type { NuxtApp } from '#app'
import { registerApp, unRegisterApp } from '~/apps'

export class PluginLoader {
  app: NuxtApp
  baseURL: string
  plugins: Map<string, { meta?: any, module: any, entryUrl?: string, name: string }>
  constructor(nuxtApp: NuxtApp, baseURL: string) {
    this.app = nuxtApp
    this.plugins = new Map()
    this.baseURL = baseURL
  }

  async loadAllPlugins() {
    const pluginNames = await this.app.$api('/v1/plugin/frontend')
    for (const [name, entryUrl] of pluginNames) {
      await this.loadPlugin(name, entryUrl)
    }
  }

  async loadPlugin(name: string, entryUrl?: string) {
    if (this.plugins.has(name))
      return

    if (!entryUrl) {
      const meta = await this.app.$api('/v1/plugin/info/{name}', {
        path: {
          name,
        },
      })
      if (!meta.frontend_entry)
        throw new Error(`Plugin ${name} has no frontend entry`)
      entryUrl = meta.frontend_entry
    }

    const module = await import(/* @vite-ignore */ `${this.baseURL}${entryUrl}/index.js`)

    if (module.default && typeof module.default === 'function') {
      const pluginAPI = this.createPluginAPI(name)
      await module.default(pluginAPI)
    }

    this.plugins.set(name, { module, entryUrl, name })
  }

  createPluginAPI(name: string) {
    return {
      name,
      app: this.app,
      registerApp,
      unRegisterApp,
    }
  }

  async fetchPluginMeta(name: string) {
    const response = await fetch(`/plugins/${name}/plugin.json`)
    return await response.json()
  }
}
let pluginLoader: PluginLoader | null = null

export function usePlugin() {
  if (!pluginLoader) {
    const runtimeConfig = useRuntimeConfig()

    pluginLoader = new PluginLoader(useNuxtApp(), runtimeConfig.public.openFetch.api.baseURL)
  }
  return pluginLoader
}
