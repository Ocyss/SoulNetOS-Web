<script lang="tsx" setup>
import { UButton } from '#components'
import { tv } from 'tailwind-variants'
import { appSymbol } from '~/types/keys'

const apps = useApps()
const currentApp = inject(appSymbol, undefined)

const phoneLayoutUI = tv({
  slots: {
    root: `relative mx-auto h-full w-full flex flex-col justify-around items-center bg-(--ui-bg) overflow-hidden rounded-2xl transition-all duration-300`,
    statusBar: 'bg-(--ui-bg-elevated)/40 z-30 h-8 relative w-full pt-1',
    content: 'flex-1 overflow-hidden flex relative w-full',
    footer: 'h-13 flex items-center justify-center space-x-15 bg-(--ui-bg-elevated)/20 w-full',
  },
})()

const layoutProps = useAttrs() as {
  ui?: {
    root?: string
    statusBar?: string
    content?: string
    footer?: string
  }
}

const rootRef = useTemplateRef('rootRef')
const phoneLayout = useTemplateRef('phoneLayout')
const phoneMain = useTemplateRef('phoneMain')
const consoleRef = useTemplateRef('consoleRef')
const leftOpen = ref(false)
const rightOpen = ref(false)

const phoneRatio = [20, 9] as const

const isShowConsole = ref(true)

useResizeObserver([phoneLayout, rootRef], (entries) => {
  const entry = entries[0]
  if (!entry || !phoneLayout.value) {
    return
  }
  const { height } = entry.contentRect
  const width = height / phoneRatio[0] * phoneRatio[1]
  phoneLayout.value.style.maxWidth = `${width}px`

  const style = window.getComputedStyle(phoneLayout.value)
  if (style.marginRight < '300px') {
    isShowConsole.value = false
  }
  else {
    isShowConsole.value = true
    if (consoleRef.value) {
      consoleRef.value.style.marginLeft = `${width / 2}px`
      consoleRef.value.style.width = style.marginRight
    }
  }
})

const soulnet = useSoulnet()

const upa = useUpaNotify()

onMounted(() => {
  upa.init()
  window.upa = upa
})
</script>

<template>
  <div
    ref="rootRef"
    class="h-full w-full p-1 md:p-3 flex flex-row" :style="{
      backgroundImage: soulnet.getPersonalized.background ? `url(${soulnet.getPersonalized.background})` : undefined,
    }"
  >
    <div
      ref="phoneLayout"
      :class="phoneLayoutUI.root({ class: [currentApp?.ui?.phoneLayout?.root, layoutProps.ui?.root] })"
    >
      <div class="shadow-[inset_0_4px_8px_0_var(--ui-bg)] z-100 absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none" />
      <div ref="phoneMain" class="flex flex-col relative w-full h-full rounded-2xl overflow-hidden">
        <header :class="phoneLayoutUI.statusBar({ class: [currentApp?.ui?.phoneLayout?.statusBar, layoutProps.ui?.statusBar] })">
          <DeviceViewHeader v-model:left-open="leftOpen" v-model:right-open="rightOpen" />
        </header>
        <div
          :class="phoneLayoutUI.content({ class: [currentApp?.ui?.phoneLayout?.content, layoutProps.ui?.content] })"
        >
          <slot />
        </div>
        <footer :class="phoneLayoutUI.footer({ class: [currentApp?.ui?.phoneLayout?.footer, layoutProps.ui?.footer] })">
          <UButton icon="i-heroicons-arrow-left" variant="ghost" @click="apps.gotoBack()" />
          <UButton icon="i-heroicons-home" variant="ghost" @click="apps.gotoHome()" />
          <UButton icon="i-heroicons-squares-2x2" variant="ghost" @click="apps.gotoTasks()" />
        </footer>
      </div>
      <DeviceViewLeft v-model:open="leftOpen" />
      <DeviceViewRight v-model:open="rightOpen" />
    </div>
    <div
      v-if="isShowConsole"
      ref="consoleRef" class="absolute pl-3 py-3 h-full -my-3 left-1/2 transition-all duration-300" :class="{
        'static ml-5': !true,
      }"
    >
      <DeviceViewConsole />
    </div>
  </div>
</template>
