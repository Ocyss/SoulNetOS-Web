<script lang="tsx" setup>
import type { NotifyData } from '~/types/models'

type NotifyDataProps = NotifyData<{
  title?: string
  content?: string
}>

defineProps<{
  notify: NotifyDataProps
  group?: NotifyDataProps[]
}>()

const upa = useUpaNotify()
const [open, setOpen] = useToggle(false)
</script>

<template>
  <NotifyTextCard v-if="!open" :notify="notify" :title="notify.props?.title" :content="notify.props?.content" @click.stop="upa.handleNotify(notify, group)">
    <template #title>
      <div v-if="notify.props?.title" class="text-sm font-bold">
        {{ notify.props?.title }} <span v-if="group?.length && group.length > 0" class="text-xs text-(--ui-text-muted)">({{ group.length }}条)</span>
      </div>
      <div v-else />
    </template>
    <template #actions>
      <div v-if="group?.length && group.length > 0" class="flex flex-row items-center justify-center">
        <UButton variant="ghost" size="sm" icon="i-lucide-chevron-down" @click.stop="setOpen()" />
      </div>
    </template>
  </NotifyTextCard>
  <div v-else-if="group?.length && group.length > 0" class="flex flex-col gap-2">
    <div class="flex flex-row items-center justify-between">
      <div>{{ notify?.props?.title }}</div>
      <div class="flex flex-row items-center justify-center">
        <UButton variant="solid" size="sm" icon="i-lucide-chevron-down" @click.stop="setOpen()" />
      </div>
    </div>
    <NotifyTextCard v-for="item in [...group, notify]" :key="item.id" :notify="item" :content="item.props?.content" @click.stop="upa.handleNotify(item)" />
  </div>
</template>

<style>

</style>
