<script lang="ts" setup>
const open = defineModel<boolean>('open', { required: true })

const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    const t = () => {
      colorMode.preference = _isDark ? 'dark' : 'light'
    }
    if (!document.startViewTransition)
      t()
    else
      document.startViewTransition(t)
  },
})
</script>

<template>
  <div v-if="open" class="z-50 size-full absolute top-0 left-0 overflow-hidden" @click="open = false">
    <div class="size-full rounded-2xl bg-(--ui-bg-inverted)/30 backdrop-blur-sm p-4">
      <div class="h-8" />
      <div class="h-12" />
      <div>
        <UButton
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          color="neutral"
          variant="ghost"
          @click="isDark = !isDark"
        />
      </div>
    </div>
  </div>
</template>

<style>

</style>
