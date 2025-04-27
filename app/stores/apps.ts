import type { RoutesNamesList } from '@typed-router/__routes'

import type { RouteRecordRaw } from 'vue-router'
import type { RegisteredApp } from '~/types/app'
import { defineStore } from 'pinia'
import { RouterView } from 'vue-router'

export interface AppTask {
  id: string
  appKey: string
  routeName?: RoutesNamesList
  rmRoute?: () => void
  active: boolean
  createdAt: Date
  thumbnailUrl?: string
}

// TODO: Config
const defaultRegister = true

export const appRouteName = (appKey: string) => `appRoute/-${appKey}` as RoutesNamesList

export function createRoute(app: RegisteredApp) {
  const router = useRouter()

  const routeName = appRouteName(app.key)

  let newRoute: RouteRecordRaw | null = null

  if (Array.isArray(app.page)) {
    app.page[0].name = routeName
    newRoute = {
      path: app.key,
      component: defineComponent({
        setup() {
          return () => h(RouterView)
        },
      }),
      children: app.page,
    }
  }
  else {
    newRoute = {
      name: routeName,
      path: app.key,
      component: app.page,
    }
  }
  return router.addRoute('app', newRoute)
}

export const useApps = defineStore('appsStore', {
  state: () => ({
    appRegistry: new Map<string, RegisteredApp>(),
    tasks: [] as AppTask[],
  }),
  getters: {
    activeTask: (state) => {
      return state.tasks.find(t => t.active)
    },
  },
  actions: {
    registerApp(app: RegisteredApp) {
      this.appRegistry.get(app.key)?.rmRoute?.()

      this.appRegistry.set(app.key, {
        ...app,
        widget: app.widget ? markRaw(app.widget) : undefined,
        page: markRaw(app.page),
        rmRoute: createRoute(app),
      })
    },
    unRegisterApp(appKey: string) {
      this.appRegistry.delete(appKey)
    },
    activateTask(taskId: string) {
      const activeTask = this.activeTask
      if (activeTask?.id === taskId)
        return
      const task = this.tasks.find(t => t.id === taskId)
      if (!task)
        return
      if (activeTask) {
        activeTask.active = false
      }
      task.active = true
      if (task.routeName) {
        const router = useRouter()
        router.push({ name: task.routeName as never })
      }
    },
    getActiveTask() {
      return this.tasks.find(t => t.active)
    },
    launchApp(appKey: string) {
      const existingTask = this.tasks.find(task => task.appKey === appKey)
      if (existingTask) {
        this.activateTask(existingTask.id)
        return
      }
      const activeTask = this.getActiveTask()
      if (activeTask) {
        activeTask.active = false
      }
      const app = this.appRegistry.get(appKey)
      if (!app)
        return

      const taskId = `${appKey}-${Date.now()}`
      const newTask: AppTask = {
        id: taskId,
        appKey,
        active: true,
        createdAt: new Date(),
        routeName: appRouteName(app.key),
      }
      if (!defaultRegister) {
        newTask.rmRoute = createRoute(app)
      }

      this.tasks.push(newTask)
      const router = useRouter()
      router.push({ name: newTask.routeName })
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
      task.rmRoute?.()
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
