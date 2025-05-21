<!-- https://github.com/josdejong/svelte-jsoneditor -->
<!-- copy from https://github.com/rotki/rotki -->
<script setup lang="ts">
import type { Content, JsonEditor, JSONEditorPropsOptional } from 'vanilla-jsoneditor'
import { useDebounceFn } from '@vueuse/core'
import addFormats from 'ajv-formats'
import { createJSONEditor, Mode } from 'vanilla-jsoneditor'
import { createAjvValidatorAsync } from '~/utils/validator'

const props = withDefaults(defineProps<{
  label?: string
  omit?: string[]
  schema?: string
  defaultValue?: object
}>(), {
  label: '',
})

const modelValue = defineModel<object | null | undefined>({ required: true })

const tempValue = ref<string>(JSON.stringify(modelValue.value))

function saveValue() {
  try {
    modelValue.value = JSON.parse(tempValue.value)
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
    json: modelValue.value ?? props.defaultValue,
  },
  navigationBar: false,
  mainMenuBar: false,
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

jsonEditorProps.onChange = useDebounceFn((updatedContent: Content) => {
  if ('text' in updatedContent && updatedContent.text != null) {
    tempValue.value = updatedContent.text
  }
  if ('json' in updatedContent && updatedContent.json != null) {
    modelValue.value = updatedContent.json as object
  }
}, 100)

if (props.schema) {
  jsonEditorProps.validator = await createAjvValidatorAsync({
    schema: {
      $ref: props.schema,
    },
    onCreateAjv: (ajv) => {
      addFormats(ajv)
    },
    ajvOptions: {
      loadSchema(uri: string) {
        if (uri.startsWith('/')) {
          uri = useRuntimeConfig().public.openFetch.api.baseURL + uri
        }
        return fetch(uri).then(response => response.json()).then(schema => jsonSchemaOmit(schema, props.omit))
      },
    },
  })
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
  <div class="my-2">
    <div ref="jsonEditorContainer" class="jse-wrapper" :class="isDark ? 'jse-theme-dark' : 'jse-theme-light'" />
  </div>
</template>

<style scoped>
.jse-wrapper :deep(.jse-main) {
  min-height: 0px;
  max-height: 100px;
  overflow-y: auto;
}
</style>
