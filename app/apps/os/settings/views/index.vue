<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

const searchRef = useTemplateRef('searchRef')
const searchVisible = shallowRef(false)

useIntersectionObserver(
  searchRef,
  ([entry]) => {
    searchVisible.value = !entry?.isIntersecting
  },
)
</script>

<template>
  <div class="p-4 pt-0 scrollbar-none overflow-y-auto">
    <header class="h-8 text-center bg-(--ui-bg) sticky top-0 z-50 py-2">
      <span class="text-sm opacity-0 transition-opacity duration-300" :style="{ opacity: searchVisible ? 1 : 0 }">
        设置
      </span>
    </header>
    <div class="flex flex-col divide-y-[0.5px] divide-(--ui-border-accented)">
      <div ref="searchRef" class="flex flex-col gap-2 py-3">
        <div class="flex flex-col gap-2 text-xl">
          设置
        </div>
        <UInput v-model="search" placeholder="Search..." />
      </div>
      <div v-for="i in [2, 3, 3, 4, 2, 2, 3, 3, 4, 2, 2, 3, 3, 4, 2]" :key="i" class="flex flex-col gap-2 py-4">
        <div v-for="j in i" :key="j" class="flex flex-row items-center gap-2 h-10 hover:bg-(--ui-bg-elevated) -mx-4 px-4 cursor-pointer">
          <span class="text-sm">
            设置
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
