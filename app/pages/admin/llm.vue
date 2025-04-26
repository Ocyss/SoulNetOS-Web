<script lang="tsx" setup>
import type { TableColumn, TabsItem } from '@nuxt/ui'
import type { LLMModel, LLMModelCreate, LLMModelUpdate, LLMProvider, LLMProviderCreate, LLMProviderUpdate } from '~/types/models'
import { SPopconfirm, UButton, USelectMenu, USwitch } from '#components'
import * as v from 'valibot'

const { $api } = useNuxtApp()
const toast = useToast()

const { data: providers } = useApi('/v1/config/llm/providers')
const { data: models } = useApi('/v1/config/llm/models')
const { data: supportedApiFormats } = useApi('/v1/config/llm/providers/supported_api_formats')

const providerModal = ref(false)
const providerModalStatus = ref<'create' | 'update'>('create')
const providerModalForm = useTemplateRef('providerModalForm')
const providerModalData = ref<LLMProviderCreate | LLMProviderUpdate & { enabled: boolean, api_formats: string }>({
  enabled: true,
  api_formats: 'openai',
})
const providerModalID = ref<LLMProvider['id']>()
const providerModalLoading = ref(false)

const modelModal = ref(false)
const modelModalStatus = ref<'create' | 'update'>('create')
const modelModalForm = useTemplateRef('modelModalForm')
const modelModalData = ref<LLMModelCreate | LLMModelUpdate & { name: string, model_id: string, enabled: boolean, provider_id?: number }>({
  name: '',
  model_id: '',
  enabled: true,
})

const modelModalID = ref<LLMModel['id']>()
const modelModalLoading = ref(false)

// 表单验证
const providerSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty('名称不能为空'), v.minLength(1, '名称太短')),
  api_base: v.pipe(v.string(), v.trim(), v.nonEmpty('API基础URL不能为空')),
  api_key: v.pipe(v.string(), v.trim(), v.nonEmpty('API密钥不能为空')),
})

const modelSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty('名称不能为空'), v.minLength(1, '名称太短')),
  model_id: v.pipe(v.string(), v.trim(), v.nonEmpty('模型ID不能为空')),
  provider_id: v.pipe(v.number()),
})

// 提供商相关函数
function setProviderModal(status: 'create' | 'update', id?: number) {
  const provider = id ? providers.value?.find(p => p.id === id) : null
  if (id && !provider) {
    toast.add({
      title: '提供商不存在',
      description: '请检查提供商ID是否正确',
      color: 'error',
    })
  }
  providerModalData.value = jsonClone(provider || {
    enabled: true,
    api_formats: 'openai',
  })
  providerModalID.value = id
  providerModal.value = true
  providerModalStatus.value = status
}

async function createProvider() {
  providerModalLoading.value = true
  try {
    const res = await $api('/v1/config/llm/providers', {
      method: 'POST',
      body: providerModalData.value as LLMProviderCreate,
    })
    toast.add({
      title: '创建提供商',
      description: '提供商创建成功',
      color: 'success',
    })
    if (providers.value) {
      providers.value = [...providers.value, res]
    }
    providerModal.value = false
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '创建提供商',
      description: '提供商创建失败',
      color: 'error',
    })
  }
  finally {
    providerModalLoading.value = false
  }
}

async function updateProvider() {
  if (!providerModalForm.value || providerModalForm.value.dirtyFields.size === 0 || !providerModalID.value)
    return
  providerModalLoading.value = true
  try {
    const body = Array.from(providerModalForm.value.dirtyFields).reduce((acc, key) => {
      if (providerModalData.value[key]) {
        acc[key] = providerModalData.value[key]
      }
      return acc
    }, {} as Record<string, any>)

    const res = await $api('/v1/config/llm/providers/{provider_id}', {
      method: 'PATCH',
      path: {
        provider_id: providerModalID.value,
      },
      body,
    })
    if (providers.value) {
      providers.value = providers.value.map(p => p.id === providerModalID.value ? res : p)
    }
    toast.add({
      title: '更新提供商',
      description: '提供商更新成功',
      color: 'success',
    })
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '更新提供商',
      description: '提供商更新失败',
      color: 'error',
    })
  }
  finally {
    providerModalLoading.value = false
  }
}

async function deleteProvider(id?: number) {
  if (!id)
    return
  try {
    await $api('/v1/config/llm/providers/{provider_id}', {
      method: 'DELETE',
      path: {
        provider_id: id,
      },
    })
    toast.add({
      title: '删除提供商',
      description: '提供商删除成功',
      color: 'success',
    })
    if (providers.value) {
      providers.value = providers.value.filter(p => p.id !== id)
      const newModels = models.value?.filter(m => m.provider_id !== id) ?? []
      if (newModels.length !== models.value?.length) {
        models.value = newModels
      }
    }
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '删除提供商',
      description: '提供商删除失败',
      color: 'error',
    })
  }
}

async function providerModalHandler() {
  if (providerModalStatus.value === 'create') {
    await createProvider()
  }
  else {
    await updateProvider()
  }
}

const [modelModalDataSync, setModelModalDataSync] = useToggle(true)

// 模型相关函数
function setModelModal(status: 'create' | 'update', id?: number) {
  let model: LLMModel | undefined
  if (status === 'create' && id) {
    model = {
      name: '',
      model_id: '',
      provider_id: id,
      enabled: true,
    }
  }
  else if (status === 'update' && id) {
    model = models.value?.find(m => m.id === id)
    if (id && !model) {
      toast.add({
        title: '模型不存在',
        description: '请检查模型ID是否正确',
        color: 'error',
      })
    }
  }
  modelModalData.value = jsonClone(model || {
    name: '',
    model_id: '',
    enabled: true,
  })
  if (status === 'create') {
    modelModalDataSync.value = setModelModalDataSync(true)
  }
  modelModalID.value = id
  modelModal.value = true
  modelModalStatus.value = status
}

async function createModel() {
  modelModalLoading.value = true
  try {
    const res = await $api('/v1/config/llm/models', {
      method: 'POST',
      body: modelModalData.value as LLMModelCreate,
    })
    toast.add({
      title: '创建模型',
      description: '模型创建成功',
      color: 'success',
    })
    modelModal.value = false
    models.value ??= []
    models.value = [...models.value, res]
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '创建模型',
      description: '模型创建失败',
      color: 'error',
    })
  }
  finally {
    modelModalLoading.value = false
  }
}

async function updateModel() {
  if (!modelModalForm.value || modelModalForm.value.dirtyFields.size === 0 || !modelModalID.value)
    return
  modelModalLoading.value = true
  try {
    const body = Array.from(modelModalForm.value.dirtyFields).reduce((acc, key) => {
      if (modelModalData.value[key]) {
        acc[key] = modelModalData.value[key]
      }
      return acc
    }, {} as Record<string, any>)

    const res = await $api('/v1/config/llm/models/{model_id}', {
      method: 'PATCH',
      path: {
        model_id: modelModalID.value,
      },
      body,
    })
    if (models.value) {
      models.value = models.value.map(m => m.id === modelModalID.value ? res : m)
    }
    toast.add({
      title: '更新模型',
      description: '模型更新成功',
      color: 'success',
    })
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '更新模型',
      description: '模型更新失败',
      color: 'error',
    })
  }
  finally {
    modelModalLoading.value = false
  }
}

async function deleteModel(id?: number) {
  if (!id)
    return
  try {
    await $api('/v1/config/llm/models/{model_id}', {
      method: 'DELETE',
      path: {
        model_id: id,
      },
    })
    toast.add({
      title: '删除模型',
      description: '模型删除成功',
      color: 'success',
    })
    if (models.value) {
      models.value = models.value.filter(m => m.id !== id)
    }
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '删除模型',
      description: '模型删除失败',
      color: 'error',
    })
  }
}

async function modelModalHandler() {
  if (modelModalStatus.value === 'create') {
    await createModel()
  }
  else {
    await updateModel()
  }
}

// 处理展示数据
const providerColumns: TableColumn<LLMProvider>[] = [
  {
    id: 'expand',
    cell: ({ row }) => (
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-chevron-down"
        square
        aria-label="Expand"
        ui={{
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() && 'duration-200 rotate-180',
          ] as never,
        }}
        onClick={() => row.toggleExpanded()}
      />
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: '提供商名称',
  },
  {
    id: 'api_base',
    accessorKey: 'api_base',
    header: 'API Base',
  },
  {
    id: 'action',
    cell: ({ row }) => {
      return (
        <div class="flex gap-2 items-center">
          <USwitch
            modelValue={row.original.enabled}
            onUpdate:modelValue={(v) => {
              if (providers.value) {
                const provider = providers.value.find(p => p.id === row.original.id)
                if (provider) {
                  providers.value = providers.value.map(p => p.id === row.original.id ? { ...p, enabled: v } : p)
                }
              }
            }}
          />
          <UButton icon="i-lucide-plus" variant="outline" onClick={() => setModelModal('create', row.original.id)} />
          <UButton icon="i-lucide-edit" variant="outline" onClick={() => setProviderModal('update', row.original.id)} />
          <SPopconfirm
            trigger={{
              icon: 'i-lucide-trash',
              variant: 'outline',
            }}
            content="确定删除提供商吗？"
            confirm-text="确定"
            cancel-text="取消"
            onConfirm={() => deleteProvider(row.original.id)}
          />
        </div>
      )
    },
  },
]

// TODO: https://github.com/nuxt/ui/issues/2441
const modelColumns: TableColumn<LLMModel>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    enableGrouping: true,
    accessorFn: row => row.name,
    header: '模型名称',
  },
  {
    id: 'model_id',
    accessorKey: 'model_id',
    header: '模型ID',
  },
  {
    id: 'provider_id',
    accessorKey: 'provider_id',
    header: '提供商',
    enableGrouping: true,
    accessorFn: row => row.provider_id,
    cell: ({ row }) => {
      const provider = providers.value?.find(p => p.id === row.original.provider_id)
      return provider?.name || `未知提供商 (${row.original.provider_id})`
    },
  },
  {
    id: 'action',
    cell: ({ row }) => {
      return (
        <div class="flex gap-2 items-center">
          <USwitch
            modelValue={row.original.enabled}
            onUpdate:modelValue={(v) => {
              if (models.value) {
                const model = models.value.find(m => m.id === row.original.id)
                if (model) {
                  models.value = models.value.map(m => m.id === row.original.id ? { ...m, enabled: v } : m)
                }
              }
            }}
          />
          <UButton icon="i-lucide-edit" variant="outline" onClick={() => setModelModal('update', row.original.id)} />
          <SPopconfirm
            trigger={{
              icon: 'i-lucide-trash',
              variant: 'outline',
            }}
            content="确定删除该模型吗？"
            confirm-text="确定"
            cancel-text="取消"
            onConfirm={() => deleteModel(row.original.id)}
          />
        </div>
      )
    },
  },
]

const modelColumnsByProvider = modelColumns.filter(c => c.id !== 'provider_id')

// 按提供商分组的模型数据
const modelsByProvider = computed(() => {
  if (!models.value)
    return []

  return models.value.reduce((acc, model) => {
    acc[model.provider_id] ??= []
    acc[model.provider_id]!.push(model)
    return acc
  }, {} as Record<number, LLMModel[]>)
})

const grouping = ref<['name' | 'provider_id']>(['name'])

function updateGrouping(v: 'name' | 'provider_id') {
  grouping.value = [v]
}

const tabsItems = [
  {
    label: '提供商',
    icon: 'i-lucide-user',
    slot: 'provider' as const,
  },
  {
    label: '模型',
    icon: 'i-lucide-lock',
    slot: 'model' as const,
  },
] satisfies TabsItem[]

const { data: defaultModel, refresh: refreshDefaultModel } = useApi('/v1/config/llm/default')

const defaultModelItems = computed(() => {
  return Array.from(new Set(models.value?.map(m => m.name)))
})

const defaultModelLoading = ref(false)

async function updateDefaultModel(v: string) {
  defaultModelLoading.value = true
  try {
    await $api('/v1/config/llm/default', {
      method: 'PATCH',
      body: { default_model: v },
    })
    await refreshDefaultModel()
    toast.add({
      title: '更新默认模型',
      description: '更新默认模型成功',
      color: 'success',
    })
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: '更新默认模型',
      description: '更新默认模型失败',
      color: 'error',
    })
  }
  finally {
    defaultModelLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <USelectMenu
          :loading="defaultModelLoading"
          :disabled="defaultModelLoading"
          :model-value="defaultModel?.default_model"
          placeholder="选择默认模型"
          :items="defaultModelItems" class="w-48" @update:model-value="updateDefaultModel"
        />
      </div>
      <div class="flex gap-2">
        <UButton icon="i-lucide-plus" @click="setProviderModal('create')">
          添加提供商
        </UButton>
        <UButton icon="i-lucide-plus" @click="setModelModal('create')">
          添加模型
        </UButton>
      </div>
    </div>
    <UTabs :items="tabsItems" class="gap-4 w-full" :ui="{ trigger: 'flex-1' }">
      <template #provider>
        <UCard v-if="providers?.length === 0">
          <div class="p-4 text-center">
            暂无提供商，请添加提供商
          </div>
        </UCard>

        <UTable v-else :data="providers ?? undefined" :columns="providerColumns">
          <template #expanded="{ row }">
            <UTable v-if="row.original.id && modelsByProvider[row.original.id]" :data="modelsByProvider[row.original.id]" :columns="modelColumnsByProvider" />
            <div v-else class="p-1 text-center">
              暂无模型，请添加模型
            </div>
          </template>
        </UTable>
      </template>

      <template #model>
        <div class="flex gap-2 items-center">
          <UButton @click="updateGrouping('provider_id')">
            提供商
          </UButton>
          <UButton @click="updateGrouping('name')">
            名称
          </UButton>
        </div>
        <UCard v-if="models?.length === 0">
          <div class="p-4 text-center">
            暂无模型，请添加模型
          </div>
        </UCard>
        <UTable
          v-else :data="models ?? undefined" :columns="modelColumns" :grouping :grouping-options="{
            enableGrouping: true,
            groupedColumnMode: 'reorder',
          }"
        />
      </template>
    </UTabs>

    <UModal v-model:open="providerModal" :dismissible="false">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-bold">
              {{ providerModalStatus === 'create' ? '添加提供商' : '编辑提供商' }}
            </h2>
          </template>
          <UForm
            ref="providerModalForm"
            :state="providerModalData"
            :schema="providerSchema"
            class="p-4 gap-4"
            @submit="providerModalHandler"
          >
            <UFormField label="名称" name="name">
              <UInput v-model="providerModalData.name" class="w-full" />
            </UFormField>
            <UFormField label="API Base" name="api_base">
              <UInput v-model="providerModalData.api_base" class="w-full" />
            </UFormField>
            <UFormField label="API Key" name="api_key">
              <UInput v-model="providerModalData.api_key" class="w-full" />
            </UFormField>
            <UFormField label="API 格式" name="api_format">
              <USelectMenu v-model="providerModalData.api_formats" :items="supportedApiFormats ?? []" class="w-full" />
            </UFormField>
            <UFormField label="启用状态" name="enabled">
              <USwitch v-model="providerModalData.enabled" />
            </UFormField>
            <div class="flex justify-end gap-2 my-4">
              <UButton @click="providerModal = false">
                取消
              </UButton>
              <UButton :loading="providerModalLoading" type="submit">
                {{ providerModalStatus === 'create' ? '创建' : '保存' }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>
    <UModal v-model:open="modelModal" :dismissible="false">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-bold">
              {{ modelModalStatus === 'create' ? '添加模型' : '编辑模型' }}
            </h2>
          </template>
          <UForm
            ref="modelModalForm"
            :state="modelModalData"
            :schema="modelSchema"
            class="p-4 gap-4"
            @submit="modelModalHandler"
          >
            <UFormField label="名称" name="name">
              <UInput
                v-model="modelModalData.name" class="w-full"
                @blur="() => {
                  setModelModalDataSync(false)
                }"
                @update:model-value="() => {
                  if (!modelModalDataSync){ return }
                  modelModalData.model_id = modelModalData.name
                }"
              />
            </UFormField>
            <UFormField label="模型ID" name="model_id">
              <UInput
                v-model="modelModalData.model_id" class="w-full"
                @blur="() => {
                  setModelModalDataSync(false)
                }"
                @update:model-value="() => {
                  if (!modelModalDataSync){ return }
                  modelModalData.name = modelModalData.model_id
                }"
              />
            </UFormField>
            <UFormField label="提供商" name="provider_id">
              <USelect
                v-model="modelModalData.provider_id"
                :items="providers?.map(p => ({ label: p.name, value: p.id })) || []"
                class="w-full"
              />
            </UFormField>
            <UFormField label="启用状态" name="enabled">
              <USwitch v-model="modelModalData.enabled" />
            </UFormField>
            <div class="flex justify-end gap-2 my-4">
              <UButton @click="modelModal = false">
                取消
              </UButton>
              <UButton :loading="modelModalLoading" type="submit">
                {{ modelModalStatus === 'create' ? '创建' : '保存' }}
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
