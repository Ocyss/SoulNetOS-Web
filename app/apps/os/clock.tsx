import { useOsDate } from '~/composables/useDate'

const packageName = 'os.clock'

export default defineApp({
  package: packageName,
  name: '时钟',
  icon: 'i-lucide-clock',
  page: defineComponent({
    setup() {
      return () => <div>时钟</div>
    },
  }),
  widget: defineComponent({
    setup() {
      const { date, isSynced, timeScale } = useOsDate()
      const formattedTime = computed(() => {
        const currentDate = date.value
        const hours = currentDate.hour.toString().padStart(2, '0')
        const minutes = currentDate.minute.toString().padStart(2, '0')
        return `${hours}:${minutes}`
      })
      return () => {
        if (isSynced.value) {
          return (
            <div class="flex flex-col items-center justify-center p-3 font-mono rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 shadow-md">
              <div class="text-sm text-slate-400 mb-1 font-light tracking-wider">1</div>
              <div class="text-xl font-bold text-white tracking-wide">{formattedTime.value}</div>
            </div>
          )
        }

        return (
          <div class="flex flex-col items-center justify-center p-3 font-mono rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 shadow-md relative">
            <div class="text-xl font-bold text-white tracking-wide">{formattedTime.value}</div>
            {timeScale.value !== 1 && (
              <div class="absolute top-1 right-2 text-xs text-emerald-400 font-medium">
                {timeScale.value}
                x
              </div>
            )}
          </div>
        )
      }
    },
  }),
})
