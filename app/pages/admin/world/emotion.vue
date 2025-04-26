<script lang="tsx" setup>
import type { TableColumn } from '@nuxt/ui'
import type { WorldEmotion, WorldEmotionCreate, WorldEmotionUpdate } from '~/types/models'
import { UButton } from '#components'
import * as v from 'valibot'

const { data, refresh } = useApi('/v1/config/world/emotions')
const { $api } = useNuxtApp()
const toast = useToast()

const emotionModal = ref(false)
const emotionModalStatus = ref<'create' | 'update'>('create')
const emotionModalForm = useTemplateRef('emotionModalForm')
const emotionModalData = ref<(WorldEmotionCreate | WorldEmotionUpdate) & { value_range: [number, number] }>({
  value_range: [0, 100],
})
const emotionModalID = ref<WorldEmotion['id']>()
const emotionModalLoading = ref(false)

const schema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty('名称不能为空'), v.minLength(1, '名称太短')),
  description: v.pipe(v.string(), v.trim(), v.nonEmpty('描述不能为空'), v.minLength(1, '描述太短')),
})

function setEmotionModal(status: 'create' | 'update', id?: number) {
  const emotion = id ? data.value?.find(e => e.id === id) : null
  if (id && !emotion) {
    toast.add({
      title: '情绪不存在',
      description: '请检查情绪ID是否正确',
      color: 'error',
    })
  }
  emotionModalData.value = jsonClone(emotion || {
    value_range: [0, 100],
  })
  emotionModalID.value = id
  emotionModal.value = true
  emotionModalStatus.value = status
}

async function createEmotion() {
  emotionModalLoading.value = true
  try {
    await $api('/v1/config/world/emotions', {
      method: 'POST',
      body: emotionModalData.value as WorldEmotionCreate,
      handleOptions: {
        message: false,
      },
    })
    toast.add({
      title: '创建情绪',
      description: '情绪创建成功',
      color: 'success',

    })
    emotionModal.value = false
    await refresh()
  }
  catch (error) {
    toast.add({
      title: '创建情绪',
      description: (error instanceof Error ? error.message : '情绪创建失败'),
      color: 'error',
    })
  }
  finally {
    emotionModalLoading.value = false
  }
}

async function updateEmotion() {
  if (!emotionModalForm.value || emotionModalForm.value.dirtyFields.size === 0 || !emotionModalID.value)
    return
  emotionModalLoading.value = true
  try {
    const body = Array.from(emotionModalForm.value.dirtyFields).reduce((acc, key) => {
      if (emotionModalData.value[key]) {
        acc[key] = emotionModalData.value[key]
      }
      return acc
    }, {} as Record<string, any>)

    const res = await $api('/v1/config/world/emotions/{emotion_id}', {
      method: 'PATCH',
      path: {
        emotion_id: emotionModalID.value,
      },
      body,
      handleOptions: {
        message: false,
      },
    })
    if (data.value) {
      data.value = data.value.map(e => e.id === emotionModalID.value ? res : e)
    }
    toast.add({
      title: '更新情绪',
      description: '情绪更新成功',
      color: 'success',
    })
  }
  catch (error) {
    toast.add({
      title: '更新情绪',
      description: (error instanceof Error ? error.message : '情绪更新失败'),
      color: 'error',
    })
  }
  finally {
    emotionModalLoading.value = false
  }
}

async function deleteEmotion(id?: number) {
  if (!id) {
    return
  }
  try {
    await $api('/v1/config/world/emotions/{emotion_id}', {
      method: 'DELETE',
      path: {
        emotion_id: id,
      },
      handleOptions: {
        message: false,
      },
    })
    toast.add({
      title: '删除情绪',
      description: `情绪删除成功`,
      color: 'success',
    })
    if (data.value) {
      data.value = data.value.filter(e => e.id !== id)
    }
  }
  catch (error) {
    toast.add({
      title: '删除情绪',
      description: (error instanceof Error ? error.message : '情绪删除失败'),
      color: 'error',
    })
  }
}

async function emotionModalHandler() {
  if (emotionModalStatus.value === 'create') {
    await createEmotion()
  }
  else {
    await updateEmotion()
  }
}

const columns: TableColumn<WorldEmotion>[] = [
  {
    accessorKey: 'name',
    header: '名称',
  },
  {
    accessorKey: 'description',
    header: '描述',
    cell: ({ row }) => {
      return <div class="flex-1 text-wrap line-clamp-3">{row.original.description}</div>
    },
  },
  {
    accessorKey: 'value_range',
    header: '值范围',
    cell: ({ row }) => {
      return row.original.value_range?.join(' - ') || ''
    },
  },
  {
    accessorKey: 'is_entity_bound',
    header: '绑定实体',
    cell: ({ row }) => {
      return row.original.is_entity_bound ? '是' : '否'
    },
  },
  {
    accessorKey: 'default_value',
    header: '默认值',
  },
  {
    id: 'action',
    cell: ({ row }) => {
      return (
        <div class="flex gap-2">
          <UButton icon="i-lucide-edit" variant="outline" onClick={() => setEmotionModal('update', row.original.id)} />
          <UButton icon="i-lucide-trash" variant="outline" onClick={() => deleteEmotion(row.original.id)} />
        </div>
      )
    },
  },
]
</script>

<template>
  <div>
    <div class="flex justify-end">
      <UButton icon="i-lucide-plus" @click="setEmotionModal('create')">
        添加情绪
      </UButton>
    </div>
    <UTable :data="data ?? undefined" :columns="columns" class="flex-1 select-text" />
    <UModal
      v-model:open="emotionModal"
      :dismissible="false"
    >
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-bold">
              {{ emotionModalStatus === 'create' ? '添加情绪' : '编辑情绪' }}
            </h2>
          </template>
          <UForm ref="emotionModalForm" :state="emotionModalData" :schema="schema" class="p-4 gap-4" @submit="emotionModalHandler">
            <UFormField label="名称" name="name">
              <UInput v-model="emotionModalData.name" class="w-full" />
            </UFormField>
            <UFormField label="描述" name="description">
              <UTextarea
                v-model="emotionModalData.description"
                class="w-full"
                :ui="{
                  base: 'scrollbar-none resize-none',
                }"
                :rows="1"
                :maxrows="5"
                autoresize
              />
            </UFormField>
            <UFormField label="值范围" name="value_range" help="请以逗号分隔输入两个数值，例如: 0,100">
              <div class="flex gap-2">
                <UInput v-model.number="emotionModalData.value_range[0]" type="number" class="w-full" placeholder="最小值" />
                <UInput v-model.number="emotionModalData.value_range[1]" type="number" class="w-full" placeholder="最大值" />
              </div>
            </UFormField>
            <UFormField label="是否绑定实体" name="is_entity_bound">
              <USwitch v-model="emotionModalData.is_entity_bound!" />
            </UFormField>
            <UFormField label="默认值" name="default_value">
              <UInput v-model.number="emotionModalData.default_value" type="number" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 my-4">
              <UButton @click="emotionModal = false">
                取消
              </UButton>
              <UButton :loading="emotionModalLoading" type="submit">
                {{ emotionModalStatus === 'create' ? '创建' : '保存' }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<style>

</style>
