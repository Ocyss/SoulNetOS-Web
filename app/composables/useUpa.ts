import { EventSource } from 'eventsource'

export type EventSourceStatus = 'CONNECTING' | 'OPEN' | 'CLOSED'

interface EventListenerArgs {
  eventName: string
  callback: (event: MessageEvent) => void
  options?: {
    hijack?: boolean
  }
}

const eventSource = ref<EventSource | null>(null)
const status = ref<EventSourceStatus | null>(null)
const error = ref<Event | null>(null)
const eventMap = new Map<string, Set<EventListenerArgs>>()
window.eventMap = eventMap
let retried = 0

function _init() {
  const token = useMyStore().token
  if (!token) {
    navigateTo({ path: '/login' })
    return
  }
  const runtimeConfig = useRuntimeConfig()
  const es = new EventSource(`${runtimeConfig.public.openFetch.api.baseURL}/v1/sse`, {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${token}`,
        },
      }),
  })
  es.addEventListener('open', (e) => {
    console.log('onopen', e)
  })
  es.addEventListener('error', (e) => {
    status.value = 'CLOSED'
    error.value = e
    // only reconnect if EventSource isn't reconnecting by itself
    // this is the case when the connection is closed (readyState is 2)
    if (es.readyState === 2) {
      es.close()
      retried += 1
      setTimeout(_init, 1000)
    }
  })
  es.addEventListener('message', (e) => {
    console.log('msg', { e })
    if (!e.data) {
      return
    }
    console.log({ e }, 2)
  })
  eventSource.value = es
}

function connect() {
  _init()
  retried = 0
}

function disconnect() {
  eventSource.value?.close()
}

export function useUpa() {
  const onEvent = (args: EventListenerArgs) => {
    if (!eventMap.has(args.eventName)) {
      eventMap.set(args.eventName, new Set())
    }

    args.options = {
      hijack: true,
      ...args.options,
    }

    eventMap.get(args.eventName)?.add(args)

    onUnmounted(() => {
      eventMap.get(args.eventName)?.delete(args)
    })
  }

  return {
    connect,
    disconnect,
    onEvent,
    eventSource,
    retried,
    status,
    error,
  }
}
