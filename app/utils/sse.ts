import type { ServerSentEventMessage } from 'fetch-event-stream'

import { events, stream, utils } from 'fetch-event-stream'

export { events, stream, utils }

// https://github.com/lukeed/fetch-event-stream/blob/main/mod.ts

export async function* revents(res: any, signal?: AbortSignal) {
  const iter = utils.stream(res)

  let line
  const reader = iter.getReader()
  let event: ServerSentEventMessage | undefined

  for (;;) {
    if (signal && signal.aborted) {
      return reader.cancel()
    }

    line = await reader.read()
    if (line.done)
      return

    if (!line.value) {
      if (event)
        yield event
      event = undefined
      continue
    }

    const [field, value] = utils.split(line.value) || []
    if (!field)
      continue // comment or invalid

    if (field === 'data') {
      event ||= {}
      event[field] = event[field] ? (`${event[field]}\n${value}`) : value
    }
    else if (field === 'event') {
      event ||= {}
      event[field] = value
    }
    else if (field === 'id') {
      event ||= {}
      event[field] = value ? (+value || value) : undefined
    }
    else if (field === 'retry') {
      event ||= {}
      event[field] = value ? +value : undefined
    }
  }
}
