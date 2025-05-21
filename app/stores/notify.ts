import type { EntityTable } from 'dexie'
import type { FetchResponse } from 'ofetch'
import type { NotifyData, UpaEventData } from '~/types/models'
import Dexie from 'dexie'
import { events } from 'fetch-event-stream'
import { defineStore } from 'pinia'
import deepmerge from '~/utils/deep'

const systemNotify: Record<string, Component> = {
  TEXT: defineAsyncComponent(() => import('~/components/Notify/Text.vue')),
}

type EventListenerCallBackResult = void | boolean | Partial<NotifyData>

interface EventListenerArgs {
  eventName: string
  callback: (event: UpaEventData) => EventListenerCallBackResult | Promise<EventListenerCallBackResult>
  options?: {
    preventNotification?: boolean
  }
}

const db = new Dexie('NotifyDatabase') as Dexie & {
  notifys: EntityTable<
    NotifyData,
    'id'
  >
}

db.version(1).stores({
  notifys: '++id, event',
})
window.db = db

export const useUpaNotify = defineStore('UpaNotify', {
  state: () => ({
    notifys: [] as NotifyData[],
    eventMap: new Map<string, Set<EventListenerArgs>>(),
    retried: 0,
    abort: null as AbortController | null,
    notifyRegistry: {} as Record<string, Component>,
  }),
  getters: {
    notifysComponent: (state) => {
      return {
        ...systemNotify,
        ...state.notifyRegistry,
      } as Record<string, Component>
    },
    notifysGroup: (state) => {
      return [...state.notifys].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)).reduce((acc, item) => {
        if (item.is_grouped) {
          const index = acc.findIndex(i => i[0].event === item.event)
          if (index !== -1 && acc[index]) {
            const [oldItem, oldGroup] = acc[index]
            acc[index] = [item, [...(oldGroup ?? []), oldItem]]
          }
          else {
            acc.push([item, null])
          }
        }
        else {
          acc.push([item, null])
        }
        return acc
      }, [] as Array<[NotifyData, NotifyData[] | null]>)
    },
  },
  actions: {
    async init() {
      this.notifys = await db.notifys.filter(n => !n.is_handled).toArray()
      await this.connect()
    },
    async connect() {
      const { $api } = useNuxtApp()
      this.abort = new AbortController()
      let t: NodeJS.Timeout | null = null
      const retryHandler = (e: any) => {
        if (e)
          console.warn('sse retry error', e)
        this.retried += 1
        if (t)
          clearTimeout(t)
        if (e?.response?.status === 401 || e?.response?.status === 418) {
          return
        }
        t = setTimeout(this.connect, 1000)
      }
      const lastid = await db.notifys.orderBy('id').last()

      const header = lastid
        ? {
            'last-event-id': lastid.id,
          }
        : undefined
      $api('/v1/sse', {
        responseType: 'stream',
        signal: this.abort.signal,
        timeout: 0,
        onRequestError: retryHandler,
        onResponse: this._responseHandler,
        onResponseError: retryHandler,
        retry: false,
        header: header as never,
        headers: header,
      }).then((res) => {
        console.log('sse res', res)
        retryHandler(null)
      }).catch(retryHandler)
    },
    onEvent(args: EventListenerArgs) {
      if (!this.eventMap.has(args.eventName)) {
        this.eventMap.set(args.eventName, new Set())
      }

      args.options = {
        preventNotification: true,
        ...args.options,
      }

      this.eventMap.get(args.eventName)?.add(args)

      onUnmounted(() => {
        this.eventMap.get(args.eventName)?.delete(args)
      })
    },
    async _responseHandler(res: {
      response: FetchResponse<any>
    }) {
      if (res.response.ok) {
        console.log('sse ok', res.response)
        const stream = events(res.response, this.abort?.signal)
        for await (const event of stream) {
          if (!event.data || !event.event) {
            continue
          }
          try {
            const data: UpaEventData = JSON.parse(event.data)
            const { data: _, ...omitdata } = { ...data }
            const notify = {
              ...omitdata,
              is_handled: false,
            }
            const handlers = this.eventMap.get(event.event) ?? []
            let preventNotification = false
            for (const handler of handlers) {
              const result = await handler.callback(data)
              if (result === true) {
                notify.is_handled = true
              }
              else if (typeof result === 'object') {
                deepmerge(notify, result, { clone: false })
              }
              if (handler.options?.preventNotification) {
                preventNotification = true
              }
            }
            if (!preventNotification) {
              this.notifys.push(notify)
            }
            await db.notifys.add(notify)
          }
          catch (e) {
            console.error('UpaNotify sse handler error: ', e)
          }
        }
      }
    },
    async handleNotify(notify: NotifyData, group?: NotifyData[]) {
      const apps = useApps()
      const app = apps.appRegistry.get(notify.package)
      if (!app) {
        throw new Error(`App ${notify.package} not found`)
      }
      let result: boolean | void = false
      if (typeof app.notifyHandler === 'function') {
        result = await app.notifyHandler(notify)
      }
      else {
        const [_package, event, ..._data] = notify.event.split('/')
        if (!event) {
          throw new TypeError(`Notify event ${notify.event} not found`)
        }
        const handler = app.notifyHandler?.[event]
        if (typeof handler === 'function') {
          result = await handler(notify)
        }
        else {
          throw new TypeError(`Notify handler ${event} not found`)
        }
      }
      if (result !== false) {
        const nid = [notify.id, ...(group?.map(n => n.id) ?? [])]

        await Promise.all(nid.map(id => db.notifys.update(id, {
          is_handled: true,
        })))
        this.notifys = this.notifys.filter(n => !nid.includes(n.id))
      }
    },
    async ignoreNotify(notify: NotifyData) {
      await db.notifys.update(notify.id, {
        is_handled: true,
      })
    },
    async ignoreNotifyAll() {
      const notifys = await db.notifys.filter(n => !n.is_handled).toArray()
      await Promise.all(notifys.map(n => db.notifys.update(n.id, {
        is_handled: true,
      })))
      return notifys.length
    },
    async ignoreNotifyByCondition(callback: (notify: [NotifyData, NotifyData[] | null]) => boolean) {
      for (const notify of this.notifysGroup) {
        if (callback(notify)) {
          await this.ignoreNotify(notify[0])
          notify[1]?.forEach(n => this.ignoreNotify(n))
        }
      }
    },
    registerNotification(appKey: string, component: Component) {
      this.notifyRegistry[appKey] = component
    },
    unRegisterNotification(appKey: string) {
      delete this.notifyRegistry[appKey]
    },
    async resetAll() {
      // eslint-disable-next-line no-alert
      const confirm = prompt('确定要清空所有通知吗？请输入"确认清空"来确认')
      if (!confirm || confirm !== '确认清空')
        return
      const { $api } = useNuxtApp()
      await $api('/v1/reset_all')
      this.notifys = []
      db.notifys.clear()
    },
  },
})
