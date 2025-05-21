<script lang="ts" setup>
const apps = useApps()

function closeAllTasks() {
  apps.closeAllTasks()
  apps.gotoHome()
}
</script>

<template>
  <NuxtLayout name="device-view">
    <div class="flex flex-col h-full w-full p-4  items-center justify-center">
      <div class="flex flex-row gap-8 h-full w-full touch-pan-x overflow-x-auto transition-transform duration-300 ease-out snap-x">
        <div v-for="task in apps.tasks" :key="task.id" class="w-7/10 h-4/5 snap-center shrink-0 border border-(--ui-bg-inverted)/50 rounded-sm" @click="apps.activateTask(task.id)">
          <img :src="task.thumbnailUrl" class="size-full object-fill">
        </div>
      </div>
      <UButton icon="i-lucide:circle-x" variant="soft" size="xl" class="rounded-full" @click="closeAllTasks" />
    </div>
  </NuxtLayout>
</template>

<style>

</style>
