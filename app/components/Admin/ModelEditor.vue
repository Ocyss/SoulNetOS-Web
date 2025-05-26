<script lang="ts" setup generic="T extends object">
import type { FormErrorEvent } from '@nuxt/ui'
import type { AiMessage, JSONSchema } from '~/types/models'
import type { LoadSchemaOptions } from '~/utils/validator'
import { events } from 'fetch-event-stream'
import { parse } from 'partial-json'
import { loadSchema } from '~/utils/validator'

const props = withDefaults(defineProps<{
  modelValue: T
  title?: string
  description?: string
  loading: boolean
  cancelText?: string | false
  submitText?: string | false
  jsonSchema?: string | {
    schema: string | JSONSchema
  } & LoadSchemaOptions
  aiSystemPrompt?: string
}>(), {
  cancelText: '取消',
  submitText: '确定',
})

const emit = defineEmits<{
  'submit': [value: T]
  'error': [e: FormErrorEvent]
  'update:modelValue': [value: T]
}>()

const jsonSchema = ref<JSONSchema>()

const modelValue = useVModel(props, 'modelValue', emit, { passive: true, deep: true }) as Ref<T>
const { $api } = useNuxtApp()

const [open, setOpen] = useToggle(false)
const jsonEditor = useTemplateRef('jsonEditor')

const aiPrompt = ref('')
const aiLoading = ref(false)

const aiPromptResponseTypeItems = ['json-schema', 'json-object', 'text']

const aiModelLoading = ref(false)
const { data: aiModels } = useApi('/v1/admin/config/llm/models')
const aiModelValue = useLocalStorage(`AdminModelEditor/aiModelValue:${location.pathname}`, {
  model: '',
  response_format: 'text',
  max_tokens: 2048,
  temperature: 0.3,
  top_p: 0.5,
})
const aiModelItems = computed(() => {
  return Array.from(new Set(aiModels.value?.map(m => m.name)))
})

async function aiPromptHandler() {
  aiLoading.value = true
  try {
    const messages: AiMessage[] = [

    ]
    if (props.aiSystemPrompt) {
      messages.unshift({
        role: 'system',
        content: props.aiSystemPrompt,
      })
    }

    let response_format: Record<string, any> | undefined
    let content = `${aiPrompt.value}\n\n## 当前json:\n${JSON.stringify(modelValue.value, null, 2)}`
    if (jsonSchema.value) {
      if (aiModelValue.value.response_format !== 'json-schema') {
        content += `\n\n## 总是使用Json输出，格式如下:\n${JSON.stringify(jsonSchema.value, null, 2)}`
      }
      if (aiModelValue.value.response_format === 'json-schema') {
        response_format = {
          type: 'json_schema',
          json_schema: {
            // strict: true,
            schema: jsonSchema.value,
          },
        }
      }
      else if (aiModelValue.value.response_format === 'json-object') {
        response_format = {
          type: 'json_object',
        }
      }
    }

    messages.push({ role: 'user', content })
    const abort = new AbortController()

    const result = await new Promise<string>((resolve, reject) => {
      let result = ''
      $api('/v1/admin/chat/completions', {
        method: 'POST',
        body: {
          ...aiModelValue.value,
          messages,
          response_format,
          template: true,
        },
        signal: abort.signal,
        responseType: 'stream',
        timeout: 0,
        retry: 0,
        onResponse: async (res) => {
          if (res.response.ok) {
            const stream = events(res.response, abort?.signal)
            for await (const event of stream) {
              if (!event.data) {
                continue
              }
              else if (event.data === '[DONE]') {
                resolve(result)
                break
              }
              try {
                const data = JSON.parse(event.data)
                if (data?.choices?.[0]?.delta?.content) {
                  result += data.choices[0].delta.content
                  modelValue.value = parse(result)
                }
              }
              catch (e) {
                console.error('UpaNotify sse handler error: ', e)
              }
            }
          }
        },
        onRequestError: (e) => {
          reject(e)
        },
      }).catch(reject)
    })
    modelValue.value = parse(result)
    console.log('end', parse(result))
  }
  catch (error) {
    console.error(error)
  }
  finally {
    aiLoading.value = false
  }
}

function submit() {
  const v = jsonEditor.value?.saveValue()
  if (v) {
    modelValue.value = v
  }
  emit('submit', modelValue.value)
}

function error(e: FormErrorEvent) {
  emit('error', e)
}

defineExpose({
  open,
  setOpen,
})

onMounted(() => {
  if (props.jsonSchema) {
    if (typeof props.jsonSchema === 'string') {
      loadSchema({ schema: props.jsonSchema }).then((schema) => {
        jsonSchema.value = schema
      })
    }
    else {
      loadSchema(props.jsonSchema).then((schema) => {
        jsonSchema.value = schema
      })
    }
  }
})
</script>

<template>
  <KeepAlive>
    <UModal
      v-model:open="open"
      :dismissible="false"
      :title="title"
      :description="description"
      :ui="{ content: 'w-5xl max-w-[unset]' }"
    >
      <template #content>
        <UCard :ui="{ body: 'pt-0!' } " class="overflow-y-auto scrollbar-thin">
          <template #header>
            <h2 class="text-lg font-bold">
              {{ title }}
            </h2>
          </template>
          <UForm :state="modelValue" class="gap-4" @error="error">
            <UTabs
              :items="[{ label: 'Form', slot: 'form' }, { label: 'Json', slot: 'json' }]"
              variant="link"
              class="gap-4 w-full"
              :ui="{ trigger: 'grow' }"
              @update:model-value="jsonEditor?.saveValue()"
            >
              <template #form>
                <slot name="form" />
              </template>
              <template #json>
                <FormJsonEditor
                  ref="jsonEditor" v-model="modelValue" :schema="jsonSchema" :readonly="aiLoading"
                />
                <UAccordion :items="[{ label: 'AI' }]" :ui="{ body: 'flex flex-col gap-4 items-start' }">
                  <template #body>
                    <UTextarea v-model="aiPrompt" class="w-full" :maxrows="7" autoresize />
                    <div class="flex gap-2 flex-wrap">
                      <USelectMenu
                        v-model="aiModelValue.model"
                        :loading="aiModelLoading"
                        :disabled="aiModelLoading"
                        placeholder="选择模型"
                        :items="aiModelItems" class="w-48"
                      />
                      <USelect
                        v-model="aiModelValue.response_format"
                        placeholder="选择类型"
                        :items="aiPromptResponseTypeItems" class="w-48"
                      />
                      <UFormField label="Max Tokens" name="max_tokens">
                        <UInput v-model="aiModelValue.max_tokens" :min="1" :step="32" type="number" />
                      </UFormField>
                      <UFormField label="Temperature" name="temperature">
                        <UInput v-model="aiModelValue.temperature" :min="0" :max="1" :step="0.1" type="number" />
                      </UFormField>
                      <UFormField label="Top P" name="top_p">
                        <UInput v-model="aiModelValue.top_p" :min="0" :max="1" :step="0.1" type="number" />
                      </UFormField>
                      <UButton color="success" size="xs" @click="aiPromptHandler">
                        生成/更新
                      </UButton>
                    </div>
                  </template>
                </UAccordion>
              </template>
            </UTabs>
            <div class="flex justify-end gap-2 my-4">
              <UButton v-if="cancelText" @click="setOpen(false)">
                {{ cancelText }}
              </UButton>
              <UButton v-if="submitText" :loading="loading" @click="submit">
                {{ submitText }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>
  </KeepAlive>
</template>

<style>

</style>
