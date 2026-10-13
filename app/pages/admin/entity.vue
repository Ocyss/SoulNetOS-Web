<script lang="tsx" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Entity, EntityAdminPublic, EntityCreate, EntityPublic, EntityStateInit, EntityUpdate, JSONSchema } from '~/types/models'
import { UButton } from '#components'

interface EntityModalData {
  id?: Entity['id']
  loading: boolean
  state: 'create' | 'update'
  data: { entity: EntityCreate | EntityUpdate, state_init: EntityStateInit }
}
const store = useStore()

const transform = {
  ltr: (data: EntityAdminPublic) => {
    if (!data.state_init.relations) {
      return data
    }
    data.state_init.relations = Object.entries(data.state_init.relations).reduce((acc, relationship) => {
      const info = store.infos[Number(relationship[0])]
      if (info)
        acc[info.name] = relationship[1]
      return acc
    }, {} as Record<string, string>)
    return data
  },
  rtl: (data: EntityModalData['data']) => {
    if (!data.state_init || !data.state_init.relations) {
      return data
    }
    data.state_init.relations = Object.entries(data.state_init.relations).reduce((acc, relationship) => {
      const id = store.info_names[relationship[0]]
      if (id != null)
        acc[String(id)] = relationship[1]
      return acc
    }, {} as Record<string, string>)
    return data
  },
}

const { data, refresh } = useApi('/v1/admin/config/entitys', {
  transform: (data) => {
    return data.map(e => transform.ltr(e))
  },
})

const omit = ['state', 'entity.id', 'entity.created_at', 'entity.updated_at', 'state_init.id']

const { $api } = useNuxtApp()
const toast = useToast()

const jsonSchema: LoadSchemaOptions = {
  schema: '/schemas/EntityAdminPublic',
  omit: [...omit, 'entity.avatar'],
  required: ['state_init'],
  // notAdditionalProperties: true,
  handlerAdditionalProperties: {
    'state_init.relations': () => {
      return Object.values(store.infos).reduce((acc, info) => {
        acc[info.name] = {
          type: 'string',
        }
        return acc
      }, {} as Record<string, JSONSchema>)
    },
  },
}

const entityModal = useTemplateRef('entityModal')
const entityModalData = ref<EntityModalData>({ loading: false, state: 'create', data: { entity: {}, state_init: {
  emotions: [],
  relations: {},
} } })

const aiSystemPrompt = '你是专业的实体编辑器，请根据用户输入的实体信息，生成一个符合要求的实体信息。'

function setEntityModal(status: 'create' | 'update', id?: number) {
  const entity = id ? data.value?.find(e => e.entity.id === id) : { entity: {}, state_init: {} }
  if (id && !entity) {
    toast.add({
      title: '实体不存在',
      description: '请检查实体ID是否正确',
      color: 'error',
    })
  }

  entityModalData.value = { id, loading: false, state: status, data: useOmit(
    entity,
    jsonSchema.omit!,
  ) as EntityModalData['data'] }
  entityModal.value?.setOpen(true)
}

async function createEntity() {
  if (!entityModalData.value.data.entity || !entityModalData.value.data.state_init) {
    toast.add({
      title: '请填写完整信息',
      description: '请填写完整信息',
      color: 'error',
    })
    return
  }

  entityModalData.value.loading = true
  try {
    await $api('/v1/admin/config/entitys', {
      method: 'POST',
      body: transform.rtl(entityModalData.value.data) as never,
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
    entityModalData.value.loading = false
  }
}

async function updateEntity() {
  if (!entityModalData.value.id)
    return
  entityModalData.value.loading = true
  try {
    // const body = Array.from(entityModalForm.value.dirtyFields).reduce((acc, key) => {
    //   if (entityModalData.value[key]) {
    //     acc[key] = entityModalData.value[key]
    //   }
    //   return acc
    // }, {} as Record<string, any>)

    const res = transform.ltr(await $api('/v1/admin/config/entitys/{entity_id}', {
      method: 'PATCH',
      path: {
        entity_id: entityModalData.value.id,
      },
      body: transform.rtl(entityModalData.value.data),
    }))
    if (data.value) {
      data.value = data.value.map(e => e.entity.id === entityModalData.value.id ? res : e)
      entityModalData.value.data = useOmit(
        res,
        jsonSchema.omit!,
      ) as EntityModalData['data']
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
    entityModalData.value.loading = false
  }
}

async function deleteEntity(id?: number) {
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

async function entityModalHandler(data: EntityModalData['data']) {
  entityModalData.value.data = data
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
    <UTable :column-pinning="{ right: ['action'] }" :data="data ?? undefined" :columns="columns" class="flex-1 select-text" />
    <AdminModelEditor
      ref="entityModal"
      v-model="entityModalData.data"
      :title="entityModalData.state === 'create' ? '添加实体' : '编辑实体'"
      :description="entityModalData.state === 'create' ? '添加实体' : '编辑实体'"
      :loading="entityModalData.loading"
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
        <UFormField label="人设" name="entity.prompt">
          <UTextarea v-model="entityModalData.data.entity.prompt" class="w-full" :rows="10" autoresize />
        </UFormField>
      </template>
    </AdminModelEditor>
  </div>
</template>

<style></style>
