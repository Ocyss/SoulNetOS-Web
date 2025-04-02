import type { RouteComponent } from 'vue-router'

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

export type AppComponent = RouteComponent
export type AppWidgetComponent = RouteComponent

export interface RegisteredApp {
  key: string
  name: string
  icon: string
  page: AppComponent
  widget?: AppWidgetComponent
  ui?: {
    phoneLayout: {
      root?: string
      statusBar?: string
      content?: string
      footer?: string
    }
  }
}
