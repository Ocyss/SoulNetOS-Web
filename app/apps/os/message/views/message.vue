<script setup lang="ts">
const route = useRoute()
const { id } = route.query
const message = ref('')
const textarea = useTemplateRef('textarea')

function sendMessage() {
  console.log(textarea.value)
  message.value = ''
}

onMounted(() => {
  useEventListener(textarea.value?.textareaRef, 'keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage()
      e.preventDefault()
    }
  })
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <header class="flex flex-row items-center h-8 justify-between px-4 py-6 bg-(--ui-bg-muted)/75 border-b border-(--ui-border)">
      <div class="flex flex-row items-center gap-2">
        <UButton icon="i-lucide:arrow-left" to="index" size="sm" color="neutral" variant="soft" />
      </div>
      <div class="flex-1 flex flex-col items-center">
        <span class="text-sm">
          John Doe
        </span>
        <span class="text-xs text-(--ui-text-muted)">
          {{ id }}
        </span>
      </div>
      <div>
        <UButton icon="i-lucide:ellipsis" size="sm" color="neutral" variant="soft" />
      </div>
    </header>
    <div class="flex-1 space-y-3 pl-4 pr-3 overflow-y-auto scrollbar-thin py-3 w-full select-auto whitespace-pre-wrap break-words overflow-wrap-anywhere">
      <div
        v-for="i in 60" :key="i"
        class="flex flex-col gap-1 min-w-0
        data-[direction=outgoing]:items-end group/message"
        :data-direction="i % 3 === 0 ? 'outgoing' : 'incoming'"
      >
        <div class="text-[9px] text-(--ui-text-muted)">
          2025-04-01 12:00
        </div>
        <div
          class="text-xs bg-(--ui-bg-muted) group-data-[direction=outgoing]/message:bg-(--ui-color-primary-500) rounded-xs px-3 py-2 max-w-4/5 min-w-0 relative"
        >
          {{ "12:00".repeat(i) }}
        </div>
      </div>
    </div>
    <div class="flex flex-col px-4 pt-3 pb-2 bg-(--ui-bg-muted) gap-2">
      <div class="flex flex-row gap-2">
        <UTextarea
          ref="textarea"
          v-model="message"
          class="flex-1"
          :ui="{
            base: 'scrollbar-none resize-none',
          }"
          :rows="1"
          :maxrows="5"
          autoresize
        />
        <div class="flex flex-col items-center gap-2 justify-between">
          <UButton v-if="!!message && (textarea?.textareaRef?.rows ?? 0) > 2" icon="i-lucide:arrow-up" size="xs" color="neutral" variant="ghost" />
          <UButton icon="i-lucide:send" color="primary" variant="soft" :disabled="message.length === 0" @click="sendMessage" />
        </div>
      </div>
    </div>
  </div>
</template>
