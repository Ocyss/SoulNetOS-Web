<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'
import { ClipboardAddon } from '@xterm/addon-clipboard'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { WebglAddon } from '@xterm/addon-webgl'
import { Terminal } from '@xterm/xterm'
import { ref } from 'vue'
import { Readline } from 'xterm-readline'
import '@xterm/xterm/css/xterm.css'

const terminal = useTemplateRef('terminal')
const term = ref<Terminal | null>(null)
const store = useStore()
const runtimeConfig = useRuntimeConfig()
const commandCallback = new Map<string, [(content: string) => void, (chunk: string) => void]>()

const fitAddon = new FitAddon()
const rl = new Readline()

const { status, open, send, ws } = useWebSocket(`${runtimeConfig.public.openFetch.api.baseURL}/v1/admin/terminal`, {
  immediate: false,
  heartbeat: {
    message: 'ping',
    interval: 3000,
    pongTimeout: 1000,
  },
  autoReconnect: false,
})

useResizeObserver(terminal, () => {
  fitAddon.fit()
})

async function sendCommand(cmd: string) {
  switch (cmd) {
    case '':
      rl.println('请输入命令, help 查看帮助')
      return
    case 'clear':
      term.value?.clear()
      return
    case 'history':
    {
      const history: string[] = JSON.parse(localStorage.getItem('history') || '[]')
      if (history.length > 0) {
        rl.println(`历史记录\n${history.slice(0, 10).map((item, index) => `${history.length - index}  ${item.replaceAll('\n', '\\n')}`).reverse().join('\n')}`)
      }
      else {
        rl.println('暂无历史记录')
      }
      return
    }
  }
  if (cmd === 'help') {
    rl.println(`Client Commands:${[
      '',
      'history 查看历史记录',
      'clear 清空终端',
    ].join('\n  ')}\n`)
  }

  const id = Date.now().toString()
  return new Promise((resolve) => {
    send(JSON.stringify({
      id,
      command: cmd,
    }))
    commandCallback.set(id, [(content: string) => {
      rl.println(content)
      term.value?.focus()
      resolve(void 0)
    }, (chunk: string) => {
      if (chunk === 'soulnet:end') {
        rl.println('')
        term.value?.focus()
        resolve(void 0)
        return
      }
      rl.write(chunk)
    }])
  })
}

function initTerm() {
  term.value = new Terminal({
    fontSize: 14,
    fontFamily: 'monospace',
    cursorBlink: true,
    cursorStyle: 'bar',
    theme: {
      background: '#181d28',
      foreground: '#f8f8f8',
    },
  })
  const clipboardAddon = new ClipboardAddon()
  const addon = new WebglAddon()

  term.value.loadAddon(rl)
  term.value.loadAddon(fitAddon)
  term.value.loadAddon(new WebLinksAddon())
  term.value.loadAddon(clipboardAddon)
  term.value.loadAddon(addon)

  addon.onContextLoss(() => {
    addon.dispose()
  })

  if (!terminal.value) {
    return
  }
  term.value.open(terminal.value)
  fitAddon.fit()

  rl.setCheckHandler((text) => {
    const trimmedText = text.trimEnd()
    if (trimmedText.endsWith('&&')) {
      return false
    }
    return true
  })
}

function readLine() {
  rl.read('\x1B[01;34msoulnet\x1B[0m \x1B[01;32m>>\x1B[0m ')
    .then(async (text: string) => {
      if (status.value !== 'OPEN') {
        open()
        setTimeout(readLine)
        return
      }
      console.log('processLine - text: %s', text)
      await sendCommand(text)
      setTimeout(readLine)
    })
}

useEventListener(ws, 'open', () => {
  const message = {
    token: store.token,
    tunnelId: crypto.randomUUID(),
  }
  send(JSON.stringify(message))
})

useEventListener(ws, 'message', (message: MessageEvent) => {
  if (message.data === 'pong') {
    return
  }
  const data = JSON.parse(message.data)
  switch (data.type) {
    case 'ready':
      rl.println(data.message)
      readLine()
      break
    case 'output':
      commandCallback.get(data.id)?.[0](data.content)
      break
    case 'stream':
      commandCallback.get(data.id)?.[1](data.content)
      break
  }
})

useEventListener(ws, 'error', (event: Event) => {
  let message = 'disconnected'
  if (event instanceof ErrorEvent && event.message) {
    message = event.message
  }
  rl.println(`\x1B[31m${message}\x1B[m\r\n`)
})

onMounted(() => {
  initTerm()
  open()
})
</script>

<template>
  <div id="terminal" ref="terminal" />
</template>

<style>
.terminal {
  padding: 8px;
}

.terminal .xterm-viewport {
  overflow-y: auto;
}
</style>
