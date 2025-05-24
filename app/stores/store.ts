import type { BaseInfo, EntityPublic, User } from '~/types/models'
import { defineStore } from 'pinia'

export const useStore = defineStore('Store', {
  state: () => ({
    token: '',
    user: null as User | null,
    entitys: {} as Record<number, EntityPublic>,
    infos: {} as Record<number, BaseInfo>,
    info_names: {} as Record<string, number>,
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
      }, {} as Record<number, EntityPublic>)
    },
    async fetchEntitysState() {
      if (!this.token)
        return
      const { $api } = useNuxtApp()
      const res = await $api('/v1/entitys/state')
      for (const state of Object.values(res)) {
        const entity = this.entitys[state.id]
        if (entity)
          entity.state = state
      }
    },
    async fetchInfos() {
      if (!this.token)
        return
      const { $api } = useNuxtApp()
      const res = await $api('/v1/infos')
      const [infos, info_names] = Object.values(res).reduce((acc, info) => {
        acc[0][info.id] = info
        acc[1][info.name] = info.id
        return acc
      }, [{}, {}] as [Record<number, BaseInfo>, Record<string, number>])
      this.infos = infos
      this.info_names = info_names
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
