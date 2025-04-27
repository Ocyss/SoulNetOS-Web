<script lang="ts" setup>
import { domToPng } from 'modern-screenshot'
import { appSymbol } from '~/types/keys'

const route = useRoute()
const apps = useApps()
const appKey = route.name?.slice(4)
const routePage = useTemplateRef('routePage')

const app = apps.appRegistry.get(appKey)

provide(appSymbol, app)

definePageMeta({
  layout: false,
  pageTransition: false,
  layoutTransition: false,
})

async function saveThumbnail() {
  const task = apps.activeTask
  if (task && routePage.value && routePage.value.pageRef) {
    if ('$el' in routePage.value.pageRef) {
      task.thumbnailUrl = await domToPng(routePage.value.pageRef.$el)
    }
    else {
      task.thumbnailUrl = await domToPng(routePage.value.pageRef)
    }
  }
}

const isSaving = ref(false)

const { resume } = useIntervalFn(async () => {
  if (isSaving.value) {
    return
  }
  isSaving.value = true
  await saveThumbnail()
  isSaving.value = false
}, 1000 * 60 * 3, {
  immediate: false,
  immediateCallback: true,
})

onMounted(async () => {
  resume()
})
</script>

<template>
  <NuxtLayout name="device-view">
    <NuxtPage ref="routePage" class="h-full w-full " :page-key="route => route.fullPath" />
  </NuxtLayout>
</template>

<style>

</style>
