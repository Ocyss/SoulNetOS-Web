import type { RouteRecordRaw } from 'vue-router'
import { RouterView } from 'vue-router'
import apps from '~/apps'

export interface AppTask {
  id: string
  appKey: string
  routeName?: string
  rmRoute?: () => void
  active: boolean
  createdAt: Date
  thumbnailUrl?: string
}

const tasks = ref<AppTask[]>([])
window.__tasks__ = tasks

export function useAppTask() {
  const router = useRouter()

  const getActiveTask = () => {
    return tasks.value.find(t => t.active)
  }

  const activateTask = (taskId: string) => {
    const activeTask = getActiveTask()
    if (activeTask?.id === taskId)
      return
    const task = tasks.value.find(t => t.id === taskId)
    if (!task)
      return
    if (activeTask) {
      activeTask.active = false
    }
    task.active = true
    if (task.routeName) {
      router.push({ name: task.routeName as never })
    }
  }

  const closeTask = (taskId: string) => {
    const taskIndex = tasks.value.findIndex(t => t.id === taskId)
    if (taskIndex === -1)
      return
    const task = tasks.value[taskIndex]
    if (!task)
      return
    if (task.active) {
      router.push('/')
    }
    task.rmRoute?.()
    tasks.value.splice(taskIndex, 1)
  }

  const closeAllTasks = () => {
    tasks.value.forEach((task) => {
      closeTask(task.id)
    })
    tasks.value = []
  }

  const launchApp = async (appKey: string) => {
    const existingTask = tasks.value.find(task => task.appKey === appKey)
    if (existingTask) {
      activateTask(existingTask.id)
      return
    }
    const activeTask = getActiveTask()
    if (activeTask) {
      activeTask.active = false
    }
    const app = apps[appKey]
    if (!app)
      return

    const routeName = `app-${appKey}`

    let newRoute: RouteRecordRaw | null = null

    if (Array.isArray(app.page)) {
      app.page[0].name = routeName
      newRoute = {
        path: appKey,
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
        path: appKey,
        component: app.page,
      }
    }

    const taskId = `${appKey}-${Date.now()}`

    const rmRoute = router.addRoute('app', newRoute)

    const newTask: AppTask = {
      id: taskId,
      appKey,
      active: true,
      createdAt: new Date(),
      routeName,
      rmRoute,
    }

    tasks.value.push(newTask)

    router.push({ name: routeName as never })
  }

  const getAllTasks = () => {
    return tasks.value
  }

  const gotoHome = () => {
    const activeTask = getActiveTask()
    if (activeTask) {
      activeTask.active = false
    }
    navigateTo('/')
  }

  const gotoTasks = () => {
    const activeTask = getActiveTask()
    if (activeTask) {
      activeTask.active = false
    }
    navigateTo('/tasks')
  }

  const gotoBack = () => {
    if (router.currentRoute.value.path === '/') {
      return
    }
    router.back()
  }

  return {
    tasks: readonly(tasks),
    launchApp,
    activateTask,
    closeTask,
    closeAllTasks,
    getAllTasks,
    getActiveTask,
    gotoHome,
    gotoTasks,
    gotoBack,
  }
}
