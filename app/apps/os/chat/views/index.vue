<script setup lang="ts">
const search = ref('')
const router = useRouter()

// const { data: friends } = await useApi('/v1/apps/os/chat/friends')
const { data: rooms } = await useApi('/v1/apps/os/chat/rooms')
const store = useStore()
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <header class="flex flex-row items-center justify-between gap-2 px-4 pt-3 pb-2">
      <UAvatar :src="store.user?.avatar" />
      <UInput
        v-model="search"
        class="flex-1"
        icon="i-lucide-search"
        placeholder="Search..."
        @keyup.enter="search = ''"
      >
        <template v-if="search.length > 0" #trailing>
          <UButton
            icon="i-tdesign:enter"
            variant="link"
            size="sm"
            @click="search = ''"
          />
        </template>
      </UInput>

      <UButton icon="i-lucide:plus" size="sm" color="neutral" variant="soft" />
    </header>
    <div class="overflow-y-auto py-3 scrollbar-thin">
      <div
        v-for="room in rooms" :key="room._id" class="flex flex-row items-center justify-between p-2 px-4 text-sm gap-3 hover:bg-(--ui-bg-muted)"
        @click="router.push({ path: `room/${room._id}` as never })"
      >
        <UAvatar size="xl" :src="room.avatar" :alt="room.name" />
        <div class="flex-1 flex flex-row items-center justify-between">
          <div class="flex flex-1 flex-col gap-1">
            <div class="flex flex-row items-center justify-between">
              <div>
                {{ room.name }}
              </div>

              <div v-if="room.last_message_timestamp" class="text-[10px]/3 text-(--ui-text-muted)">
                {{ dayjs(room.last_message_timestamp).format('YY-MM-DD HH:mm') }}
              </div>
            </div>
            <div class=" flex flex-row items-center justify-between">
              <div class="text-xs text-(--ui-text-muted) line-clamp-1">
                {{ room.last_message }}
              </div>

              <UBadge v-if="false" color="neutral" variant="soft" size="xs" class="rounded-full w-fit">
                99+
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
