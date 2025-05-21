import { defineStore } from 'pinia'

type PersonalizedState = 'virtual' | 'physical'

interface Personalized {
  background: { [key in PersonalizedState]?: string | null }
  wallpaper: { [key in PersonalizedState]?: string | null }
}

export const useSoulnet = defineStore('SoulnetStore', {
  state: () => ({
    state: 'virtual' as PersonalizedState,
    personalized: {
      background: {},
      wallpaper: {},
    } as Personalized,
  }),
  getters: {
    getPersonalized: (state) => {
      return {
        background: state.personalized.background[state.state],
        wallpaper: state.personalized.wallpaper[state.state],
      }
    },
  },
  actions: {
    setState(state?: 'virtual' | 'physical') {
      if (!state)
        state = this.state === 'virtual' ? 'physical' : 'virtual'
      const checkPrimaryColor = () => {
        this.state = state
        const appConfig = useAppConfig()
        appConfig.ui.colors.primary = this.state === 'virtual' ? 'blue' : 'rose'
        window.localStorage.setItem('nuxt-ui-primary', appConfig.ui.colors.primary)
      }

      if (!document.startViewTransition)
        checkPrimaryColor()
      else
        document.startViewTransition(checkPrimaryColor)
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})
