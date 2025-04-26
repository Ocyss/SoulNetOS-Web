<script setup lang="ts">
import { usePlugin } from '~/composables/useplugin'

const store = useMyStore()
await callOnce('user', () => store.fetchUser())
await callOnce('entitys', () => store.fetchEntitys())
await callOnce('infos', () => store.fetchInfos())

const pluginLoader = usePlugin()
pluginLoader.loadAllPlugins()
const upa = useUpa()

upa.connect()
onUnmounted(() => {
  upa.disconnect()
})
</script>

<template>
  <UApp class="bg-(--ui-bg)" :toaster="{ position: 'top-right' }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style scoped>
</style>
