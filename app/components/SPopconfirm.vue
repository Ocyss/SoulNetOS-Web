<script lang="ts" setup>
import type { ButtonProps } from '@nuxt/ui'

withDefaults(defineProps<{
  content?: string
  confirmText?: string
  cancelText?: string
  trigger?: ButtonProps & {
    label?: string
  }
}>(), {
  confirmText: '确认',
  cancelText: '取消',
  trigger: () => ({
    label: '确认',
    color: 'neutral',
    variant: 'subtle',
  }),
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const [open, setOpen] = useToggle(false)

function handleConfirm() {
  setOpen(false)
  emit('confirm')
}

function handleCancel() {
  setOpen(false)
  emit('cancel')
}
</script>

<template>
  <UPopover v-model:open="open" :dismissible="false" arrow :ui="{ content: 'p-3' }">
    <slot name="trigger">
      <UButton v-bind="trigger" />
    </slot>
    <template #content>
      <div class="flex flex-col items-center gap-2 select-none">
        <div class="text-sm">
          <slot>
            {{ content }}
          </slot>
        </div>
        <div class="w-full flex flex-row gap-2 justify-end items-end">
          <UButton v-if="cancelText !== 'null'" color="neutral" size="xs" variant="outline" :label="cancelText" @click="handleCancel" />
          <UButton v-if="confirmText !== 'null'" color="primary" size="xs" :label="confirmText" @click="handleConfirm" />
        </div>
      </div>
    </template>
  </UPopover>
</template>

<style>

</style>
