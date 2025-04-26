<script lang="tsx" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Entity, EntityCreate, EntityPublic, EntityStateModel, EntityStateModelUpdate, EntityUpdate } from '~/types/models'
import { UButton } from '#components'

const { data, refresh } = useApi('/v1/config/entitys')
const { $api } = useNuxtApp()
const toast = useToast()

const entityModal = ref(false)
const entityModalStatus = ref<'create' | 'update'>('create')
const entityModalForm = useTemplateRef('entityModalForm')
const entityModalData = ref<{ entity: EntityCreate | EntityUpdate, state_model: EntityStateModel | EntityStateModelUpdate }>({ entity: {}, state_model: {} })
const entityModalID = ref<Entity['id']>()
const entityModalLoading = ref(false)

// const schema = v.object({
//   name: v.pipe(v.string(), v.trim(), v.nonEmpty('名称不能为空'), v.minLength(1, '名称太短')),
//   description: v.pipe(v.string(), v.trim(), v.nonEmpty('描述不能为空'), v.minLength(1, '描述太短')),
//   persona: v.pipe(v.string(), v.trim(), v.nonEmpty('人设不能为空'), v.minLength(1, '人设太短')),
// })

function setEntityModal(status: 'create' | 'update', id?: string) {
  const entity = id ? data.value?.find(e => e.entity.id === id) : null
  if (id && !entity) {
    toast.add({
      title: '实体不存在',
      description: '请检查实体ID是否正确',
      color: 'error',
    })
  }
  entityModalData.value = jsonClone({
    entity: entity?.entity || {},
    state_model: entity?.state_model || {},
  })
  entityModalID.value = id
  entityModal.value = true
  entityModalStatus.value = status
}

async function createEntity() {
  if (!entityModalData.value.entity || !entityModalData.value.state_model) {
    toast.add({
      title: '请填写完整信息',
      description: '请填写完整信息',
      color: 'error',
    })
    return
  }

  entityModalLoading.value = true
  try {
    await $api('/v1/config/entitys', {
      method: 'POST',
      body: {
        entity: entityModalData.value.entity as EntityCreate,
        state: {
          id: null,
          current_status: entityModalData.value.state_model?.current_status || '',
          physical_appearance: entityModalData.value.state_model?.physical_appearance || '',
          current_appearance: entityModalData.value.state_model?.current_appearance || '',
          carrying_items: entityModalData.value.state_model?.carrying_items || '',
          owned_items: entityModalData.value.state_model?.owned_items || '',
          relationships: entityModalData.value.state_model?.relationships || '',
          persona: entityModalData.value.state_model?.persona || '',
          recent_events: entityModalData.value.state_model?.recent_events || '',
          traits: entityModalData.value.state_model?.traits || '',
        },
      },
    })
    toast.add({
      title: '创建实体',
      description: '实体创建成功',
      color: 'success',
    })
    entityModal.value = false
    await refresh()
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '创建实体',
      description: '实体创建失败',
      color: 'error',
    })
  }
  finally {
    entityModalLoading.value = false
  }
}

async function updateEntity() {
  if (!entityModalForm.value || entityModalForm.value.dirtyFields.size === 0 || !entityModalID.value)
    return
  entityModalLoading.value = true
  try {
    const body = Array.from(entityModalForm.value.dirtyFields).reduce((acc, key) => {
      if (entityModalData.value[key]) {
        acc[key] = entityModalData.value[key]
      }
      return acc
    }, {} as Record<string, any>)

    const res = await $api('/v1/config/entitys/{entity_id}', {
      method: 'PATCH',
      path: {
        entity_id: entityModalID.value,
      },
      body: {
        entity: body.entity,
        state: body.state,
      },
    })
    if (data.value) {
      data.value = data.value.map(e => e.entity.id === entityModalID.value ? res : e)
    }
    toast.add({
      title: '更新实体',
      description: '实体更新成功',
      color: 'success',
    })
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '更新实体',
      description: '实体更新失败',
      color: 'error',
    })
  }
  finally {
    entityModalLoading.value = false
  }
}

async function deleteEntity(id?: string) {
  if (!id) {
    return
  }
  try {
    await $api('/v1/config/entitys/{entity_id}', {
      method: 'DELETE',
      path: {
        entity_id: id,
      },
    })
    toast.add({
      title: '删除实体',
      description: `实体删除成功`,
      color: 'success',
    })
    if (data.value) {
      data.value = data.value.filter(e => e.entity.id !== id)
    }
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '删除实体',
      description: `实体删除失败`,
      color: 'error',
    })
  }
}

async function entityModalHandler() {
  console.log(entityModalData.value)
  if (entityModalStatus.value === 'create') {
    await createEntity()
  }
  else {
    await updateEntity()
  }
}

const columns: TableColumn<EntityPublic>[] = [
  {
    accessorKey: 'entity.name',
    header: '名称',
  },
  {
    accessorKey: 'entity.phone_number',
    header: '电话',
  },
  {
    accessorKey: 'entity.im_number',
    header: 'IM 账号',
  },
  {
    id: 'action',
    cell: ({ row }) => {
      return (
        <div class="flex gap-2">
          <UButton icon="i-lucide-edit" variant="outline" onClick={() => setEntityModal('update', row.original.entity.id)} />
          <UButton icon="i-lucide-trash" variant="outline" onClick={() => deleteEntity(row.original.entity.id)} />
        </div>
      )
    },
  },
]
</script>

<template>
  <div>
    <div class="flex justify-end">
      <UButton icon="i-lucide-plus" @click="setEntityModal('create')">
        添加实体
      </UButton>
    </div>
    <UTable :data="data ?? undefined" :columns="columns" class="flex-1 select-text" />
    <UModal
      v-model:open="entityModal"
      :dismissible="false"
      :title="entityModalStatus === 'create' ? '添加实体' : '编辑实体'"
      :description="entityModalStatus === 'create' ? '添加实体' : '编辑实体'"
    >
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-bold">
              {{ entityModalStatus === 'create' ? '添加实体' : '编辑实体' }}
            </h2>
          </template>
          <UForm ref="entityModalForm" :state="entityModalData" class="p-4 gap-4" @submit="entityModalHandler">
            <UFormField label="名称" name="entity.name">
              <UInput v-model="entityModalData.entity.name" class="w-full" />
            </UFormField>
            <UFormField label="描述" name="entity.description">
              <UInput v-model="entityModalData.entity.description" class="w-full" />
            </UFormField>
            <UFormField label="电话" name="entity.phone_number">
              <UInput v-model="entityModalData.entity.phone_number" class="w-full" />
            </UFormField>
            <UFormField label="IM 账号" name="entity.im_number">
              <UInput v-model="entityModalData.entity.im_number" class="w-full" />
            </UFormField>
            <UFormField label="当前信息" name="state_model.current_status">
              <UInput v-model="entityModalData.state_model.current_status" class="w-full" />
            </UFormField>
            <UFormField label="人物形象" name="state_model.physical_appearance">
              <UInput v-model="entityModalData.state_model.physical_appearance" class="w-full" />
            </UFormField>
            <UFormField label="当前外观" name="state_model.current_appearance">
              <UInput v-model="entityModalData.state_model.current_appearance" class="w-full" />
            </UFormField>
            <UFormField label="携带物品" name="state_model.carrying_items">
              <UInput v-model="entityModalData.state_model.carrying_items" class="w-full" />
            </UFormField>
            <UFormField label="拥有物品" name="state_model.owned_items">
              <UInput v-model="entityModalData.state_model.owned_items" class="w-full" />
            </UFormField>
            <UFormField label="人际关系" name="state_model.relationships">
              <UInput v-model="entityModalData.state_model.relationships" class="w-full" />
            </UFormField>
            <UFormField label="人设" name="state_model.persona">
              <UInput v-model="entityModalData.state_model.persona" class="w-full" />
            </UFormField>
            <UFormField label="重要事件" name="state_model.recent_events">
              <UInput v-model="entityModalData.state_model.recent_events" class="w-full" />
            </UFormField>
            <UFormField label="特质" name="state_model.traits">
              <UInput v-model="entityModalData.state_model.traits" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 my-4">
              <UButton @click="entityModal = false">
                取消
              </UButton>
              <UButton :loading="entityModalLoading" type="submit">
                {{ entityModalStatus === 'create' ? '创建' : '保存' }}
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
