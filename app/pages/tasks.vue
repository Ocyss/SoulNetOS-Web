<script lang="ts" setup>
const { tasks, activateTask, closeAllTasks, gotoHome } = useAppTask()
</script>

<template>
  <div class="flex flex-col h-full w-full p-4  items-center justify-center">
    <div class="flex flex-row gap-8 h-full w-full touch-pan-x overflow-x-auto transition-transform duration-300 ease-out snap-x">
      <div v-for="task in tasks" :key="task.id" class="w-7/10 h-4/5 snap-center shrink-0 border border-(--ui-bg-inverted)/50 rounded-sm" @click="activateTask(task.id)">
        <img :src="task.thumbnailUrl" class="size-full object-fill">
      </div>
    </div>
    <UButton icon="i-lucide:circle-x" variant="soft" size="xl" class="rounded-full" @click="() => { closeAllTasks();gotoHome() }" />
  </div>
</template>

<style>

</style>
