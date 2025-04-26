import { notificationRegistry } from '~/apps'
import NText from './NText.vue'

export const systemNotification = {
  text: NText,
}

export const notification = computed(() => {
  return {
    ...systemNotification,
    ...notificationRegistry.value,
  }
})
