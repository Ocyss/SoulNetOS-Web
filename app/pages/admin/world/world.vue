<script lang="ts" setup>
const { data } = useApi('/v1/config/world/config')
</script>

<template>
  <div>
    世界基本信息
    {{ data }}
  </div>
</template>

<style>

</style>
