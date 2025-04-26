<script lang="tsx" setup>
import type { TableColumn } from '@nuxt/ui'
import type { WorldItem, WorldItemCreate, WorldItemUpdate } from '~/types/models'
import { UButton } from '#components'
import * as v from 'valibot'

const { data, refresh } = useApi('/v1/config/world/items')
const { $api } = useNuxtApp()
const toast = useToast()

const itemModal = ref(false)
const itemModalStatus = ref<'create' | 'update'>('create')
const itemModalForm = useTemplateRef('itemModalForm')
const itemModalData = ref<WorldItemCreate | WorldItemUpdate>({})
const itemModalID = ref<WorldItem['id']>()
const itemModalLoading = ref(false)

const schema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty('名称不能为空'), v.minLength(1, '名称太短')),
  description: v.pipe(v.string(), v.trim(), v.nonEmpty('描述不能为空'), v.minLength(1, '描述太短')),
  category: v.pipe(v.string(), v.trim()),
})

function setItemModal(status: 'create' | 'update', id?: number) {
  const item = id ? data.value?.find(e => e.id === id) : null
  if (id && !item) {
    toast.add({
      title: '物品不存在',
      description: '请检查物品ID是否正确',
      color: 'error',
    })
  }
  itemModalData.value = jsonClone(item || {})
  itemModalID.value = id
  itemModal.value = true
  itemModalStatus.value = status
}

async function createItem() {
  itemModalLoading.value = true
  try {
    await $api('/v1/config/world/items', {
      method: 'POST',
      body: itemModalData.value as WorldItemCreate,
      handleOptions: {
        message: false,
      },
    })
    toast.add({
      title: '创建物品',
      description: '物品创建成功',
      color: 'success',
    })
    itemModal.value = false
    await refresh()
  }
  catch (error) {
    toast.add({
      title: '创建物品',
      description: (error instanceof Error ? error.message : '物品创建失败'),
      color: 'error',
    })
  }
  finally {
    itemModalLoading.value = false
  }
}

async function updateItem() {
  if (!itemModalForm.value || itemModalForm.value.dirtyFields.size === 0 || !itemModalID.value)
    return
  itemModalLoading.value = true
  try {
    const body = Array.from(itemModalForm.value.dirtyFields).reduce((acc, key) => {
      if (itemModalData.value[key]) {
        acc[key] = itemModalData.value[key]
      }
      return acc
    }, {} as Record<string, any>)

    const res = await $api('/v1/config/world/items/{item_id}', {
      method: 'PATCH',
      path: {
        item_id: itemModalID.value,
      },
      body,
      handleOptions: {
        message: false,
      },
    })
    if (data.value) {
      data.value = data.value.map(e => e.id === itemModalID.value ? res : e)
    }
    toast.add({
      title: '更新物品',
      description: '物品更新成功',
      color: 'success',
    })
  }
  catch (error) {
    toast.add({
      title: '更新物品',
      description: (error instanceof Error ? error.message : '物品更新失败'),
      color: 'error',
    })
  }
  finally {
    itemModalLoading.value = false
  }
}

async function deleteItem(id?: number) {
  if (!id) {
    return
  }
  try {
    await $api('/v1/config/world/items/{item_id}', {
      method: 'DELETE',
      path: {
        item_id: id,
      },
      handleOptions: {
        message: false,
      },
    })
    toast.add({
      title: '删除物品',
      description: `物品删除成功`,
      color: 'success',
    })
    if (data.value) {
      data.value = data.value.filter(e => e.id !== id)
    }
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '删除物品',
      description: (error instanceof Error ? error.message : '物品删除失败'),
      color: 'error',
    })
  }
}

async function itemModalHandler() {
  if (itemModalStatus.value === 'create') {
    await createItem()
  }
  else {
    await updateItem()
  }
}

const columns: TableColumn<WorldItem>[] = [
  {
    accessorKey: 'name',
    header: '名称',
  },
  {
    accessorKey: 'alias',
    header: '别名',
    cell: ({ row }) => {
      return row.original.alias?.join(', ') || ''
    },
  },
  {
    accessorKey: 'category',
    header: '类别',
  },
  {
    accessorKey: 'price',
    header: '价格',
  },
  {
    accessorKey: 'quantity',
    header: '数量',
  },
  {
    accessorKey: 'is_consumable',
    header: '是否消耗品',
    cell: ({ row }) => {
      return row.original.is_consumable ? '是' : '否'
    },
  },
  {
    id: 'action',
    cell: ({ row }) => {
      return (
        <div class="flex gap-2">
          <UButton icon="i-lucide-edit" variant="outline" onClick={() => setItemModal('update', row.original.id)} />
          <UButton icon="i-lucide-trash" variant="outline" onClick={() => deleteItem(row.original.id)} />
        </div>
      )
    },
  },
]
</script>

<template>
  <div>
    <div class="flex justify-end">
      <UButton icon="i-lucide-plus" @click="setItemModal('create')">
        添加物品
      </UButton>
    </div>
    <UTable :data="data ?? undefined" :columns="columns" class="flex-1 select-text" />
    <UModal
      v-model:open="itemModal"
      :dismissible="false"
    >
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-bold">
              {{ itemModalStatus === 'create' ? '添加物品' : '编辑物品' }}
            </h2>
          </template>
          <UForm ref="itemModalForm" :state="itemModalData" :schema="schema" class="p-4 gap-4" @submit="itemModalHandler">
            <UFormField label="名称" name="name">
              <UInput v-model="itemModalData.name" class="w-full" />
            </UFormField>
            <UFormField label="描述" name="description">
              <UInput v-model="itemModalData.description" class="w-full" />
            </UFormField>
            <UFormField label="类别" name="category">
              <UInput v-model="itemModalData.category" class="w-full" />
            </UFormField>
            <UFormField label="子类别" name="sub_category">
              <UInput v-model="itemModalData.sub_category" class="w-full" />
            </UFormField>
            <UFormField label="价格" name="price">
              <UInput v-model.number="itemModalData.price" type="number" class="w-full" />
            </UFormField>
            <UFormField label="数量" name="quantity">
              <UInput v-model.number="itemModalData.quantity" type="number" class="w-full" />
            </UFormField>
            <UFormField label="是否消耗品" name="is_consumable">
              <USwitch v-model="itemModalData.is_consumable!" />
            </UFormField>
            <UFormField label="图片" name="image">
              <UInput type="file" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 my-4">
              <UButton @click="itemModal = false">
                取消
              </UButton>
              <UButton :loading="itemModalLoading" type="submit">
                {{ itemModalStatus === 'create' ? '创建' : '保存' }}
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
