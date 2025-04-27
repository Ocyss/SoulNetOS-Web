<script lang="ts" setup>
import type { Notify } from '~/types/models'

const props = defineProps<{
  notify: Notify
}>()

const apps = useApps()
const info = computed(() => {
  const [packname, type, ..._] = props.notify.event_id.split('/')
  if (!packname || !apps.appRegistry.has(packname)) {
    return null
  }
  return {
    packname,
    type,
    app: apps.appRegistry.get(packname),
  }
})
</script>

<template>
  <div v-if="info && info.app" class="flex flex-row items-center justify-center w-full">
    <div class="flex flex-row items-center justify-center">
      <UIcon :name="info.app.icon" />
    </div>
    <div class="flex flex-col items-center justify-center">
      <div class="text-sm font-bold">
        {{ notify.data?.title }}
      </div>
      <div v-if="notify.data?.content" class="text-sm text-gray-500">
        {{ notify.data.content }}
      </div>
    </div>
    <div class="flex flex-row items-center justify-center">
      <UIcon name="i-lucide-chevron-down" />
    </div>
  </div>
</template>

<style>

</style>
