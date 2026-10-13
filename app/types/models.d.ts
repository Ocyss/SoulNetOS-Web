import type { components } from '#open-fetch-schemas/api'

export type Entity = components['schemas']['Entity']
export type EntityCreate = components['schemas']['EntityCreate']
export type EntityUpdate = components['schemas']['EntityUpdate']
export type EntityStateInit = components['schemas']['EntityStateInit']
export type EntityState = components['schemas']['EntityState']
export type EntityAdminPublic = components['schemas']['EntityAdminPublic']
export type EntityPublic = components['schemas']['EntityPublic']
export type User = components['schemas']['UserPublic']
export type UserCreate = components['schemas']['UserCreate']
export type WorldEmotion = components['schemas']['WorldEmotion']
export type WorldEmotionCreate = components['schemas']['WorldEmotionCreate']
export type WorldEmotionUpdate = components['schemas']['WorldEmotionUpdate']
export type LLMModel = components['schemas']['LLMModel']
export type LLMModelCreate = components['schemas']['LLMModelCreate']
export type LLMModelUpdate = components['schemas']['LLMModelUpdate']
export type LLMProvider = components['schemas']['LLMProvider']
export type LLMProviderCreate = components['schemas']['LLMProviderCreate']
export type LLMProviderUpdate = components['schemas']['LLMProviderUpdate']
export type BaseInfo = components['schemas']['BaseInfo']
export type UpaEventData<DT = object> = components['schemas']['UpaEventData'] & {
  data?: DT
}

export type NotifyData<T = object> = Omit<UpaEventData, 'data'> & {
  is_handled: boolean
  props?: T
}
export type FileMetadata = components['schemas']['FileMetadata']

export type AiMessage = components['schemas']['ChatCompletionUserMessage'] | components['schemas']['ChatCompletionAssistantMessage'] | components['schemas']['ChatCompletionToolMessage'] | components['schemas']['ChatCompletionSystemMessage'] | components['schemas']['ChatCompletionFunctionMessage'] | components['schemas']['ChatCompletionDeveloperMessage']

export type JSONSchema = Record<string, unknown>
export type JSONSchemaDefinitions = Record<string, JSONSchema>
export type JSONSchemaEnum = Array<unknown>
