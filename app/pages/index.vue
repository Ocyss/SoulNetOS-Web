<script lang="ts" setup>
import type { DesktopAppItem } from '~/types/app'

const currentSlide = ref(0)
const { ready: currentSlideReady, start: currentSlideStart } = useTimeout(500, { controls: true })
const container = useTemplateRef('container')
const { launchApp } = useAppTask()
const desktopGrid = useTemplateRef('desktopGrid')
const { pressed: isDragging } = useMousePressed({ target: desktopGrid })

const startX = ref(0)
const dragOffset = ref(0)
const dragData = ref<number>()

const desktopGridPages: DesktopAppItem[][] = [
  [
    { key: 'os.clock', type: 'widget', position: { x: 0, y: 0, width: 4, height: 2 } },
    { key: 'os.weather', type: 'widget', position: { x: 0, y: 2, width: 2, height: 2 } },
    { key: 'os.contacts', type: 'app', position: { x: 0, y: 4 } },
    { key: 'os.map', type: 'app', position: { x: 0, y: 5 } },
    { key: 'os.browser', type: 'app', position: { x: 1, y: 5 } },
    { key: 'os.photo', type: 'app', position: { x: 3, y: 3 } },
    { key: 'os.settings', type: 'app', position: { x: 3, y: 5 } },
    { key: 'os.calendar', type: 'app', position: { x: 2, y: 2 } },
    { key: 'os.store', type: 'app', position: { x: 3, y: 4 } },
    { key: 'os.roles', type: 'app', position: { x: 2, y: 5 } },
    { key: 'os.weather', type: 'app', position: { x: 3, y: 2 } },
  ],
  [
    { key: 'os.photo/hash', type: 'widget', position: { x: 0, y: 0, width: 2, height: 3 } },
  ],
  [
    { key: 'os.photo/hash', type: 'widget', position: { x: 0, y: 0, width: 2, height: 3 } },
  ],
  [
    { key: 'os.photo/hash', type: 'widget', position: { x: 0, y: 0, width: 2, height: 3 } },
  ],
]

const dockAppItems: DesktopAppItem[] = [
  { key: 'os.phone', type: 'app' },
  { key: 'os.message', type: 'app' },
  { key: 'os.chat', type: 'app' },
  { key: 'os.soulnet', type: 'app' },
]

function desktopGridMouseHandler(event: MouseEvent | TouchEvent) {
  let x = 0
  if (event instanceof TouchEvent) {
    x = event.touches[0]?.clientX ?? 0
  }
  else {
    x = event.movementX
  }
  if (startX.value === 0) {
    startX.value = x
  }
  else {
    dragOffset.value = x - startX.value
  }
}

const desktopGridEvent: (() => void)[] = []

watch(isDragging, (value) => {
  if (value) {
    dragData.value = Date.now()
    const listenerOptions = { passive: true }
    desktopGridEvent.push(useEventListener(desktopGrid, ['mousemove', 'dragover'], desktopGridMouseHandler, listenerOptions))
    desktopGridEvent.push(useEventListener(desktopGrid, ['touchstart', 'touchmove'], desktopGridMouseHandler, listenerOptions))
  }
  else {
    startX.value = 0
    desktopGridEvent.forEach((event) => {
      event()
    })
    desktopGridEvent.length = 0
    finishDrag()
  }
})

function finishDrag() {
  if (!desktopGrid.value || !dragData.value) {
    return
  }
  const dragTime = (Date.now() - dragData.value) / 1000
  const threshold = desktopGrid.value.clientWidth * Math.min(0.5, dragTime)
  const absOffset = Math.abs(dragOffset.value)
  if (absOffset > threshold) {
    if (dragOffset.value < 0) {
      if (currentSlide.value === desktopGridPages.length - 1) {
        currentSlide.value = 0
      }
      else {
        currentSlide.value++
      }
    }
    else {
      if (currentSlide.value === 0) {
        currentSlide.value = desktopGridPages.length - 1
      }
      else {
        currentSlide.value--
      }
    }
  }
  dragOffset.value = 0
}

function changeSlide(delta: number) {
  if (!currentSlideReady.value) {
    return
  }
  const newIndex = currentSlide.value + delta
  if (newIndex >= 0 && newIndex < desktopGridPages.length) {
    currentSlide.value = newIndex
  }
  else {
    currentSlide.value = delta > 0 ? 0 : desktopGridPages.length - 1
  }
  currentSlideStart()
}

useEventListener(container, 'wheel', (e) => {
  e.preventDefault()

  if (e.deltaX > 50 || e.deltaY > 50) {
    changeSlide(1)
  }
  else if (e.deltaX < -50 || e.deltaY < -50) {
    changeSlide(-1)
  }
})
</script>

<template>
  <div ref="container" class="w-full h-full touch-pan-y bg-(--ui-bg) flex flex-col overflow-hidden">
    <div class="flex-1 overflow-hidden">
      <div
        ref="desktopGrid"
        class="flex h-full w-full touch-pan-x transition-transform duration-300 ease-out"
        :style="{
          transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,

        }"
      >
        <div
          v-for="(pageItems, pageIndex) in desktopGridPages"
          :key="pageIndex"
          class="h-full w-full flex-shrink-0 pb-2 pt-4 px-6 overflow-hidden"
        >
          <div class="grid h-full grid-cols-4 grid-rows-6 gap-3">
            <DesktopApp
              v-for="appItem in pageItems"
              :key="appItem.key"
              :app-item="appItem"
              @click="(appKey) => launchApp(appKey)"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center gap-2 py-2">
      <button
        v-for="i in desktopGridPages.length"
        :key="i"
        class="size-2 rounded-full transition-colors"
        :class="currentSlide === i - 1 ? 'bg-(--ui-primary)' : 'bg-(--ui-border)'"
        aria-label="切换到页面"
        @click="currentSlide = i - 1"
      />
    </div>

    <div class="flex items-center justify-between bg-(--ui-bg-elevated)/30 backdrop-blur-sm border-t border-(--ui-border) px-6 py-3">
      <DesktopApp
        v-for="appItem in dockAppItems"
        :key="appItem.key"
        :app-item="appItem"
        @click="(appKey) => launchApp(appKey)"
      />
    </div>
  </div>
</template>
