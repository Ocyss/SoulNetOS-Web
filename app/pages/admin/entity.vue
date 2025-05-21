<script lang="tsx" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Entity, EntityCreate, EntityPublic, EntityStateModel, EntityStateModelUpdate, EntityUpdate } from '~/types/models'
import { UButton } from '#components'

interface EntityModalData {
  id?: Entity['id']
  state: 'create' | 'update'
  data: { entity: EntityCreate | EntityUpdate, state_model: EntityStateModel | EntityStateModelUpdate }
}

const { data, refresh } = useApi('/v1/admin/config/entitys')
const jsonSchema: LoadSchemaOptions = {
  schema: '/schemas/EntityPublic',
  omit: ['state', 'entity.id', 'entity.created_at', 'entity.updated_at', 'state_model.id'],
  required: ['state_model'],
  notAdditionalProperties: true,
}
const { $api } = useNuxtApp()
const toast = useToast()

const entityModal = useTemplateRef('entityModal')
const entityModalData = ref<EntityModalData>({ state: 'create', data: { entity: {}, state_model: {} } })
const entityModalLoading = ref(false)

const aiSystemPrompt = '你是专业的实体编辑器，请根据用户输入的实体信息，生成一个符合要求的实体信息。'

function setEntityModal(status: 'create' | 'update', id?: string) {
  const entity = id ? data.value?.find(e => e.entity.id === id) : { entity: {}, state_model: {} }
  if (id && !entity) {
    toast.add({
      title: '实体不存在',
      description: '请检查实体ID是否正确',
      color: 'error',
    })
  }

  entityModalData.value = { id, state: status, data: useOmit(
    entity,
    jsonSchema.omit!,
  ) as EntityModalData['data'] }
  entityModal.value?.setOpen(true)
}

async function createEntity() {
  if (!entityModalData.value.data.entity || !entityModalData.value.data.state_model) {
    toast.add({
      title: '请填写完整信息',
      description: '请填写完整信息',
      color: 'error',
    })
    return
  }

  entityModalLoading.value = true
  try {
    await $api('/v1/admin/config/entitys', {
      method: 'POST',
      body: {
        entity: entityModalData.value.data.entity as EntityCreate,
        state: {
          id: '',
          ...entityModalData.value.data.state_model,
        } as EntityStateModel,
      },
    })
    toast.add({
      title: '创建实体',
      description: '实体创建成功',
      color: 'success',
    })
    entityModal.value?.setOpen(false)
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
  if (!entityModalData.value.id)
    return
  entityModalLoading.value = true
  try {
    // const body = Array.from(entityModalForm.value.dirtyFields).reduce((acc, key) => {
    //   if (entityModalData.value[key]) {
    //     acc[key] = entityModalData.value[key]
    //   }
    //   return acc
    // }, {} as Record<string, any>)
    const entity = data.value?.find(e => e.entity.id === entityModalData.value.id)

    const res = await $api('/v1/admin/config/entitys/{entity_id}', {
      method: 'PATCH',
      path: {
        entity_id: entityModalData.value.id,
      },
      body: deepValueDiff(entityModalData.value.data, entity),
    })
    if (data.value) {
      data.value = data.value.map(e => e.entity.id === entityModalData.value.id ? res : e)
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
    await $api('/v1/admin/config/entitys/{entity_id}', {
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
  if (entityModalData.value.state === 'create') {
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
    accessorKey: 'entity.description',
    header: '描述',
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
    <AdminModelEditor
      ref="entityModal"
      v-model="entityModalData.data"
      :title="entityModalData.state === 'create' ? '添加实体' : '编辑实体'"
      :description="entityModalData.state === 'create' ? '添加实体' : '编辑实体'" :loading="entityModalLoading"
      :json-schema="jsonSchema" :submit-text="entityModalData.state === 'create' ? '创建' : '保存'"
      :ai-system-prompt="aiSystemPrompt"
      @submit="entityModalHandler"
    >
      <template #form>
        <UFormField label="名称" name="entity.name">
          <UInput v-model="entityModalData.data.entity.name" class="w-full" />
        </UFormField>
        <UFormField label="描述" name="entity.description">
          <UInput v-model="entityModalData.data.entity.description" class="w-full" />
        </UFormField>
        <UFormField label="当前信息" name="state_model.current_status">
          <UInput v-model="entityModalData.data.state_model.current_status" class="w-full" />
        </UFormField>
        <UFormField label="人物形象" name="state_model.physical_appearance">
          <UInput v-model="entityModalData.data.state_model.physical_appearance" class="w-full" />
        </UFormField>
        <UFormField label="当前外观" name="state_model.current_appearance">
          <UInput v-model="entityModalData.data.state_model.current_appearance" class="w-full" />
        </UFormField>
        <UFormField label="人际关系" name="state_model.relationships">
          <FormJsonInput v-model="entityModalData.data.state_model.relationships" :default-value="{}" class="w-full" />
        </UFormField>
        <UFormField label="人设" name="state_model.persona">
          <UInput v-model="entityModalData.data.state_model.persona" class="w-full" />
        </UFormField>
        <UFormField label="重要事件" name="state_model.recent_events">
          <FormJsonInput v-model="entityModalData.data.state_model.recent_events" :default-value="[]" class="w-full" />
        </UFormField>
        <UFormField label="特质" name="state_model.traits">
          <FormJsonInput v-model="entityModalData.data.state_model.traits" :default-value="{}" class="w-full" />
        </UFormField>
      </template>
    </AdminModelEditor>
  </div>
</template>

<style></style>
