<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: '实体/角色',
      icon: 'i-lucide:book-user',
      to: '/admin/entity',
    },
    {
      label: 'LLM/大模型',
      icon: 'i-hugeicons:ai-brain-03',
      to: '/admin/llm',
    },
    {
      label: '世界观',
      icon: 'i-lucide-globe',
      defaultOpen: true,
      children: [
        {
          label: '基本信息',
          icon: 'i-lucide-globe',
          to: '/admin/world/world',
        },
        {
          label: '物品',
          icon: 'i-lucide-package',
          to: '/admin/world/item',
        },
        {
          label: '情绪',
          icon: 'i-lucide-heart',
          to: '/admin/world/emotion',
        },
        {
          label: '特质',
          icon: 'i-lucide-star',
          to: '/admin/world/trait',
        },
      ],
    },
    {
      label: '用户',
      icon: 'i-lucide-users',
      to: '/admin/user',
    },
  ],
  [
    {
      label: 'GitHub',
      icon: 'i-simple-icons-github',
      badge: '3.8k',
      to: 'https://github.com/nuxt/ui',
      target: '_blank',
    },
  ],
])

const navigationActive = ref<string>() // TODO
const upa = useUpaNotify()
</script>

<template>
  <div class="h-full w-full flex flex-row">
    <div class="h-full p-4 bg-(--ui-bg) w-72 border-r border-r-(--ui-border) space-y-4">
      <h1 class="text-2xl font-bold px-3">
        Admin
      </h1>
      <UNavigationMenu orientation="vertical" :items="items" />
      <UButton @click="upa.resetAll">
        重置存储
      </UButton>
    </div>
    <div class="flex-1 overflow-auto h-full bg-(--ui-bg) px-4">
      <header class="h-12">
        <h1 class="text-2xl font-bold">
          {{ navigationActive }}
        </h1>
      </header>

      <NuxtPage />
    </div>
  </div>
</template>

<style></style>
