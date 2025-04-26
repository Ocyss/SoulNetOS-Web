<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { AppPosition, DesktopAppItem } from '~/types/app'
import appRegistry from '~/apps'

const props = defineProps<{
  appItem: DesktopAppItem
}>()

const emit = defineEmits<{
  (e: 'click', appKey: string): void
}>()

const appDetails = computed(() => {
  const baseKey = props.appItem.key.replace(/\/.*$/, '')
  const registeredApp = appRegistry.value.get(baseKey)
  return registeredApp
})

function getPositionStyle(position?: AppPosition): CSSProperties {
  if (!position)
    return {}
  return {
    gridColumnStart: `${position.x + 1}`,
    gridColumnEnd: `span ${position.width ?? 1}`,
    gridRowStart: `${position.y + 1}`,
    gridRowEnd: `span ${position.height ?? 1}`,
  }
}

function handleClick() {
  if (appDetails.value == null) {
    return
  }
  emit('click', props.appItem.key)
}
</script>

<template>
  <div
    class="flex items-center justify-center rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[0.98]"
    :style="getPositionStyle(appItem.position)"
    @click="handleClick()"
  >
    <div v-if="appDetails == null" class="w-full h-full bg-(--ui-bg-elevated) rounded-xl">
      未找到应用
    </div>
    <div
      v-else-if="appItem.type === 'widget'"
      class="w-full h-full p-3 flex flex-col rounded-xl shadow-sm bg-(--ui-bg-elevated)"
    >
      <div class="flex items-center mb-2">
        <UIcon :name="appDetails.icon ?? 'i-lucide:package-x'" class="size-5 mr-2" />
        <span class="text-sm font-medium">{{ appDetails.name }}</span>
      </div>

      <div class="flex-1 flex items-center justify-center">
        <div class="w-full h-full flex items-center justify-center opacity-60">
          <component :is="appDetails.widget" />
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center w-full h-full">
      <div class="flex items-center justify-center size-14 rounded-xl bg-(--ui-bg-elevated) text-(--ui-primary)">
        <UIcon :name="appDetails.icon ?? 'i-lucide:package-x'" class="size-7" />
      </div>
      <span class="text-xs text-center mt-1 line-clamp-1 text-(--ui-fg-subtle)">{{ appDetails.name }}</span>
    </div>
  </div>
</template>

<style>

</style>
