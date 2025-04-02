<script setup lang="ts">
const search = ref('')
const router = useRouter()
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <header class="flex flex-row items-center justify-between gap-2 px-4 pt-3 pb-2">
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
    </header>
    <div class="overflow-y-auto py-3 w-full scrollbar-thin whitespace-pre-wrap break-words overflow-wrap-anywhere">
      <div
        v-for="i in 30" :key="i" class="flex flex-row items-center justify-between w-full p-2 px-4 text-sm gap-3 hover:bg-(--ui-bg-muted)"
        @click="router.push({ path: 'message' as never, query: { id: i } })"
      >
        <UAvatar size="xl" src="https://i.pravatar.cc/300" />
        <div class="flex-1 flex flex-col min-w-0">
          <div class="flex flex-row gap-1 items-center justify-between">
            <div class="text-xs">
              John Doe
            </div>
            <div class="text-[10px]/3 text-(--ui-text-dimmed)">
              2025-04-01 12:00
            </div>
          </div>
          <div class="text-[10px] text-(--ui-text-muted) line-clamp-2 whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {{ 'Hello'.repeat(i * 2) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
