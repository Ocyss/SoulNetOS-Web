<script lang="ts" setup>
import { tv } from 'tailwind-variants'
import { appSymbol } from '~/types/keys'

const { gotoBack, gotoHome, gotoTasks } = useAppTask()
const currentApp = inject(appSymbol, undefined)

const phoneLayoutUI = tv({
  slots: {
    root: `relative mx-auto h-full w-full flex flex-col justify-around items-center bg-(--ui-bg) overflow-hidden rounded-2xl transition-all duration-300`,
    statusBar: 'bg-(--ui-bg-elevated)/20 h-8 relative w-full pt-1',
    content: 'flex-1 flex relative overflow-hidden w-full',
    footer: 'h-14 flex items-center justify-center space-x-15 bg-(--ui-bg-elevated)/20 w-full',
  },
})()
const phoneLayout = useTemplateRef('phoneLayout')
const phoneMain = useTemplateRef('phoneMain')
const [leftOpen, setLeftOpen] = useToggle(false)
const [rightOpen, setRightOpen] = useToggle(false)

const barLeft = useTemplateRef('barLeft')
const barRight = useTemplateRef('barRight')
const { pressed: barLeftPressed } = useMousePressed({ target: barLeft })
const { pressed: barRightPressed } = useMousePressed({ target: barRight })

const barLeftEvent: (() => void)[] = []
const barRightEvent: (() => void)[] = []

function mouseHandler(handler: (value: boolean) => boolean) {
  let lastX: number | null = null
  return (event: MouseEvent | TouchEvent) => {
    let x = 0
    if (event instanceof TouchEvent) {
      x = event.touches[0]?.clientX ?? 0
    }
    else {
      x = event.movementX
    }
    if (lastX && x > lastX) {
      handler(true)
    }
    lastX = x
  }
}

watch(barLeftPressed, (value) => {
  if (value) {
    const listenerOptions = { passive: true }
    const handler = mouseHandler(setLeftOpen)
    barLeftEvent.push(useEventListener(barLeft, ['mousemove', 'dragover'], handler, listenerOptions))
    barLeftEvent.push(useEventListener(barLeft, ['touchstart', 'touchmove'], handler, listenerOptions))
  }
  else {
    barLeftEvent.forEach((event) => {
      event()
    })
    barLeftEvent.length = 0
  }
})

watch(barRightPressed, (value) => {
  if (value) {
    const listenerOptions = { passive: true }
    const handler = mouseHandler(setRightOpen)
    barRightEvent.push(useEventListener(barRight, ['mousemove', 'dragover'], handler, listenerOptions))
    barRightEvent.push(useEventListener(barRight, ['touchstart', 'touchmove'], handler, listenerOptions))
  }
  else {
    barRightEvent.forEach((event) => {
      event()
    })
    barRightEvent.length = 0
  }
})

const phoneRatio = [20, 9] as const

useResizeObserver(phoneLayout, (entries) => {
  const entry = entries[0]
  if (!entry || !phoneLayout.value) {
    return
  }
  const { height } = entry.contentRect
  phoneLayout.value.style.maxWidth = `${height / phoneRatio[0] * phoneRatio[1]}px`
})

const { date } = useOsDate()

const formattedTime = computed(() => {
  const currentDate = date.value
  const hours = currentDate.hour.toString().padStart(2, '0')
  const minutes = currentDate.minute.toString().padStart(2, '0')
  return `${hours}:${minutes}`
})
</script>

<template>
  <div class="h-full w-full p-1 md:p-3">
    <div
      ref="phoneLayout"
      :class="phoneLayoutUI.root({ class: [currentApp?.ui?.phoneLayout?.root] })"
    >
      <div class="shadow-inner shadow-(color:--ui-bg-inverted) z-100 absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none" />
      <div ref="phoneMain" class="flex flex-col relative w-full h-full rounded-2xl overflow-hidden">
        <header :class="phoneLayoutUI.statusBar({ class: [currentApp?.ui?.phoneLayout?.statusBar] })">
          <slot name="statusBar">
            <div class="flex flex-row items-center justify-between w-full h-full *:h-ful *:w-1/2">
              <div ref="barLeft" class="flex pl-3 justify-start" @click="setLeftOpen(true)">
                <span class="text-sm">{{ formattedTime }}</span>
              </div>
              <div ref="barRight" class="flex pr-3 justify-end gap-2" @click="setRightOpen(true)">
                <UIcon name="i-fluent:bluetooth-24-regular" />
                <UIcon name="i-fluent:cellular-unavailable-24-regular" />
                <UIcon name="i-fluent:cellular-unavailable-24-regular" />
                <UIcon name="i-fluent:wifi-1-24-regular" />
                <UIcon name="i-fluent:battery-10-32-regular" />
              </div>
            </div>
          </slot>
        </header>
        <div :class="phoneLayoutUI.content({ class: [currentApp?.ui?.phoneLayout?.content] })">
          <slot />
        </div>
        <footer :class="phoneLayoutUI.footer({ class: [currentApp?.ui?.phoneLayout?.footer] })">
          <UButton icon="i-heroicons-arrow-left" variant="ghost" @click="gotoBack()" />
          <UButton icon="i-heroicons-home" variant="ghost" @click="gotoHome()" />
          <UButton icon="i-heroicons-squares-2x2" variant="ghost" @click="gotoTasks()" />
        </footer>
      </div>
    </div>

    <div v-if="leftOpen" class="size-full absolute top-0 left-0 rounded-2xl overflow-hidden" @click="setLeftOpen(false)">
      <div class="size-full rounded-2xl bg-(--ui-bg)/30 backdrop-blur-lg" />
    </div>

    <div v-if="rightOpen" class="size-full absolute top-0 left-0 rounded-2xl overflow-hidden" @click="setRightOpen(false)">
      <div class="size-full rounded-2xl bg-(--ui-bg)/30 backdrop-blur-lg" />
    </div>
  </div>
</template>
