// https://github.com/josdejong/svelte-jsoneditor/blob/main/src/lib/plugins/validator/createAjvValidator.ts

import type { Ajv, ErrorObject, Schema, ValidateFunction } from 'ajv'
import type { AjvValidatorOptions, ValidationError, Validator } from 'vanilla-jsoneditor'
import type { JSONSchema } from '~/types/models'
import AjvDist from 'ajv'
import ajvLocal from 'ajv-i18n/localize/zh'
import { parsePath } from 'immutable-json-patch'
import { ValidationSeverity } from 'vanilla-jsoneditor'

export async function createAjvValidatorAsync(options: AjvValidatorOptions): Promise<Validator> {
  const ajv = createAjvInstance(options)

  const validateAjv = await ajv.compileAsync(options.schema)

  return createValidateFunction(validateAjv, options)
}

export function createAjvValidator(options: AjvValidatorOptions): Validator {
  const ajv = createAjvInstance(options)

  const validateAjv = ajv.compile(options.schema as Schema)

  return createValidateFunction(validateAjv, options)
}

export interface LoadSchemaOptions {
  schema: string | JSONSchema
  omit?: string[]
  required?: string[]
  notAdditionalProperties?: boolean
}

export async function loadSchema(options: LoadSchemaOptions | string) {
  if (typeof options === 'string') {
    options = { schema: options }
  }
  let schema = options.schema
  if (typeof schema === 'string') {
    let uri = schema
    if (uri.startsWith('/')) {
      uri = useRuntimeConfig().public.openFetch.api.baseURL + uri
    }
    const response = await fetch(uri)
    schema = await response.json() as JSONSchema
  }
  if (options.omit) {
    schema = jsonSchemaOmit(schema, options.omit)
  }
  if (options.required) {
    schema = applyRequiredToSchema(schema, options.required)
  }
  if (options.notAdditionalProperties) {
    const result = removeAdditionalPropertiesObject(schema)
    if (result && !Array.isArray(result)) {
      schema = result
    }
  }
  return schema
}

export function jsonSchemaOmit(schema: JSONSchema, omit?: string[]): JSONSchema {
  if (!omit?.length)
    return schema
  const result = JSON.parse(JSON.stringify(schema))

  for (const path of omit) {
    const parts = path.split('.')
    removeByPath(result, parts)
  }

  return result
}

function removeByPath(obj: any, parts: string[]) {
  if (!obj || typeof obj !== 'object' || parts.length === 0)
    return

  const [current, ...rest] = parts
  if (!current)
    return

  if (rest.length === 0) {
    if (obj.properties && current in obj.properties) {
      delete obj.properties[current]

      if (obj.required && obj.required.includes(current)) {
        obj.required = obj.required.filter((field: string) => field !== current)
      }
    }
    return
  }

  if (obj.properties && obj.properties[current]) {
    removeByPath(obj.properties[current], rest)
  }

  if (obj.anyOf && Array.isArray(obj.anyOf)) {
    obj.anyOf.forEach((item: any) => {
      removeByPath(item, [...parts])
    })
  }

  if (obj.properties && obj.properties[current] && obj.properties[current].anyOf) {
    obj.properties[current].anyOf.forEach((item: any) => {
      removeByPath(item, rest)
    })
  }
}

function createAjvInstance(options: AjvValidatorOptions): Ajv {
  const { schemaDefinitions, ajvOptions } = options

  let ajv = new AjvDist({
    allErrors: true,
    verbose: true,
    $data: true,
    ...ajvOptions,
  })

  if (schemaDefinitions) {
    Object.keys(schemaDefinitions).forEach((ref) => {
      ajv.addSchema(schemaDefinitions[ref] as Schema, ref)
    })
  }

  ajv = options.onCreateAjv?.(ajv) ?? ajv

  // validate whether ajv is configured correctly (this is needed to enhance error messages)
  if (ajv.opts.verbose === false) {
    throw new Error('Ajv must be configured with the option verbose=true')
  }

  return ajv
}

function createValidateFunction(
  ajvValidator: ValidateFunction,
  options: AjvValidatorOptions,
): Validator {
  if (ajvValidator.errors) {
    throw ajvValidator.errors[0]
  }

  return function validate(json: unknown): ValidationError[] {
    ajvValidator(json)
    const ajvErrors = ajvValidator.errors ?? []
    ajvLocal(ajvErrors as never)
    // console.log('ajvErrors', ajvErrors)
    return ajvErrors.map(error => normalizeAjvError(json, error, options))
  }
}

function normalizeAjvError(
  json: unknown,
  ajvError: ErrorObject,
  options: AjvValidatorOptions,
): ValidationError {
  return {
    path: parsePath(json, ajvError.instancePath),
    message: ajvError.message ?? 'Unknown error',
    severity: options.errorSeverity ?? ValidationSeverity.warning,
  }
}

function applyRequiredToSchema(schema: JSONSchema, requiredPaths: string[]): JSONSchema {
  for (const path of requiredPaths) {
    const parts = path.split('.')
    setRequiredByPath(schema, parts)
  }
  return schema
}

function setRequiredByPath(obj: JSONSchema, parts: string[]): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || parts.length === 0)
    return
  const [current, ...rest] = parts
  if (!current)
    return

  if (!('properties' in obj) || typeof obj.properties !== 'object' || obj.properties === null)
    obj.properties = {}
  const properties = obj.properties as Record<string, JSONSchema>

  if (rest.length === 0) {
    if (!('required' in obj) || !Array.isArray(obj.required))
      obj.required = []
    if (!(obj.required as string[]).includes(current))
      (obj.required as string[]).push(current)

    if (properties[current] && properties[current].default === null) {
      delete properties[current]?.default
    }
    return
  }

  if (!properties[current])
    properties[current] = {}
  setRequiredByPath(properties[current], rest)
}

function removeAdditionalPropertiesObject(schema: JSONSchema): JSONSchema | JSONSchema[] | undefined {
  if (Array.isArray(schema)) {
    return schema.map(removeAdditionalPropertiesObject).filter(Boolean) as JSONSchema[]
  }
  if (!schema || typeof schema !== 'object')
    return schema
  if ('additionalProperties' in schema) {
    return undefined
  }
  const result: JSONSchema = {}
  for (const key in schema) {
    const value = removeAdditionalPropertiesObject(schema[key] as JSONSchema)
    if (value !== undefined) {
      result[key] = value
    }
  }
  return result
}
