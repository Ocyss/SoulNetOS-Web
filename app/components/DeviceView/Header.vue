<script lang="tsx" setup>
import type { NotifyData } from '~/types/models'
import { UIcon } from '#components'

const leftOpen = defineModel<boolean>('leftOpen', { required: true })
const rightOpen = defineModel<boolean>('rightOpen', { required: true })

const upa = useUpaNotify()
const apps = useApps()
const filteredNotifications = computed(() => {
  const packNameMap = new Map<string, NotifyData>()

  upa.notifys.forEach((notify) => {
    if (!packNameMap.has(notify.package)) {
      packNameMap.set(notify.package, notify)
    }
  })

  return Array.from(packNameMap.values())
})

const notifyIcons = defineComponent({
  props: ['notify'],
  setup(props: { notify: NotifyData }) {
    const icon = computed(() => {
      return apps.appRegistry.get(props.notify.package)?.icon
    })
    return () => icon.value ? <UIcon name={icon.value} size="sm" /> : null
  },
})

const { date } = useOsDate()

const formattedTime = computed(() => {
  const currentDate = date.value
  const hours = currentDate.hour.toString().padStart(2, '0')
  const minutes = currentDate.minute.toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

// const barLeft = useTemplateRef('barLeft')
// const barRight = useTemplateRef('barRight')
// const { pressed: barLeftPressed } = useMousePressed({ target: barLeft })
// const { pressed: barRightPressed } = useMousePressed({ target: barRight })

// const barLeftEvent: (() => void)[] = []
// const barRightEvent: (() => void)[] = []

// function mouseHandler(handler: (value: boolean) => boolean) {
//   let lastX: number | null = null
//   return (event: MouseEvent | TouchEvent) => {
//     let x = 0
//     if (event instanceof TouchEvent) {
//       x = event.touches[0]?.clientX ?? 0
//     }
//     else {
//       x = event.movementX
//     }
//     if (lastX && x > lastX) {
//       handler(true)
//     }
//     lastX = x
//   }
// }

// watch(barLeftPressed, (value) => {
//   if (value) {
//     const listenerOptions = { passive: true }
//     const handler = mouseHandler(setLeftOpen)
//     barLeftEvent.push(useEventListener(barLeft, ['mousemove', 'dragover'], handler, listenerOptions))
//     barLeftEvent.push(useEventListener(barLeft, ['touchstart', 'touchmove'], handler, listenerOptions))
//   }
//   else {
//     barLeftEvent.forEach((event) => {
//       event()
//     })
//     barLeftEvent.length = 0
//   }
// })

// watch(barRightPressed, (value) => {
//   if (value) {
//     const listenerOptions = { passive: true }
//     const handler = mouseHandler(setRightOpen)
//     barRightEvent.push(useEventListener(barRight, ['mousemove', 'dragover'], handler, listenerOptions))
//     barRightEvent.push(useEventListener(barRight, ['touchstart', 'touchmove'], handler, listenerOptions))
//   }
//   else {
//     barRightEvent.forEach((event) => {
//       event()
//     })
//     barRightEvent.length = 0
//   }
// })
</script>

<template>
  <div class="flex flex-row items-center justify-between w-full h-full *:h-ful *:w-1/2">
    <div class="flex pl-3 justify-start gap-2 items-center" @click="leftOpen = true">
      <span class="text-sm">{{ formattedTime }}</span>
      <notifyIcons v-for="item in filteredNotifications" :key="item.id" :notify="item" />
    </div>
    <div class="flex pr-3 justify-end gap-2" @click="rightOpen = true">
      <UIcon name="i-fluent:bluetooth-24-regular" />
      <UIcon name="i-fluent:cellular-unavailable-24-regular" />
      <UIcon name="i-fluent:cellular-unavailable-24-regular" />
      <UIcon name="i-fluent:wifi-1-24-regular" />
      <UIcon name="i-fluent:battery-10-32-regular" />
    </div>
  </div>
</template>

<style>

</style>
