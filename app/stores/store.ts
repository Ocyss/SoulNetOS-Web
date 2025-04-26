import type { BaseInfo, EntityPublic, User } from '~/types/models'
import { defineStore } from 'pinia'

export const useMyStore = defineStore('myStore', {
  state: () => ({
    token: '',
    user: null as User | null,
    entitys: {} as Record<string, EntityPublic>,
    infos: {} as Record<string, BaseInfo>,
  }),
  actions: {
    async fetchEntitys() {
      if (!this.token)
        return
      const { $api } = useNuxtApp()
      const res = await $api('/v1/entitys')
      this.entitys = res.reduce((acc, entity) => {
        acc[entity.entity.id] = entity
        return acc
      }, {} as Record<string, EntityPublic>)
    },
    async fetchEntitysState() {
      if (!this.token)
        return
      const { $api } = useNuxtApp()
      const res = await $api('/v1/entitys/state')
      for (const [key, value] of Object.entries(res)) {
        if (!this.entitys[key])
          continue
        this.entitys[key].state = value
      }
    },
    async fetchInfos() {
      if (!this.token)
        return
      const { $api } = useNuxtApp()
      const res = await $api('/v1/infos')
      this.infos = res
    },
    async fetchUser() {
      if (!this.token)
        return
      const { $api } = useNuxtApp()
      const res = await $api('/v1/user')
      this.user = res
    },
    async login(username: string, password: string) {
      const { $api } = useNuxtApp()
      const res = await $api('/v1/login', {
        method: 'POST',
        body: new URLSearchParams({
          username,
          password,
          scope: 'login',
        }) as never,
        handleOptions: {
          message: false,
        },
      })
      if (res && res.access_token) {
        this.token = res.access_token
      }
    },
  },
  persist: [
    { pick: ['entitys', 'user', 'infos'], storage: piniaPluginPersistedstate.sessionStorage() },
    { pick: ['token'], storage: piniaPluginPersistedstate.localStorage() },
  ],
})
