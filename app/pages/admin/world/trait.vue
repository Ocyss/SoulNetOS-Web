<script lang="tsx" setup>
import type { TableColumn } from '@nuxt/ui'
import type { WorldTrait, WorldTraitCreate, WorldTraitUpdate } from '~/types/models'
import { UButton } from '#components'
import * as v from 'valibot'

const { data, refresh } = useApi('/v1/admin/config/world/traits')
const { $api } = useNuxtApp()
const toast = useToast()

const traitModal = ref(false)
const traitModalStatus = ref<'create' | 'update'>('create')
const traitModalForm = useTemplateRef('traitModalForm')
const traitModalData = ref<WorldTraitCreate | WorldTraitUpdate>({})
const traitModalID = ref<WorldTrait['id']>()
const traitModalLoading = ref(false)

const schema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty('名称不能为空'), v.minLength(1, '名称太短')),
  description: v.pipe(v.string(), v.trim(), v.nonEmpty('描述不能为空'), v.minLength(1, '描述太短')),
})

function setTraitModal(status: 'create' | 'update', id?: number) {
  const trait = id ? data.value?.find(e => e.id === id) : null
  if (id && !trait) {
    toast.add({
      title: '特性不存在',
      description: '请检查特性ID是否正确',
      color: 'error',
    })
  }
  traitModalData.value = jsonClone(trait || {})
  traitModalID.value = id
  traitModal.value = true
  traitModalStatus.value = status
}

async function createTrait() {
  traitModalLoading.value = true
  try {
    await $api('/v1/admin/config/world/traits', {
      method: 'POST',
      body: traitModalData.value as WorldTraitCreate,
      handleOptions: {
        message: false,
      },
    })
    toast.add({
      title: '创建特性',
      description: '特性创建成功',
      color: 'success',
    })
    traitModal.value = false
    await refresh()
  }
  catch (error) {
    toast.add({
      title: '创建特性',
      description: (error instanceof Error ? error.message : '特性创建失败'),
      color: 'error',
    })
  }
  finally {
    traitModalLoading.value = false
  }
}

async function updateTrait() {
  if (!traitModalForm.value || traitModalForm.value.dirtyFields.size === 0 || !traitModalID.value)
    return
  traitModalLoading.value = true
  try {
    const body = Array.from(traitModalForm.value.dirtyFields).reduce((acc, key) => {
      if (traitModalData.value[key]) {
        acc[key] = traitModalData.value[key]
      }
      return acc
    }, {} as Record<string, any>)

    const res = await $api('/v1/admin/config/world/traits/{trait_id}', {
      method: 'PATCH',
      path: {
        trait_id: traitModalID.value,
      },
      body,
      handleOptions: {
        message: false,
      },
    })
    if (data.value) {
      data.value = data.value.map(e => e.id === traitModalID.value ? res : e)
    }
    toast.add({
      title: '更新特性',
      description: '特性更新成功',
      color: 'success',
    })
  }
  catch (error) {
    toast.add({
      title: '更新特性',
      description: (error instanceof Error ? error.message : '特性更新失败'),
      color: 'error',
    })
  }
  finally {
    traitModalLoading.value = false
  }
}

async function deleteTrait(id?: number) {
  if (!id) {
    return
  }
  try {
    await $api('/v1/admin/config/world/traits/{trait_id}', {
      method: 'DELETE',
      path: {
        trait_id: id,
      },
      handleOptions: {
        message: false,
      },
    })
    toast.add({
      title: '删除特性',
      description: `特性删除成功`,
      color: 'success',
    })
    if (data.value) {
      data.value = data.value.filter(e => e.id !== id)
    }
  }
  catch (error) {
    toast.add({
      title: '删除特性',
      description: (error instanceof Error ? error.message : '特性删除失败'),
      color: 'error',
    })
  }
}

async function traitModalHandler() {
  if (traitModalStatus.value === 'create') {
    await createTrait()
  }
  else {
    await updateTrait()
  }
}

const columns: TableColumn<WorldTrait>[] = [
  {
    accessorKey: 'name',
    header: '名称',
  },
  {
    accessorKey: 'description',
    header: '描述',
  },
  {
    id: 'action',
    cell: ({ row }) => {
      return (
        <div class="flex gap-2">
          <UButton icon="i-lucide-edit" variant="outline" onClick={() => setTraitModal('update', row.original.id)} />
          <UButton icon="i-lucide-trash" variant="outline" onClick={() => deleteTrait(row.original.id)} />
        </div>
      )
    },
  },
]
</script>

<template>
  <div>
    <div class="flex justify-end">
      <UButton icon="i-lucide-plus" @click="setTraitModal('create')">
        添加特性
      </UButton>
    </div>
    <UTable :data="data ?? undefined" :columns="columns" class="flex-1 select-text" />
    <UModal
      v-model:open="traitModal"
      :dismissible="false"
    >
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-bold">
              {{ traitModalStatus === 'create' ? '添加特性' : '编辑特性' }}
            </h2>
          </template>
          <UForm ref="traitModalForm" :state="traitModalData" :schema="schema" class="p-4 gap-4" @submit="traitModalHandler">
            <UFormField label="名称" name="name">
              <UInput v-model="traitModalData.name" class="w-full" />
            </UFormField>
            <UFormField label="描述" name="description">
              <UInput v-model="traitModalData.description" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 my-4">
              <UButton @click="traitModal = false">
                取消
              </UButton>
              <UButton :loading="traitModalLoading" type="submit">
                {{ traitModalStatus === 'create' ? '创建' : '保存' }}
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
