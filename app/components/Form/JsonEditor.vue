<!-- https://github.com/josdejong/svelte-jsoneditor -->
<!-- copy from https://github.com/rotki/rotki -->
<script setup lang="ts" generic="T extends object">
import type Ajv from 'ajv'
import type { Content, JsonEditor, JSONEditorPropsOptional, JSONSchema } from 'vanilla-jsoneditor'
import { useDebounceFn } from '@vueuse/core'
import addFormats from 'ajv-formats'
import { createJSONEditor, Mode } from 'vanilla-jsoneditor'
import { createAjvValidatorAsync, loadSchema } from '~/utils/validator'

const props = withDefaults(defineProps<{
  modelValue: T
  label?: string
  omit?: string[]
  schema?: string | JSONSchema
  readonly?: boolean
}>(), {
  label: '',
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const modelValue = useVModel(props, 'modelValue', emit, { passive: true, deep: true }) as Ref<T>

const tempValue = ref<string | null>(null)

function saveValue() {
  if (!tempValue.value)
    return
  try {
    modelValue.value = JSON.parse(tempValue.value)
    tempValue.value = null
    return modelValue.value
  }
  catch (error) {
    console.error(error)
  }
}

defineExpose({
  saveValue,
})

const jsonEditorProps: JSONEditorPropsOptional = {
  content: {
    json: modelValue.value,
  },
  navigationBar: false,
  statusBar: false,
  mode: Mode.text,
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const jsonEditor = ref<JsonEditor>()
const jsonEditorContainer = useTemplateRef('jsonEditorContainer')

watchIgnorable(modelValue, (json: T) => {
  if (JSON.stringify(json) === tempValue.value)
    return
  jsonEditor.value?.set({ json })
  tempValue.value = null
}, {
  deep: true,
})

watch(() => props.readonly, (readonly: boolean) => {
  jsonEditor.value?.updateProps({
    readOnly: readonly,
  })
})

jsonEditorProps.onChange = useDebounceFn((updatedContent: Content) => {
  if ('text' in updatedContent && updatedContent.text != null) {
    tempValue.value = updatedContent.text
  }
  if ('json' in updatedContent && updatedContent.json != null) {
    modelValue.value = updatedContent.json as T
    tempValue.value = null
  }
}, 100)

if (props.schema) {
  const onCreateAjv = (ajv: Ajv) => {
    addFormats(ajv)
  }
  if (typeof props.schema === 'string') {
    jsonEditorProps.validator = await createAjvValidatorAsync({
      schema: {
        $ref: props.schema,
      },
      onCreateAjv,
      ajvOptions: {
        loadSchema,
      },
    })
  }
  else {
    jsonEditorProps.validator = createAjvValidator({
      onCreateAjv,
      schema: props.schema,
    })
  }
}

onMounted(async () => {
  if (!jsonEditorContainer.value) {
    throw new Error('jsonEditorContainer is required')
  }
  jsonEditor.value = createJSONEditor({
    props: jsonEditorProps,
    target: jsonEditorContainer.value,
  })
})

onBeforeUnmount(() => {
  saveValue()
  jsonEditor.value?.destroy()
})
</script>

<template>
  <div class="mt-4">
    <div
      v-if="label"
      class="text-caption text-rui-text-secondary mb-1"
    >
      {{ label }}
    </div>
    <div :class="isDark ? 'jse-theme-dark' : 'jse-theme-light'">
      <div ref="jsonEditorContainer" />
    </div>
  </div>
</template>
