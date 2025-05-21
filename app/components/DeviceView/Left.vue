<script lang="ts" setup>
import type { NotifyData } from '~/types/models'

const upa = useUpaNotify()
const open = defineModel<boolean>('open', { required: true })
const { date } = useOsDate()

const formattedTime = computed(() => {
  const currentDate = date.value
  const hours = currentDate.hour.toString().padStart(2, '0')
  const minutes = currentDate.minute.toString().padStart(2, '0')
  const seconds = currentDate.second.toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
})
</script>

<template>
  <div v-if="open" class="z-50 size-full absolute top-0 left-0 overflow-hidden text-(--ui-text-inverted)">
    <div class="flex flex-col gap-3  size-full rounded-2xl bg-(--ui-bg-inverted)/30 backdrop-blur-sm p-4" @click="open = false">
      <div class="text-2xl ">
        {{ formattedTime }}
      </div>
      <div class="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 scrollbar-none">
        <template v-for="[item, group] in upa.notifysGroup" :key="item.id">
          <Suspense v-if="upa.notifysComponent[item.type]">
            <component :is="upa.notifysComponent[item.type]" :id="`notify-${item.id}`" class="w-full bg-(--ui-bg-muted)/80 text-(--ui-text) rounded-lg p-2" :notify="item" :group="group" v-bind="item.props" />
          </Suspense>
        </template>
      </div>
      <div class="flex flex-row items-center justify-center">
        <UButton icon="i-heroicons-x-mark" size="xl" class="rounded-full" color="error" variant="subtle" @click.stop="upa.ignoreNotifyAll()" />
      </div>
    </div>
  </div>
</template>

<style>

</style>
