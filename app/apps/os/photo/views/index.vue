<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { FileMetadata } from '~/types/models'

const { $api } = useNuxtApp()

const category = 'image'
const isUploading = ref(false)
const uploadModalOpen = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const { data } = useApi('/v1/files', { query: { category } })
const runtimeConfig = useRuntimeConfig()

type FileMetadataUrl = FileMetadata & {
  url: string
}

const images = computed<FileMetadataUrl[]>(() => data.value?.map(item => ({
  ...item,
  url: `${runtimeConfig.public.openFetch.api.baseURL}/v1/files/${item.file_id}`,
})) || [])

async function uploadFile(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || !files.length || !files[0])
    return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', files[0])
    formData.append('category', category)

    const res = await $api('/v1/files/upload', {
      method: 'POST',
      query: { category },
      body: formData as any,
    })
    data.value?.push(res)
  }
  catch (error) {
    console.error('上传失败', error)
  }
  finally {
    isUploading.value = false
  }
}

async function getImageInfo(fileId: string) {
  try {
    return await $api(`/v1/files/${fileId}/info` as any)
  }
  catch (error) {
    console.error('获取图片详情失败', error)
    return null
  }
}
const soulnet = useSoulnet()
function items(image: FileMetadataUrl) {
  return [
    {
      label: '设为背景（虚）',
      icon: 'i-material-symbols-light-photo-frame-outline-sharp',
      onClick: () => {
        soulnet.personalized.background.virtual = image.url
      },
    },
    {
      label: '设为背景（实）',
      icon: 'i-material-symbols-light-photo-frame-rounded',
      onClick: () => {
        soulnet.personalized.background.physical = image.url
      },
    },
    {
      label: '设为壁纸（虚）',
      icon: 'i-material-symbols-light-imagesmode-outline-sharp',
      onClick: () => {
        soulnet.personalized.wallpaper.virtual = image.url
      },
    },
    {
      label: '设为壁纸（实）',
      icon: 'i-material-symbols-light-imagesmode-sharp',
      onClick: () => {
        soulnet.personalized.wallpaper.physical = image.url
      },
    },
  ] as DropdownMenuItem[]
}
</script>

<template>
  <div class="h-full bg-(--ui-bg) p-4 relative flex flex-col">
    <div class="flex justify-between items-center mb-3">
      <h1 class="text-xl font-semibold text-(--ui-primary)">
        我的相册
      </h1>

      <UButton
        color="primary"
        icon="i-lucide-upload"
        class="rounded-full"
        @click="fileInput?.click()"
      >
        上传图片
      </UButton>
      <input id="" ref="fileInput" type="file" name="" class="hidden" @change="uploadFile">
    </div>

    <div v-if="images.length === 0" class="flex flex-col justify-center items-center h-64 gap-4">
      <UIcon name="i-lucide-image" class="size-16 text-(--ui-primary-muted)" />
      <p class="text-lg text-(--ui-fg-subtle)">
        暂无图片
      </p>
      <UButton color="primary" @click="uploadModalOpen = true">
        上传第一张图片
      </UButton>
    </div>

    <div v-else class="flex-1  scrollbar-thin overflow-y-auto">
      <div class="w-full grid grid-cols-2 gap-4 mb-8">
        <div
          v-for="(image, index) in images"
          :key="image.file_id || index"
          class="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-(--ui-primary) hover:scale-[0.98]"
        >
          <img
            :src="image.url || `/api/files/${image.file_id}`"
            :alt="image.filename || `图片 ${index}`"
            class="w-full h-auto rounded-xl object-cover"
            loading="lazy"
          >

          <div class="absolute inset-0 bg-black/50 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
            <div class="flex justify-between items-center w-full">
              <span class="text-white text-sm truncate max-w-[70%]">{{ image.filename || `图片 ${index + 1}` }}</span>
              <div class="flex gap-2">
                <UButton
                  color="primary"
                  variant="ghost"
                  icon="i-lucide-download"
                  size="xs"
                  :to="image.url || `/api/files/${image.file_id}`"
                  target="_blank"
                  class="rounded-full"
                />
                <UButton
                  color="primary"
                  variant="ghost"
                  icon="i-lucide-info"
                  size="xs"
                  class="rounded-full"
                  @click="getImageInfo(image.file_id)"
                />
                <UDropdownMenu
                  :items="items(image)"
                >
                  <UButton
                    color="primary"
                    variant="ghost"
                    icon="i-lucide-menu"
                    size="xs"
                    class="rounded-full"
                  />
                </UDropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

img {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
