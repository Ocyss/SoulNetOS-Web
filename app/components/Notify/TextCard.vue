<script lang="tsx" setup>
import type { NotifyData } from '~/types/models'

const props = defineProps<{
  notify: NotifyData
  title?: string
  content?: string
}>()

const apps = useApps()
const info = computed(() => {
  if (!apps.appRegistry.has(props.notify.package)) {
    return null
  }
  return {
    package: props.notify.package,
    app: apps.appRegistry.get(props.notify.package),
  }
})
</script>

<template>
  <div v-if="info && info.app" class="flex flex-row items-center gap-2">
    <div class="flex flex-row items-center justify-center">
      <UIcon :name="info.app.icon" />
    </div>
    <div class="w-full *:w-full flex-1 flex flex-col items-start">
      <div class="flex items-center justify-between gap-2">
        <slot name="title">
          <div v-if="title" class="text-sm font-bold">
            {{ title }}
          </div>
          <div v-else />
        </slot>
        <div class="text-xs text-(--ui-text-muted)">
          {{ dayjs(notify.timestamp).format('HH:mm') }}
        </div>
      </div>
      <slot name="content">
        <div v-if="content" class="text-sm line-clamp-2">
          {{ content }}
        </div>
      </slot>
    </div>
    <slot name="actions" />
  </div>
</template>

<style>

</style>
