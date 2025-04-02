import type { InjectionKey } from 'vue'
import type { RegisteredApp } from './app'

export const appSymbol = Symbol() as InjectionKey<RegisteredApp | undefined>
