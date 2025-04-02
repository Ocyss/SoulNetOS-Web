// 虚拟时间只是相对于游戏世界，日期始终同步，当游戏日过了 只是统计数量，没有额外操作
import type { ZonedDateTime } from '@internationalized/date'
import { DateFormatter, getLocalTimeZone, now } from '@internationalized/date'

const df = new DateFormatter('zh-CN', {
  dateStyle: 'medium',
})

export function useOsDate() {
  const timeScale = ref(1)
  const date = shallowRef(now(getLocalTimeZone()))
  const realDate = shallowRef(now(getLocalTimeZone()))
  const isSynced = ref(false)

  const update = () => {
    const n = now(getLocalTimeZone())
    realDate.value = n

    if (isSynced.value) {
      date.value = n
    }
    else if (timeScale.value !== 0) {
      const deltaMs = n.compare(realDate.value)
      date.value = n.add({ milliseconds: deltaMs * timeScale.value })
    }
  }

  const controls = useRafFn(update, { immediate: true, fpsLimit: 10 })

  const setSpeed = (speed: number) => {
    isSynced.value = false
    timeScale.value = speed
  }

  const syncWithRealTime = () => {
    isSynced.value = true
    date.value = now(getLocalTimeZone())
  }

  const setTime = (t: ZonedDateTime) => {
    isSynced.value = false
    date.value = t
  }

  return {
    df,
    date: readonly(date),
    timeScale: readonly(timeScale),
    realDate: readonly(realDate),
    isSynced: readonly(isSynced),
    setSpeed,
    syncWithRealTime,
    setTime,
    ...controls,
  }
}
