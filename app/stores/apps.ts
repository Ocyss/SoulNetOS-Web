import type { RoutesNamesList } from '@typed-router/__routes'

import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric, RouteRecordRaw } from 'vue-router'
import type { RegisteredApp } from '~/types/app'
import { defineStore } from 'pinia'
import { RouterView } from 'vue-router'

type ToArgs = string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric

export interface AppTask {
  id: string
  appKey: string
  active: boolean
  createdAt: Date
  thumbnailUrl?: string
}

export type App = RegisteredApp & {
  rmRoute?: () => void
  routeRootName?: RoutesNamesList
  routeName?: RoutesNamesList
}

// TODO: Config
const defaultRegister = true

export function createRoute(app: RegisteredApp): { routeRootName?: RoutesNamesList, routeName?: RoutesNamesList, rmRoute?: () => void } {
  if (!app.page)
    return { }
  const router = useRouter()

  const routeRootName = `appsRoute/${app.package}`
  let routeName = routeRootName
  let newRoute: RouteRecordRaw | null = null

  if (Array.isArray(app.page)) {
    const children = app.page.map((p, index) => {
      if (!p.name) {
        return index === 0
          ? {
              ...p,
              name: routeRootName,
            }
          : p
      }
      return {
        ...p,
        name: `${routeRootName}/${String(p.name)}`,
      }
    })
    if (!app.page[0] || !children[0]) {
      throw new Error('App page must have a name')
    }
    newRoute = {
      name: app.page[0].name ? routeRootName : undefined,
      path: app.package,
      component: defineComponent({
        setup() {
          return () => h(RouterView)
        },
      }),
      children,
    }
    routeName = children[0].name as string
  }
  else {
    newRoute = {
      name: routeRootName,
      path: app.package,
      component: app.page,
    }
  }
  return { routeRootName: routeRootName as RoutesNamesList, routeName: routeName as RoutesNamesList, rmRoute: router.addRoute('app', newRoute) }
}

export const useApps = defineStore('AppsStore', {
  state: () => ({
    appRegistry: new Map<string, App>(),
    tasks: [] as AppTask[],
  }),
  getters: {
    activeTask: (state) => {
      return state.tasks.find(t => t.active)
    },
  },
  actions: {
    registerApp(app: RegisteredApp) {
      this.appRegistry.get(app.package)?.rmRoute?.()
      const { routeRootName, routeName, rmRoute } = createRoute(app)
      this.appRegistry.set(app.package, {
        ...app,
        widget: app.widget ? markRaw(app.widget) : undefined,
        page: app.page ? markRaw(app.page) : undefined,
        actions: app.actions ? app.actions : undefined,
        rmRoute,
        routeName,
        routeRootName,
      })
    },
    unRegisterApp(appKey: string) {
      this.appRegistry.delete(appKey)
    },
    gotoAppRoute(appKey: string, to?: ToArgs) {
      const app = this.appRegistry.get(appKey)
      if (!app)
        return
      const router = useRouter()
      if (!to) {
        router.push({ name: app.routeName })
      }
      else if (typeof to === 'string') {
        router.push(to)
      }
      else {
        to = { ...to }
        if ('name' in to && to.name)
          to.name = `${app.routeRootName}/${String(to.name)}`
        if ('path' in to && to.path)
          to.path = `/app/${app.package}/${to.path}`
        router.push(to)
      }
    },
    activateTask(taskId: string, to?: ToArgs) {
      const activeTask = this.activeTask
      if (activeTask?.id === taskId) {
        if (to)
          this.gotoAppRoute(activeTask.appKey, to)
        return
      }
      const task = this.tasks.find(t => t.id === taskId)
      if (!task)
        return
      if (activeTask) {
        activeTask.active = false
      }
      task.active = true
      this.gotoAppRoute(task.appKey, to)
    },
    launchApp(appKey: string, to?: ToArgs) {
      const existingTask = this.tasks.find(task => task.appKey === appKey)
      if (existingTask) {
        this.activateTask(existingTask.id, to)
        return
      }
      const activeTask = this.activeTask
      if (activeTask) {
        activeTask.active = false
      }
      const app = this.appRegistry.get(appKey)
      if (!app)
        return
      if (!app.page) {
        if (app.actions?.click) {
          app.actions.click()
        }
        return
      }
      const taskId = `${appKey}-${Date.now()}`
      const newTask: AppTask = {
        id: taskId,
        appKey,
        active: true,
        createdAt: new Date(),
      }
      if (!defaultRegister) {
        const { routeRootName, routeName, rmRoute } = createRoute(app)
        app.routeRootName = routeRootName
        app.routeName = routeName
        app.rmRoute = rmRoute
      }

      this.tasks.push(newTask)
      this.gotoAppRoute(appKey, to)
    },
    closeTask(taskId: string) {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId)
      if (taskIndex === -1)
        return
      const task = this.tasks[taskIndex]
      if (!task)
        return
      if (task.active) {
        const router = useRouter()
        router.push('/')
      }
      // task.rmRoute?.()
      this.tasks.splice(taskIndex, 1)
    },
    closeAllTasks() {
      this.tasks.forEach((task) => {
        this.closeTask(task.id)
      })
      this.tasks = []
    },
    gotoHome() {
      const activeTask = this.activeTask
      if (activeTask) {
        activeTask.active = false
      }
      navigateTo('/')
    },
    gotoTasks() {
      const activeTask = this.activeTask
      if (activeTask) {
        activeTask.active = false
      }
      navigateTo('/tasks')
    },
    gotoBack() {
      const router = useRouter()
      if (router.currentRoute.value.path === '/') {
        return
      }
      router.back()
    },
  },
})
