<script lang="ts" setup>
import * as v from 'valibot'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref(false)

const formState = reactive({
  username: '',
  password: '',
})

const schema = v.object({
  username: v.pipe(v.string(), v.nonEmpty('用户名不能为空'), v.minLength(1, '用户名太短'), v.maxLength(16, '用户名太长')),
  password: v.pipe(v.string(), v.nonEmpty('密码不能为空'), v.minLength(4, '密码太短'), v.maxLength(32, '密码太长')),
})

async function handleLogin() {
  if (!formState.username || !formState.password) {
    toast.add({
      title: '错误',
      description: '请输入用户名和密码',
      color: 'error',
    })
    return
  }

  loading.value = true
  try {
    await useStore().login(formState.username, formState.password)
    const redirectPath = route.query.redirect || '/'

    router.push(redirectPath as string)

    toast.add({
      title: '成功',
      description: '登录成功，正在跳转...',
      color: 'success',
    })
  }
  catch (error: unknown) {
    console.dir(error)
    if (error instanceof Error) {
      toast.add({
        title: '登录失败',
        description: error.message,
        color: 'error',
        icon: 'i-heroicons-exclamation-triangle',
      })
    }
    else {
      toast.add({
        title: '登录失败',
        description: '用户名或密码错误，请重试',
        color: 'error',
      })
    }
  }
  finally {
    loading.value = false
  }
}

useSeoMeta({
  title: '登录 - SoulNetOS',
})
</script>

<template>
  <div class="flex h-dvh w-dvw items-center justify-center bg-(--ui-bg-muted)">
    <div class="w-full max-w-md rounded-xl bg-(--ui-bg) p-8 shadow-lg">
      <div class="mb-6 text-center">
        <h1 class="text-3xl font-bold text-(--ui-text-highlighted)">
          SoulNetOS
        </h1>
        <p class="mt-2 text-(--ui-text-muted)">
          请登录您的账号
        </p>
      </div>

      <UForm :state="formState" :schema="schema" class="space-y-4" @submit="handleLogin">
        <UFormField label="用户名" name="username">
          <UInput v-model="formState.username" placeholder="请输入用户名" class="w-full" />
        </UFormField>

        <UFormField label="密码" name="password">
          <UInput v-model="formState.password" type="password" placeholder="请输入密码" class="w-full" />
        </UFormField>

        <div class="pt-4">
          <UButton type="submit" color="primary" block :loading="loading">
            登录
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<style>

</style>
