<script setup lang="ts">
const search = ref('')
const router = useRouter()
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <header class="flex flex-row items-center justify-between gap-2 px-4 pt-3 pb-2">
      <UAvatar src="https://i.pravatar.cc/300" />
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
        v-for="i in 30" :key="i" class="flex flex-row items-center justify-between p-2 px-4 text-sm gap-3 hover:bg-(--ui-bg-muted)"
        @click="router.push({ path: 'chat-page' as never, query: { id: i } })"
      >
        <UAvatar size="xl" src="https://i.pravatar.cc/300" />
        <div class="flex-1 flex flex-row items-center justify-between">
          <div class="flex flex-col gap-1">
            <div>John Doe</div>
            <div class="text-xs text-(--ui-text-muted)">
              Hello
            </div>
          </div>
          <div class="flex flex-col gap-1 items-center">
            <div class="text-[10px]/3 text-(--ui-text-muted)">
              12:00
            </div>
            <UBadge color="neutral" variant="soft" size="xs" class="rounded-full w-fit">
              99+
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
