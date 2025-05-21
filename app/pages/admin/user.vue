<script lang="tsx" setup>
import type { TableColumn } from '@nuxt/ui'
import type { User, UserCreate } from '~/types/models'
import { UAvatar, UBadge } from '#components'
import dayjs from '~/utils/dayjs'

const userModal = ref(false)
const userModalStatus = ref<'create' | 'edit'>('create')

function setUserModal(status: 'create' | 'edit') {
  userModal.value = true
  userModalStatus.value = status
}

const { $api } = useNuxtApp()
const { data } = useApi('/v1/admin/config/users')

const userModalData = ref<UserCreate>({
  name: undefined,
  username: '',
  password: '',
  avatar: undefined,
  role: 'user',
})

const userModalLoading = ref(false)

async function createUser() {
  userModalLoading.value = true
  try {
    await $api('/v1/admin/config/users', {
      method: 'POST',
      body: userModalData.value,
    })
  }
  finally {
    userModalLoading.value = false
  }
}

function updateUser() {

}

const columns: TableColumn<User>[] = [
  {
    accessorKey: 'username',
    header: '用户',
    cell: ({ row }) => (
      <div class="flex items-center gap-3">
        <UAvatar
          src={row.original.avatar}
          size="lg"
        />
        <div>
          <p class="font-medium text-(--ui-text-highlighted)">{row.original.name}</p>
          <p>
            @
            {row.original.username}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => dayjs(row.original.created_at).utc().format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    accessorKey: 'role',
    header: '角色',
    cell: ({ row }) => {
      const color = {
        user: ['用户', 'warning'] as const,
        admin: ['管理员', 'success'] as const,
        super_admin: ['超级管理员', 'error'] as const,
      }[row.getValue<User['role']>('role')]

      return (
        <UBadge class="capitalize" variant="subtle" color={color[1]}>
          {color[0]}
        </UBadge>
      )
    },
  },
]
</script>

<template>
  <div>
    <div class="flex justify-end">
      <UButton icon="i-lucide-plus" @click="setUserModal('create')">
        添加用户
      </UButton>
    </div>
    <UTable :data="data ?? undefined" :columns="columns" class="flex-1 select-text" />
    <UModal
      v-model:open="userModal"
      :dismissible="false"
    >
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-bold">
              {{ userModalStatus === 'create' ? '添加用户' : '编辑用户' }}
            </h2>
          </template>
          <UForm :state="userModalData" class="p-4 gap-4">
            <UFormField label="用户名" name="username" required>
              <UInput v-model="userModalData.username" class="w-full" />
            </UFormField>
            <UFormField label="密码" name="password" required>
              <UInput v-model="userModalData.password" class="w-full" type="password" />
            </UFormField>
            <UFormField label="角色" name="role" required>
              <USelect v-model="userModalData.role" :items="['user', 'admin']" class="w-full" />
            </UFormField>
            <UFormField label="姓名" name="name">
              <UInput v-model="userModalData.name" :placeholder="userModalData.username" class="w-full" />
            </UFormField>
            <UFormField label="头像" name="avatar">
              <UInput type="file" class="w-full" />
            </UFormField>
          </UForm>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton @click="userModal = false">
                取消
              </UButton>
              <UButton v-if="userModalStatus === 'create'" :loading="userModalLoading" @click="createUser()">
                创建
              </UButton>
              <UButton v-else :loading="userModalLoading" @click="updateUser()">
                保存
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<style>

</style>
