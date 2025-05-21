<!-- https://github.com/josdejong/svelte-jsoneditor -->
<!-- copy from https://github.com/rotki/rotki -->
<script setup lang="ts">
import type Ajv from 'ajv'
import type { Content, JsonEditor, JSONEditorPropsOptional, JSONSchema } from 'vanilla-jsoneditor'
import { useDebounceFn } from '@vueuse/core'
import addFormats from 'ajv-formats'
import { createJSONEditor, Mode } from 'vanilla-jsoneditor'
import { createAjvValidatorAsync, loadSchema } from '~/utils/validator'

const props = withDefaults(defineProps<{
  label?: string
  omit?: string[]
  schema?: string | JSONSchema
  readonly?: boolean
}>(), {
  label: '',
  readonly: false,
})

const modelValue = defineModel<object>({ required: true })
const tempValue = ref<string>(JSON.stringify(modelValue.value))

function saveValue() {
  modelValue.value = JSON.parse(tempValue.value)
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

watchIgnorable(modelValue, (json: any) => {
  if (JSON.stringify(json) === tempValue.value)
    return
  jsonEditor.value?.set([undefined, ''].includes(json) ? { text: tempValue.value } : { json })
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
    // ignoreUpdates(() => {
    //   try {
    //     modelValue.value = JSON.parse(updatedContent.text)
    //   }
    //   catch (error) {
    //     console.warn('JSONEditor json parse error', updatedContent, error)
    //   }
    // })
  }
  if ('json' in updatedContent && updatedContent.json != null) {
    modelValue.value = updatedContent.json as object
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
