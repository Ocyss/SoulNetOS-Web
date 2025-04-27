import type { EntityTable } from 'dexie'
import type { FetchResponse } from 'ofetch'
import type { EventData, Notify } from '~/types/models'
import Dexie from 'dexie'
import { events } from 'fetch-event-stream'
import { defineStore } from 'pinia'
import NText from '~/components/notification/NText.vue'

const systemNotify: Record<string, Component> = {
  TEXT: NText,
}

interface EventListenerArgs {
  eventName: string
  callback: (event: EventData) => void | Promise<void>
  options?: {
    preventNotification?: boolean
  }
}

type NotifyData = EventData & {
  isHandled: boolean
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

export const useUpaNotify = defineStore('UpaNotify', {
  state: () => ({
    notifys: [] as Notify[],
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
  },
  actions: {
    async init() {
      this.notifys = (await db.notifys.filter(n => !n.isHandled && !!n.notify).toArray()).map(n => ({
        ...n.notify,
        event_id: n.event,
      }) as Notify)
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
            const data: EventData = JSON.parse(event.data)
            await db.notifys.add({
              ...data,
              isHandled: false,
            })
            const handlers = this.eventMap.get(event.event) ?? []
            let preventNotification = false
            for (const handler of handlers) {
              await handler.callback(data)
              if (handler.options?.preventNotification) {
                preventNotification = true
              }
            }
            if (!preventNotification && data.notify) {
              this.notifys.push({
                ...data.notify,
                event_id: event.event,
              })
            }
          }
          catch (e) {
            console.error('sse parse error', e)
          }
        }
      }
    },

    registerNotification(appKey: string, component: Component) {
      this.notifyRegistry[appKey] = component
    },

    unRegisterNotification(appKey: string) {
      delete this.notifyRegistry[appKey]
    },
  },
})
