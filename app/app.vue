<script setup lang="ts">
import { usePlugin } from '~/composables/useplugin'

const store = useStore()
await callOnce('user', () => store.fetchUser())
await callOnce('entitys', () => store.fetchEntitys())
await callOnce('infos', () => store.fetchInfos())

const pluginLoader = usePlugin()
pluginLoader.loadAllPlugins()

const appConfig = useAppConfig()
const primaryColor = localStorage.getItem('nuxt-ui-primary')
if (primaryColor) {
  appConfig.ui.colors.primary = primaryColor
}
</script>

<template>
  <UApp class="bg-(--ui-bg)" :toaster="{ position: 'top-right' }">
    <NuxtPage />
  </UApp>
</template>

<style scoped>
</style>
