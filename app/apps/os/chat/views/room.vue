<script setup lang="ts">
import type { ChatMessage as _ChatMessage, ChatRoom } from '../types'
import deepmerge from '~/utils/deep'
import { revents } from '~/utils/sse'

type ChatMessage = _ChatMessage & {
  is_sending?: boolean
}

const route = useRoute()
const { room_id } = route.params
const inputMessage = ref('')
const textareaRef = useTemplateRef('textareaRef')
const { $api } = useNuxtApp()
const room = ref<ChatRoom>()
const messages = ref<Array<ChatMessage>>([])
const messagesSorted = useSorted(messages, (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
const store = useStore()
const messagesContainerRef = ref<HTMLElement | null>(null)
const messageRefs = ref<HTMLElement[]>([])
const shouldAutoScroll = ref(true)

async function init() {
  if (!room_id)
    return
  const data = await $api('/v1/apps/os/chat/rooms/{room_id}', {
    path: {
      room_id: room_id as string,
    },
  })
  messages.value = data.messages
  data.messages = []
  room.value = data
}

async function sendMessage() {
  const content = inputMessage.value
  inputMessage.value = ''
  const message: ChatMessage = {
    room_id: room_id as string,
    sender_id: store.user?.id ?? -1,
    content,
    timestamp: Date.now(),
    is_sending: true,
  }
  messages.value.push(message)

  const res = await $api('/v1/apps/os/chat/send_message', {
    method: 'POST',
    body: {
      message: content,
      room_id: room_id as string,
    },
    responseType: 'stream',
  })

  for await (const event of revents(res)) {
    if (event.data && event.event === 'updates') {
      const data = JSON.parse(event.data)
      if ('save_message' in data) {
        deepmerge(message, data.save_message.message, { clone: false })
        message.is_sending = false
        break
      }
    }
  }
}

const upa = useUpaNotify()

function scrollToBottom(smooth = true) {
  if (!messagesContainerRef.value)
    return

  messagesContainerRef.value.scrollTo({
    top: messagesContainerRef.value.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

function isAtBottom() {
  if (!messagesContainerRef.value)
    return true

  const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.value
  const bottomThreshold = 20
  return scrollHeight - scrollTop - clientHeight <= bottomThreshold
}

function onScroll() {
  if (!messagesContainerRef.value)
    return

  shouldAutoScroll.value = isAtBottom()
}

watch(() => messages.value.length, () => {
  if (shouldAutoScroll.value) {
    nextTick(() => scrollToBottom())
  }
})

onMounted(async () => {
  await init()
  upa.onEvent({
    eventName: `os.chat/chat_message/${room_id}`,
    callback: (event) => {
      if (messages.value.some(m => m._id === event.data._id)) {
        return
      }
      messages.value.push(event.data as ChatMessage)
      return true
    },
  })

  upa.ignoreNotifyByCondition(notify => notify[0].event === `os.chat/chat_message/${room_id}`)

  if (messagesContainerRef.value) {
    messagesContainerRef.value.addEventListener('scroll', onScroll)
  }

  nextTick(() => scrollToBottom(false))

  useEventListener(textareaRef.value?.textareaRef, 'keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage()
      e.preventDefault()
    }
  })
})

onBeforeUnmount(() => {
  if (messagesContainerRef.value) {
    messagesContainerRef.value.removeEventListener('scroll', onScroll)
  }
})
</script>

<template>
  <div v-if="room" class="flex flex-col h-full w-full">
    <header class="flex flex-row items-center h-8 justify-between px-4 py-6 bg-(--ui-bg-muted)">
      <div class="flex-1 flex flex-row items-center gap-2">
        <UButton icon="i-lucide:arrow-left" to="../index" size="sm" color="neutral" variant="soft" />
        <div class="flex flex-col">
          <div class="text-sm">
            {{ room.name }}
          </div>
          <div class="text-xs text-(--ui-text-muted)">
            {{ }}
          </div>
        </div>
      </div>
      <div>
        <UButton icon="i-lucide:ellipsis" size="sm" color="neutral" variant="soft" />
      </div>
    </header>
    <div
      ref="messagesContainerRef"
      class="flex-1 space-y-3 pl-4 pr-3 overflow-y-auto scrollbar-thin py-3 w-full select-text whitespace-pre-wrap break-words overflow-wrap-anywhere overscroll-y-contain"
    >
      <template v-for="(msg, index) in messagesSorted" :key="msg._id">
        <div
          v-if="msg.sender_id === -1"
          :ref="el => { if (el) messageRefs[index] = el as HTMLElement }"
        >
          <div
            class="text-xs bg-(--ui-bg-muted) text-(--ui-text-muted) rounded-full px-3 py-2 max-w-4/5 w-fit mx-auto relative"
            :data-direction="msg.sender_id === store.user?.id ? 'outgoing' : 'incoming'"
          >
            {{ msg.content }}
          </div>
        </div>
        <div
          v-else
          :ref="el => { if (el) messageRefs[index] = el as HTMLElement }"
          class="flex flex-row gap-1 min-w-0 relative
          data-[direction=outgoing]:flex-row-reverse group"
          :data-direction="msg.sender_id === store.user?.id ? 'outgoing' : 'incoming'"
        >
          <UAvatar size="sm" :src="store.infos[msg.sender_id]?.avatar ?? room.avatar" :alt="store.infos[msg.sender_id]?.name ?? room.name" />

          <div
            class="text-sm bg-(--ui-bg-muted) rounded-xs px-3 py-2 max-w-4/5 min-w-0 relative"
          >
            <span>{{ msg.content }}</span>
            <span class="text-xs text-(--ui-bg-muted) select-none">HH:mm:ss</span>
            <span class="text-xs text-(--ui-text-muted) absolute bottom-2 right-3">{{ dayjs(msg.timestamp).format('HH:mm:ss') }}</span>
            <UIcon v-if="msg.is_sending" name="i-lucide-refresh-cw" class="absolute top-1/2 -right-5 group-data-[direction=outgoing]:-left-5 -translate-y-1/2 animate-spin" />
          </div>
        </div>
      </template>
    </div>

    <div class="flex flex-col px-4 pt-3 pb-2 bg-(--ui-bg-muted) gap-2">
      <div class="flex flex-row gap-2">
        <UTextarea
          ref="textareaRef"
          v-model="inputMessage"
          class="flex-1"
          :ui="{
            base: 'scrollbar-none resize-none',
          }"
          :rows="1"
          :maxrows="5"
          autoresize
        />
        <div class="flex flex-col items-center gap-2 justify-between">
          <UButton v-if="!!inputMessage && (textareaRef?.textareaRef?.rows ?? 0) > 2" icon="i-lucide:arrow-up" size="xs" color="neutral" variant="ghost" />
          <UButton icon="i-lucide:send" color="primary" variant="soft" :disabled="inputMessage.length === 0" @click="sendMessage" />
        </div>
      </div>
      <div class="flex flex-row justify-between">
        <UButton icon="i-lucide:image" size="sm" color="neutral" variant="ghost" />
        <UButton icon="i-lucide:image" size="sm" color="neutral" variant="ghost" />
        <UButton icon="i-lucide:image" size="sm" color="neutral" variant="ghost" />
        <UButton icon="i-lucide:paperclip" size="sm" color="neutral" variant="ghost" />
        <UButton icon="i-lucide:paperclip" size="sm" color="neutral" variant="ghost" />
        <UButton icon="i-lucide:paperclip" size="sm" color="neutral" variant="ghost" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.overscroll-y-contain {
  overscroll-behavior-y: contain;
}
</style>
