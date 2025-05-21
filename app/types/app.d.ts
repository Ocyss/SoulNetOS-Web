import type { RouteRecordRaw } from 'vue-router'
import type { NotifyData } from './models'

export interface AppPosition {
  x: number
  y: number
  width?: number
  height?: number
}

export interface DesktopAppItem {
  key: string
  type: 'app' | 'widget'
  position?: AppPosition
}

export type AppComponent = Component | RouteRecordRaw[]

export type AppWidgetComponent = Component

type NotifyHandlerFn = (notify: NotifyData, options?: {
  package: string

}) => void | boolean | Promise<void | boolean>

interface RegisteredApp {
  package: string
  name: string
  icon: string
  page?: AppComponent
  actions?: Record<'click', (...args: any[]) => void>
  widget?: AppWidgetComponent
  ui?: {
    phoneLayout: {
      root?: string
      statusBar?: string
      content?: string
      footer?: string
    }
  }
  notifyHandler?: Record<string, NotifyHandlerFn> | NotifyHandlerFn
}
